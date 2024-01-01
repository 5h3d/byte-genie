import React, { useEffect, useState, useCallback } from "react";
import Papa from "papaparse";
import { pdfjs } from "react-pdf";
import { trpc } from "@/app/_trpc/client";
import Message from "./Message";
import { ExtendedMessage } from "@/types/message";
import { Loader2 } from "lucide-react";
import EmptyChat from "../EmptyChat";
import { useToast } from "../ui/use-toast";

interface SummaryWrapperProps {
  url: string;
  fileId: string;
}

const SummaryWrapper: React.FC<SummaryWrapperProps> = ({ url, fileId }) => {
  const { toast } = useToast();

  const [loading, setLoading] = useState<boolean>(true);
  const [textToSummarize, setTextToSummarize] = useState<string>("");
  const [existingSummary, setExistingSummary] = useState<ExtendedMessage[]>([]);

  const summarizeMutation = trpc.summarizeText.useMutation();
  const { data: fetchedSummaries, isLoading: summariesLoading } =
    trpc.getSummaries.useQuery({ fileId });

  useEffect(() => {
    if (fetchedSummaries && fetchedSummaries.length > 0) {
      const summariesAsMessages = fetchedSummaries.map((summary) => ({
        id: summary.id,
        createdAt: summary.createdAt,
        isUserMessage: false,
        text: summary.text,
      }));
      setExistingSummary(summariesAsMessages);
    } else {
      setExistingSummary([]);
    }
  }, [fetchedSummaries]);

  const sendForSummarization = useCallback(() => {
    setLoading(true);
    summarizeMutation.mutate(
      { fileId, textToSummarize },
      {
        onSuccess: (data) => {
          setLoading(false);
          const newSummary = {
            id: data.id,
            createdAt: new Date().toISOString(),
            isUserMessage: false,
            text: data.text,
          };
          setExistingSummary((prevSummaries) => [...prevSummaries, newSummary]);
        },
        onError: (error) => {
          setLoading(false);
          console.error("Error in summarization:", error.message);
        },
      }
    );
  }, [fileId, textToSummarize, summarizeMutation]);

  const fetchData = useCallback(async (): Promise<Response | null> => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response;
    } catch (e) {
      console.error(`Error fetching data: ${(e as Error).message}`);
      setLoading(false);
      return null;
    }
  }, [url]);

  const processCsv = useCallback(async (response: Response) => {
    const csvText = await response.text();
    Papa.parse(csvText, {
      header: true,
      complete: (result) => {
        const fullText = result.data.map((entry) => entry.text).join("\n\n");
        setTextToSummarize(fullText);
      },
    });
  }, []);

  const processPdf = useCallback(async (response: Response) => {
    const buffer = await response.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: buffer });
    const pdf = await loadingTask.promise;

    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const textItems = textContent.items.map((item) => item.str).join(" ");
      fullText += `${textItems}\n\n`;
    }

    setTextToSummarize(fullText);
  }, []);

  useEffect(() => {
    fetchData()
      .then((response) => {
        if (!response) return;

        if (url.endsWith(".csv")) {
          processCsv(response);
        } else if (url.endsWith(".pdf")) {
          processPdf(response);
        } else {
          toast({
            title: "Failed ✅",
            description: "Unsupported file type.",
            variant: "default",
          });
          console.log("Unsupported file type.");
        }
      })
      .finally(() => setLoading(false));
  }, [url, fetchData, processCsv, processPdf]);

  return (
    <div className="relative h-[calc(100vh-250px)] bg-zinc-50 lg:h-[calc(100vh-160px)] flex flex-col justify-between overflow-hidden">
      <div className="overflow-y-auto overflow-x-hidden flex-grow p-5 scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch">
        {existingSummary && existingSummary.length > 0 ? (
          existingSummary.map((summary, index) => (
            <div className="mt-5" key={summary.id}>
              <Message
                key={summary.id}
                message={summary}
                isNextMessageSamePerson={
                  index > 0 &&
                  existingSummary[index - 1].isUserMessage ===
                    summary.isUserMessage
                }
              />
            </div>
          ))
        ) : (
          <EmptyChat />
        )}
      </div>
      <div className="h-20 flex items-center justify-center">
        <button
          onClick={sendForSummarization}
          disabled={loading || summarizeMutation.isLoading}
          className="bg-primary hover:bg-red-900 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
        >
          {(loading || summarizeMutation.isLoading) && (
            <Loader2 className="animate-spin h-4 w-4" />
          )}
          Generate Summary
        </button>
      </div>
    </div>
  );
};

export default SummaryWrapper;
