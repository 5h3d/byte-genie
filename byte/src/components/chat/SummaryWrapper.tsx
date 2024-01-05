import React, { useEffect, useState, useRef } from "react";
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
  const websocket = useRef<WebSocket | null>(null);
  const delayedToastTimeout = useRef<NodeJS.Timeout | null>(null);

  const getSummariesQuery = trpc.getSummaries.useQuery(
    { fileId },
    { refetchOnWindowFocus: false }
  );

  useEffect(() => {
    if (getSummariesQuery.data && getSummariesQuery.data.length > 0) {
      const existingSummaries = getSummariesQuery.data.map(
        (summary: Summary) => ({
          id: summary.id,
          createdAt: summary.createdAt,
          isUserMessage: false,
          text: summary.text,
        })
      );
      setSummaries(existingSummaries);
    }

    const wsUrl = process.env.PYTHON_BACKEND_URL || "ws://localhost:8000/ws";
    websocket.current = new WebSocket(wsUrl);

    websocket.current.onopen = () => {
      console.log("WebSocket connection established");
    };

    websocket.current.onmessage = (event) => {
      if (delayedToastTimeout.current) {
        clearTimeout(delayedToastTimeout.current);
        delayedToastTimeout.current = null;
      }

      const data = JSON.parse(event.data);
      if (data.summary) {
        if (data.summary.length > 1000) {
          toast({
            title: "Warning",
            description: "The summary is too long to be saved to the database.",
            variant: "destructive",
          });
        }

        setSummaries((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            isUserMessage: false,
            text: data.summary,
          },
        ]);
      } else if (data.error) {
        console.log(data.error);
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
      }
      setLoading(false);
    };

    websocket.current.onerror = (event) => {
      console.error("WebSocket error:", event);
      setLoading(false);
      console.log("WebSocket connection error");
    };

    websocket.current.onclose = (event) => {
      console.log("WebSocket connection closed:", event);
    };

    return () => {
      websocket.current?.close();
      if (delayedToastTimeout.current) {
        clearTimeout(delayedToastTimeout.current);
      }
    };
  }, [toast, getSummariesQuery.data]);

  const generateSummary = () => {
    if (!loading) {
      setLoading(true);
      websocket.current?.send(JSON.stringify({ url }));

      delayedToastTimeout.current = setTimeout(() => {
        toast({
          title: "Generating Summary",
          description: "This may take a while. Please wait...",
          variant: "default",
        });
      }, 20000);
    }
  };

  return (
    <div className="relative h-[calc(100vh-250px)] bg-zinc-50 lg:h-[calc(100vh-160px)] flex flex-col justify-between overflow-hidden">
      <div className="overflow-y-auto overflow-x-hidden flex-grow p-5 scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch">
        {summaries.length > 0 ? (
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
