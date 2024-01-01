import React from "react";
interface ChatActionsProps {
  onModeChange: (mode: string) => {};
  selectedMode: string;
}

const ChatActions = ({ onModeChange, selectedMode }: ChatActionsProps) => {
  const chatButtonClass =
    selectedMode === "chat"
      ? "border border-grey-200 py-1 px-3 rounded-md flex-1 bg-primary hover:bg-red-900 text-white" // Active style
      : "border border-grey-200 py-1 px-3 rounded-md flex-1";

  const summaryButtonClass =
    selectedMode === "summary"
      ? "border border-grey-200 py-1 px-3 rounded-md flex-1 bg-primary hover:bg-red-900 text-white" // Active style
      : "border border-grey-200 py-1 px-3 rounded-md flex-1";

  return (
    <div className="p-5 bg-red-50">
      {/* <h2 className="font-bold mb-3">What would you like to do?</h2> */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onModeChange("chat")}
          className={chatButtonClass}
        >
          Chat
        </button>
        <button
          onClick={() => onModeChange("summary")}
          className={summaryButtonClass}
        >
          Summarize
        </button>
      </div>
    </div>
  );
};

export default ChatActions;
