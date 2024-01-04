import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";


// Function to handle POST requests
export async function POST(request: Request) {
  const { getUser } = getKindeServerSession();
  const user = getUser();

  const { id: userId } = user;

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { url, fileId } = await request.json();

  const MAX_LENGTH = 1000;

  const response = await fetch("http://127.0.0.1:8000/summarize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    console.error("Fetch error:", response.status);
    return new Response("Error in fetching summary", {
      status: response.status,
    });
  }

  const { summary } = await response.json();

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

    return new Response(JSON.stringify(newSummary), { status: 200 });
  }

  console.log("summary", summary);
  return new Response(JSON.stringify(summary), { status: 200 }); 
}


