import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { privateProcedure, publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { z } from "zod";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";

export const appRouter = router({
  authCallback: publicProcedure.query(async () => {
    const { getUser } = getKindeServerSession();
    const user = getUser();

    if (!user.id || !user.email) throw new TRPCError({ code: "UNAUTHORIZED" });

    // check if the user is in the database
    const dbUser = await db.user.findFirst({
      where: {
        id: user.id,
      },
    });

    if (!dbUser) {
      // create user in db
      await db.user.create({
        data: {
          id: user.id,
          email: user.email,
        },
      });
    }

    return { success: true };
  }),

  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    return await db.file.findMany({
      where: {
        userId,
      },
    });
  }),

  getFileMessages: privateProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        fileId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { fileId, cursor } = input;
      const limit = input.limit ?? INFINITE_QUERY_LIMIT;

      const file = await db.file.findFirst({
        where: {
          id: fileId,
          userId,
        },
      });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      const messages = await db.message.findMany({
        take: limit + 1,
        where: {
          fileId,
        },
        orderBy: {
          createdAt: "desc",
        },
        cursor: cursor ? { id: cursor } : undefined,
        select: {
          id: true,
          isUserMessage: true,
          createdAt: true,
          text: true,
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (messages.length > limit) {
        const nextItem = messages.pop();
        nextCursor = nextItem?.id;
      }

      return {
        messages,
        nextCursor,
      };
    }),

  getFileUploadStatus: privateProcedure
    .input(z.object({ fileId: z.string() }))
    .query(async ({ input, ctx }) => {
      const file = await db.file.findFirst({
        where: {
          id: input.fileId,
          userId: ctx.userId,
        },
      });

      if (!file) return { status: "PENDING" as const };

      return { status: file.uploadStatus };
    }),

  getFile: privateProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const file = await db.file.findFirst({
        where: {
          key: input.key,
          userId,
        },
      });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      return file;
    }),

  deleteFile: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const file = await db.file.findFirst({
        where: {
          id: input.id,
          userId,
        },
      });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      await db.file.delete({
        where: {
          id: input.id,
        },
      });

      return file;
    }),

  summarizeText: privateProcedure
    .input(
      z.object({
        fileId: z.string(),
        url: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { fileId, url } = input;
      const userId = ctx.userId;
      const MAX_LENGTH = 1000; // Set your maximum length here

      // Fetch the summary task ID from the Python backend
      const startResponse = await fetch("http://127.0.0.1:8000/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url }),
      });

      if (!startResponse.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to start summary processing.",
        });
      }

      const { task_id } = await startResponse.json();

      // Poll the status endpoint until the summary is complete
      let summary = null;
      while (!summary) {
        const statusResponse = await fetch(
          `http://127.0.0.1:8000/status/${task_id}`
        );
        if (!statusResponse.ok) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to check summary status.",
          });
        }

        const statusData = await statusResponse.json();
        if (statusData.status.startsWith("Completed")) {
          summary = statusData.status.replace("Completed: ", "");
        } else if (statusData.status.startsWith("Failed")) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Summary processing failed.",
          });
        }

        // Wait for a short period before polling again
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }

      // Check if the summary is within the permissible length
      if (summary.length <= MAX_LENGTH) {
        // Save the summary to the database
        const newSummary = await db.summary.create({
          data: {
            text: summary,
            fileId,
            userId,
          },
        });

        return newSummary;
      } else {
        console.log("summary", summary);
        // Summary is too long to save in the database, just return it
        return { summary: summary, fileId, userId, isTooLong: true };
      }
    }),

  // New Procedure: Get Summaries
  getSummaries: privateProcedure
    .input(
      z.object({
        fileId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.userId;
      const { fileId } = input;

      return await db.summary.findMany({
        where: {
          userId,
          fileId,
        },
      });
    }),
});

export type AppRouter = typeof appRouter;
