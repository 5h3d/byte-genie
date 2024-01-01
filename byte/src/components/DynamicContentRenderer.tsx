"use client";
import React, { useState } from "react";
import ChatWrapper from "./chat/ChatWrapper";
import SummaryWrapper from "./chat/SummaryWrapper";
import ChatActions from "./chat/ChatActions";

interface DynamicContentRendererProps {
  fileId: string;
  url: string;
}
const DynamicContentRenderer = ({
  fileId,
  url,
}: DynamicContentRendererProps) => {
  const [selectedMode, setSelectedMode] = useState("chat");

  const handleModeChange = (mode: string) => {
    setSelectedMode(mode);
  };

  return (
    <div>
      <ChatActions
        onModeChange={handleModeChange}
        selectedMode={selectedMode}
      />
      {selectedMode === "chat" ? (
        <ChatWrapper fileId={fileId} url={url} />
      ) : (
        <SummaryWrapper fileId={fileId} url={url} />
      )}
    </div>
  );
};

export default DynamicContentRenderer;
