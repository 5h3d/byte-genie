import React, { useEffect, useState, useCallback } from "react";
import { trpc } from "@/app/_trpc/client";
import Message from "./Message";
import EmptyChat from "../EmptyChat";
import { Loader2 } from "lucide-react";
import { ExtendedMessage } from "@/types/message";
import { useToast } from "../ui/use-toast";

const POLLING_INTERVAL_MS = 15000; // Poll every 15 seconds

interface SummaryWrapperProps {
  url: string;
  fileId: string;
}

const SummaryWrapper: React.FC<SummaryWrapperProps> = ({ url, fileId }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [existingSummary, setExistingSummary] = useState<ExtendedMessage[]>([]);
  const toast = useToast();

  const summarizeMutation = trpc.summarizeText.useMutation();
  const getSummariesQuery = trpc.getSummaries.useQuery(
    { fileId },
    {
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (getSummariesQuery.data && getSummariesQuery.data.length > 0) {
      const summariesAsMessages = getSummariesQuery.data.map((summary) => ({
        id: summary.id,
        createdAt: summary.createdAt,
        isUserMessage: false,
        text: summary.text,
      }));
      setExistingSummary(summariesAsMessages);
    } else {
      setExistingSummary([]);
    }
  }, [getSummariesQuery.data]);

  const sendForSummarization = useCallback(() => {
    setLoading(true);
    summarizeMutation.mutate(
      { fileId, url },
      {
        onSuccess: (data) => {
          setLoading(false);
          const newSummary = {
            id: `temp-${new Date().toISOString()}`, // Temporary ID
            createdAt: new Date().toISOString(),
            isUserMessage: false,
            text: data.summary,
          };
          setExistingSummary((prevSummaries) => [...prevSummaries, newSummary]);

          if (data.isTooLong) {
            toast({
              title: "Summary Too Long",
              description:
                "The summary was too long to be saved to the database.",
              variant: "warning",
            });
          } else {
            getSummariesQuery.refetch(); // Refetch if the summary was successfully saved
          }
        },
        onError: (error) => {
          setLoading(false);
          toast({
            title: "Error",
            description:
              error.message || "Error generating summary, please try again",
            variant: "destructive",
          });
        },
      }
    );
  }, [fileId, url, summarizeMutation, getSummariesQuery, toast]);

  return (
    <div className="relative h-[calc(100vh-250px)] bg-zinc-50 lg:h-[calc(100vh-160px)] flex flex-col justify-between overflow-hidden">
      <div className="overflow-y-auto overflow-x-hidden flex-grow p-5 scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch">
        {existingSummary.length > 0 ? (
          existingSummary.map((summary, index) => (
            <div className="mt-5" key={summary.id}>
              <Message
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
