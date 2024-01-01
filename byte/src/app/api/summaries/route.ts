import { db } from "@/db"; 
import { NextApiRequest, NextApiResponse } from "next";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Authenticate and get user details
  const { getUser } = getKindeServerSession();
  const user = getUser();
  const userId = user?.id;

  // Reject unauthorized requests
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (req.method === "GET") {
    // Fetching existing summaries
    const fileId = req.query.fileId as string;
    const previousSummaries = await db.summary.findMany({
      where: { userId, fileId },
    });
    res.status(200).json(previousSummaries);
  } else if (req.method === "POST") {
    // Creating a new summary
    const { fileId, textToSummarize } = req.body;

    const pythonBackendResponse = await fetch(process.env.PYTHON_BACKEND_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: textToSummarize }),
    });

    if (!pythonBackendResponse.ok) {
      res
        .status(500)
        .json({ message: "Error in fetching summary from backend" });
      return;
    }

    const summaryData = await pythonBackendResponse.json();
    const summary = summaryData.summary;

    // Save the summary to the database
    const newSummary = await db.summary.create({
      data: {
        text: summary,
        fileId,
        userId,
      },
    });

    res.status(200).json(newSummary);
  } else {
    // Handling unsupported methods
    res.setHeader("Allow", ["POST", "GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
