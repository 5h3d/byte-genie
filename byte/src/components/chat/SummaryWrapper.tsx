import React, { useEffect, useState } from "react";
import Message from "./Message";
import { ExtendedMessage } from "@/types/message";
import EmptyChat from "../EmptyChat";
import { Loader2 } from "lucide-react";
import { trpc } from "@/app/_trpc/client";
import { useToast } from "../ui/use-toast";

interface SummaryWrapperProps {
  url: string;
  fileId: string;
}

interface Summary {
  id: string;
  createdAt: string;
  isUserMessage: boolean;
  text: string;
}

const SummaryWrapper = ({ url, fileId }: SummaryWrapperProps) => {
  const [summaries, setSummaries] = useState<ExtendedMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [showTimeoutToast, setShowTimeoutToast] = useState(false);

  const getSummariesQuery = trpc.getSummaries.useQuery(
    { fileId },
    {
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (getSummariesQuery.data && getSummariesQuery.data.length > 0) {
      const summariesAsMessages = getSummariesQuery.data.map(
        (summary: Summary) => ({
          id: summary.id,
          createdAt: summary.createdAt,
          isUserMessage: false,
          text: summary.text,
        })
      );
      setSummaries(summariesAsMessages);
    } else {
      setSummaries([]);
    }
  }, [getSummariesQuery.data]);

  const generateSummary = async () => {
    let timeout: NodeJS.Timeout;
    timeout = setTimeout(() => {
      setShowTimeoutToast(true);
    }, 30000);

    try {
      setLoading(true);
      const response = await fetch("/api/summaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, fileId }),
      });
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const newSummary = await response.json();

      setSummaries((prev) => [...prev, newSummary]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error generating summary. Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showTimeoutToast) {
      toast({
        title: "Generating Summary",
        description: "This may take a while. Please wait...",
        variant: "default",
      });
    }
  }, [showTimeoutToast, toast]);

  return (
    <div className="relative h-[calc(100vh-250px)] bg-zinc-50 lg:h-[calc(100vh-160px)] flex flex-col justify-between overflow-hidden">
      <div className="overflow-y-auto overflow-x-hidden flex-grow p-5 scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch">
        {getSummariesQuery.isLoading ? (
          <div className="flex-1 flex justify-center items-center flex-col mb-28 h-full">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <h3 className="font-semibold text-xl">Loading...</h3>
              <p className="text-zinc-500 text-sm">Loading summaries</p>
            </div>
          </div>
        ) : summaries.length > 0 ? (
          summaries.map((summary, index) => (
            <div className="mt-5" key={summary.id}>
              <Message
                message={summary}
                isNextMessageSamePerson={
                  index > 0 &&
                  summaries[index - 1].isUserMessage === summary.isUserMessage
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
          onClick={generateSummary}
          disabled={loading}
          className="bg-primary hover:bg-red-900 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
        >
          {loading && <Loader2 className="animate-spin h-4 w-4" />}
          Generate Summary
        </button>
      </div>
    </div>
  );
};

export default SummaryWrapper;
