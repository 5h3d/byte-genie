import { db } from "@/db";
import { openai } from "@/lib/openai";
import { getPineconeClient } from "@/lib/pinecone";
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { NextRequest } from "next/server";
import { OpenAIStream, StreamingTextResponse } from "ai";

export const POST = async (req: NextRequest) => {
  const body = await req.json();

  // Authenticate and get user details
  const { getUser } = getKindeServerSession();
  const user = getUser();

  const { id: userId } = user;

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Validate and parse the incoming message
  const { fileId, message } = SendMessageValidator.parse(body);

  // Check if the file associated with the message exists for the user
  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
  });

  if (!file) {
    return new Response("Not found", { status: 404 });
  }

  // Save the user's message to the database
  await db.message.create({
    data: {
      text: message,
      isUserMessage: true,
      userId,
      fileId,
    },
  });

  // Set up embeddings and vector store for similarity search
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });


  console.log('embeddings', embeddings)

  const pinecone = await getPineconeClient();
  const pineconeIndex = pinecone.Index("byte");

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    namespace: file.id,
  });

  

  console.log('vector store', vectorStore)

  // Perform vectorization and similarity search
  console.log("Query Message:", message);
  const vectorizedQuery = await embeddings.embedDocuments([message]);
  console.log("Vectorized Query:", vectorizedQuery);

  const results = await vectorStore.similaritySearch(message, 4);
  console.log("Similarity Search Results:", results);

  if (results.length === 0) {
    console.log(
      "No results found. Possible issues with indexing or query processing."
    );
  }

  // Retrieve and format previous messages for context
  const prevMessages = await db.message.findMany({
    where: {
      fileId,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 6,
  });

  const formattedPrevMessages = prevMessages.map((msg: any) => ({
    role: msg.isUserMessage ? "user" : "assistant",
    content: msg.text,
  }));

  // Generate a response using OpenAI's chat completions
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    temperature: 0,
    stream: true,
    messages: [
      {
        role: "system",
        content:
          "Use the following pieces of context to answer the users question. Be direct and don't reply with 'based on the context'",
      },
      {
        role: "user",
        content: `
          Previous conversation and context provided here.
          ${formattedPrevMessages
            .map((message: any) => {
              if (message.role === "user") return `User: ${message.content}\n`;
              return ` ${message.content}\n`;
            })
            .join("")}
          Context from similarity search results here.
          ${results.map((r) => r.pageContent).join("\n\n")}
          User input: ${message}
        `,
      },
    ],
  });

  // Stream the response back to the client
  const stream = OpenAIStream(response, {
    async onCompletion(completion) {
      // Save the completion (assistant's response) to the database
      await db.message.create({
        data: {
          text: completion,
          isUserMessage: false,
          fileId,
          userId,
        },
      });
    },
  });

  return new StreamingTextResponse(stream);
};
