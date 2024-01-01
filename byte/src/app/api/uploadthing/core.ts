import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { getPineconeClient } from "@/lib/pinecone";

// Create an upload handler using 'uploadthing'
const f = createUploadthing();

// Middleware to authenticate user and retrieve their ID
const middleware = async () => {
  const { getUser } = getKindeServerSession();
  const user = getUser();
  if (!user || !user.id) throw new Error("Unauthorized");

  return { userId: user.id };
};

// Handler for processing the file after upload is complete
const onUploadComplete = async ({
  metadata,
  file,
}: {
  metadata: Awaited<ReturnType<typeof middleware>>;
  file: {
    key: string;
    name: string;
    url: string;
  };
}) => {
  // Check if the file has already been uploaded
  const isFileExist = await db.file.findFirst({
    where: { key: file.key },
  });
  if (isFileExist) return;

  // Create a new file record in the database
  const createdFile = await db.file.create({
    data: {
      key: file.key,
      name: file.name,
      userId: metadata.userId,
      url: `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`,
      uploadStatus: "PROCESSING",
    },
  });

  try {
    // Fetch the file content from the storage
    const response = await fetch(createdFile.url);
    const blob = await response.blob();

    // Set up embeddings for document analysis
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY || "",
    });

    console.log("embeddings ", embeddings);

    // Initialize Pinecone for vector storage
    const pinecone = await getPineconeClient();
    const pineconeIndex = pinecone.Index("byte");

    console.log("pinecone Index", pineconeIndex);

    // Determine the document type and load the content
    let documentsToEmbed: any = [];
    if (file.name.endsWith(".pdf")) {
      const loader = new PDFLoader(blob);
      documentsToEmbed = await loader.load();
    } else if (file.name.endsWith(".csv")) {
      const loader = new CSVLoader(blob);
      documentsToEmbed = await loader.load();
    }
    console.log("decuments to embed", documentsToEmbed);
    // Embed and store the document content if valid
    if (documentsToEmbed.length > 0) {
      await PineconeStore.fromDocuments(documentsToEmbed, embeddings, {
        pineconeIndex,
        namespace: createdFile.id,
      });

      console.log(
        "pinecone embeddings",
        await PineconeStore.fromDocuments(documentsToEmbed, embeddings, {
          pineconeIndex,
          namespace: createdFile.id,
        })
      );
      // Update the file status to SUCCESS
      await db.file.update({
        where: { id: createdFile.id },
        data: { uploadStatus: "SUCCESS" },
      });
    } else {
      throw new Error("No valid documents to embed");
    }
  } catch (err) {
    console.error("Error processing file:", err);
    // Update the file status to FAILED in case of an error
    await db.file.update({
      where: { id: createdFile.id },
      data: { uploadStatus: "FAILED" },
    });
  }
};

// Configuring and exporting the file router
export const ourFileRouter = {
  fileUploader: f({
    pdf: { maxFileSize: "32MB" },
    "text/csv": { maxFileSize: "32MB" },
  })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
