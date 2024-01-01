import { MessageSquare } from "lucide-react";
import React from "react";

const EmptyChat = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-2 w-full h-full">
      <MessageSquare className="h-8 w-8 text-primary" />
      <p className="text-zinc-500 text-sm">Let&apos;s get started!</p>
    </div>
  );
};

export default EmptyChat;
