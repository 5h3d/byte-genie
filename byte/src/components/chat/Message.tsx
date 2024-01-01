import { cn } from "@/lib/utils";
import { ExtendedMessage } from "@/types/message";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { forwardRef } from "react";
import { Bot, User } from "lucide-react";

interface MessageProps {
  message: ExtendedMessage;
  isNextMessageSamePerson: boolean;
}

const Message = forwardRef<HTMLDivElement, MessageProps>(
  ({ message, isNextMessageSamePerson }, ref) => {
    // Choosing the appropriate icon based on whether the message is from the user or the bot
    const MessageIcon = message.isUserMessage ? User : Bot;

    // Applying conditional styling for the message bubble
    const bubbleClasses = cn("px-4 py-2 rounded-lg inline-block", {
      "bg-primary text-white": message.isUserMessage,
      "bg-gray-200 text-gray-900": !message.isUserMessage,
      "rounded-br-none": !isNextMessageSamePerson && message.isUserMessage,
      "rounded-bl-none": !isNextMessageSamePerson && !message.isUserMessage,
    });

    // Formatting the timestamp of the message
    const formattedTime =
      message.id !== "loading-message"
        ? format(new Date(message.createdAt), "HH:mm")
        : "";

    return (
      <div
        ref={ref}
        className={cn("flex items-end", {
          "justify-end": message.isUserMessage,
        })}
      >
        <div
          className={cn(
            "relative flex h-6 w-6 aspect-square items-center justify-center rounded-sm",
            {
              "order-2 bg-primary": message.isUserMessage,
              "order-1 bg-black": !message.isUserMessage,
              invisible: isNextMessageSamePerson,
            }
          )}
        >
          <MessageIcon
            className={cn("fill-current h-3/4 w-3/4", {
              "text-zinc-200": message.isUserMessage,
              "text-zinc-300": !message.isUserMessage,
            })}
          />
        </div>

        <div
          className={cn("flex flex-col space-y-2 text-base max-w-md mx-2", {
            "order-1 items-end": message.isUserMessage,
            "order-2 items-start": !message.isUserMessage,
          })}
        >
          <div className={bubbleClasses}>
            {typeof message.text === "string" ? (
              <ReactMarkdown
                className={cn("prose", {
                  "text-zinc-50": message.isUserMessage,
                })}
              >
                {message.text}
              </ReactMarkdown>
            ) : (
              message.text
            )}
            {formattedTime && (
              <div
                className={cn("text-xs select-none mt-2 w-full text-right", {
                  "text-zinc-500": !message.isUserMessage,
                  "text-white": message.isUserMessage,
                })}
              >
                {formattedTime}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

Message.displayName = "Message";

export default Message;
