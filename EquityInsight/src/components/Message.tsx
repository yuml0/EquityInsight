import { CheckCircle, Loader2, Wrench, XCircle } from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { UIMessage } from "ai";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface MessageProps {
  message: UIMessage;
}

const getToolStatusIcon = (state: string) => {
  switch (state) {
    case "input-streaming":
    case "input-available":
      return <Loader2 className="size-3 animate-spin" />;
    case "output-available":
      return <CheckCircle className="size-3 text-green-500" />;
    case "output-error":
      return <XCircle className="size-3 text-red-500" />;
    default:
      return null;
  }
};

const getToolActionText = (toolName: string, state: string) => {
  const toolNameMap: Record<
    string,
    { searching: string; completed: string; error: string }
  > = {
    "tool-searchKnowledgeBase": {
      searching: "Searching knowledge base for more information...",
      completed: "Searched knowledge base for relevant information",
      error: "Error searching knowledge base",
    },
    // Add more tool action mappings here as needed
  };

  const actions = toolNameMap[toolName];
  if (!actions) {
    // Fallback for unknown tools
    switch (state) {
      case "input-streaming":
      case "input-available":
        return `Executing ${toolName}...`;
      case "output-available":
        return `Executed ${toolName}`;
      case "output-error":
        return `Error executing ${toolName}`;
      default:
        return toolName;
    }
  }

  switch (state) {
    case "input-streaming":
    case "input-available":
      return actions.searching;
    case "output-available":
      return actions.completed;
    case "output-error":
      return actions.error;
    default:
      return toolName;
  }
};

// const formatToolResult = (toolName: string, output: unknown) => {
//   if (toolName.includes("searchKnowledgeBase")) {
//     const { documents } = output as {
//       content: string;
//       documents: { name: string; url: string }[];
//     };
//     return (
//       <div className="flex flex-row gap-2 flex-wrap">
//         {documents?.map((document, index) => (
//           <Badge key={index} className="flex flex-row gap-1">
//             {document.name.endsWith(".pdf")
//               ? <FileText className="size-2" />
//               : <FileType className="size-2" />}
//             <a
//               href={document.url}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="text-xs"
//             >
//               {document.name}
//             </a>
//           </Badge>
//         ))}
//       </div>
//     );
//   }

//   if (toolName.includes("Goal") || toolName.includes("Post")) {
//     if (output && typeof output === "object" && "id" in output) {
//       return (
//         <div className="text-xs text-muted-foreground">
//           {toolName.includes("create")
//             ? "Created"
//             : toolName.includes("update")
//             ? "Updated"
//             : "Deleted"} {toolName.includes("Goal") ? "Goal" : "Post"} ID:{" "}
//           {String(output.id)}
//         </div>
//       );
//     }
//   }

//   return (
//     <div className="text-xs text-muted-foreground">
//       Tool executed successfully
//     </div>
//   );
// };

const groupToolCalls = (parts: UIMessage["parts"]) => {
  const toolCalls: NonNullable<UIMessage["parts"]>[number][] = [];
  const otherParts: NonNullable<UIMessage["parts"]>[number][] = [];

  if (!parts) return { toolCalls, otherParts };

  parts.forEach((part) => {
    if (part.type !== "text" && "toolCallId" in part && "state" in part) {
      toolCalls.push(part);
    } else {
      otherParts.push(part);
    }
  });

  return { toolCalls, otherParts };
};

const renderToolCall = (
  part: NonNullable<UIMessage["parts"]>[number],
  messageId: string,
) => {
  const toolName = part.type;
  const toolId = "toolCallId" in part ? part.toolCallId : "";
  const state = "state" in part ? part.state : "";
  const actionText = getToolActionText(toolName, state || "");

  return (
    <div key={`${messageId}-tool-${toolId}`} className="my-2">
      {(() => {
        switch (state) {
          case "input-streaming":
          case "input-available":
            return (
              <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                {getToolStatusIcon(state)}
                <span>{actionText}</span>
              </div>
            );
          case "output-available":
            return (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {getToolStatusIcon(state)}
                  <span>{actionText}</span>
                </div>
                {
                  /* <div className="pl-5">
                  {formatToolResult(toolName, output)}
                </div> */
                }
              </div>
            );
          case "output-error":
            return (
              <div className="flex items-center gap-2 text-sm text-red-500">
                {getToolStatusIcon(state)}
                <span>{actionText}</span>
              </div>
            );
          default:
            return null;
        }
      })()}
    </div>
  );
};

export const Message: React.FC<MessageProps> = ({
  message,
}) => {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  // Extract text content from message parts
  const textContent = message.parts?.map((part) => {
    if (part.type === "text") return part.text;
    return "";
  }).join("") || "";

  // Group tool calls and other parts using type inference from message
  const { toolCalls } = groupToolCalls(message.parts);

  // Don't render system messages in the chat UI
  if (isSystem) {
    return null;
  }

  return (
    <div
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        }`}
      >
        {toolCalls.length > 0 && (
          <div className="my-2">
            {toolCalls.length === 1
              ? (
                // Single tool call - render directly
                toolCalls[0] && renderToolCall(toolCalls[0], message.id)
              )
              : (
                // Multiple tool calls - use accordion
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem
                    value="tool-calls"
                    className="border-none rounded-lg"
                  >
                    <AccordionTrigger className="px-4 py-3 hover:no-underline border-none">
                      <div className="flex items-center gap-2">
                        <Wrench className="size-4" />
                        <span className="text-sm font-medium">
                          {toolCalls.length}{" "}
                          Tool Call{toolCalls.length > 1 ? "s" : ""} Executed
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-3">
                        {toolCalls.map((toolCall) => (
                          <div
                            key={`${message.id}-tool-${
                              "toolCallId" in toolCall
                                ? toolCall.toolCallId
                                : "unknown"
                            }`}
                            className="border-l-2 border-muted pl-3"
                          >
                            {renderToolCall(toolCall, message.id)}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
          </div>
        )}

        {textContent && (
          <div className="text-sm whitespace-pre-wrap break-words">
            <Markdown remarkPlugins={[remarkGfm]}>
              {textContent}
            </Markdown>
          </div>
        )}
      </div>
    </div>
  );
};
