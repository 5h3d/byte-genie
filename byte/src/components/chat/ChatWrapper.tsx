"use client";

import { trpc } from "@/app/_trpc/client";
import ChatInput from "./ChatInput";
import Messages from "./Messages";
import { Loader2 } from "lucide-react";
import { ChatContextProvider } from "./ChatContext";
// import SummaryWrapper from "./SummaryWrapper";

interface ChatWrapperProps {
  fileId: string;
  url?: string
}

const ChatWrapper = ({ fileId, url }: ChatWrapperProps) => {
  // Use tRPC to get the file upload status
  const { data, isLoading } = trpc.getFileUploadStatus.useQuery(
    { fileId },
    {
      // Set refetch interval based on the upload status
      refetchInterval: (data) =>
        data?.status === "SUCCESS" || data?.status === "FAILED" ? false : 500,
    }
  );

  // Display loading state while fetching data
  if (isLoading) {
    return (
      <div className="relative h-[calc(100dvh-100px)] bg-zinc-50 lg:h-[calc(100dvh-160px)]  flex divide-y divide-zinc-200 flex-col justify-between gap-2 overflow-hidden">
        <div className="flex-1 flex justify-center items-center flex-col mb-28">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <h3 className="font-semibold text-xl">Loading...</h3>
            <p className="text-zinc-500 text-sm">Preparing document</p>
          </div>
        </div>

        {/* ChatInput is disabled during loading */}
        <ChatInput isDisabled />
      </div>
    );
  }

  // Render the chat interface once data is available
  return (
    <ChatContextProvider fileId={fileId}>
      <div className="relative h-[calc(100dvh-100px)] bg-zinc-50 lg:h-[calc(100dvh-160px)]  flex divide-y divide-zinc-200 flex-col justify-between gap-2 overflow-hidden">
        <div className="flex-1 justify-between flex flex-col overflow-auto">
          <Messages fileId={fileId} />
        </div>

        <ChatInput />
      </div>
    </ChatContextProvider>
  );
};

export default ChatWrapper;
