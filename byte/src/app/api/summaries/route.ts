import { db } from "@/db";
import { NextApiRequest, NextApiResponse } from "next";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

const document = [
  {
    pageContent:
      "text: Notes to the Financial Statements\npagenum: 100\ndoc_name: dairy-farm_ar2020pdf",
    metadata: { source: "blob", blobType: "text/csv", line: 1 },
  },
  {
    pageContent:
      "text: Forward foreign exchange contracts The contract amounts of the outstanding forward foreign exchange contracts at 31st December 2020 were US$761.6 million (2019: US$568.0 million).\npagenum: 100\ndoc_name: dairy-farm_ar2020pdf",
    metadata: { source: "blob", blobType: "text/csv", line: 2 },
  },
  {
    pageContent:
      "text: Interest rate swaps The notional principal amounts of the outstanding interest rate swap contracts were US$100.0 million at 31st December 2020, and the fixed interest rates relating to interest rate swaps at 0.39% per annum. The fair values of interest rate swaps were based on the estimated cash flows discounted at market rate at 2.4% per annum.\npagenum: 100\ndoc_name: dairy-farm_ar2020pdf",
    metadata: { source: "blob", blobType: "text/csv", line: 3 },
  },
  {
    pageContent:
      "text: The outstanding interest rate swaps contracts of an aggregate notional principal and contract amount of US$100.0 million at 31st December 2020 are impacted by the IBOR reform.\npagenum: 100\ndoc_name: dairy-farm_ar2020pdf",
    metadata: { source: "blob", blobType: "text/csv", line: 4 },
  },
  {
    pageContent:
      "text: Operating lease commitments for short-term and low-value asset leases which were due within one year amounted to US$3.1 million (2019: US$1.3 million).\npagenum: 100\ndoc_name: dairy-farm_ar2020pdf",
    metadata: { source: "blob", blobType: "text/csv", line: 5 },
  },
];

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
      body: JSON.stringify({ document }),
    });

    if (!pythonBackendResponse.ok) {
      res
        .status(500)
        .json({ message: "Error in fetching summary from backend" });
      return;
    }

    const summaryData = await pythonBackendResponse.json();
    const summary = summaryData.summary;

    console.log("response", pythonBackendResponse);
    console.log("summarydata", summaryData);
    // Save the summary to the database
    // const newSummary = await db.summary.create({
    //   data: {
    //     text: summary,
    //     fileId,
    //     userId,
    //   },
    // })

    // res.status(200).json(newSummary);
  } else {
    // Handling unsupported methods
    res.setHeader("Allow", ["POST", "GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
