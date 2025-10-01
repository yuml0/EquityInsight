import { useChat } from "@ai-sdk/react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Bot, Send } from "lucide-react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import { useEffect, useRef, useState } from "react";
import { Message } from "./Message";
import { PortfolioCompany } from "./PortfolioManager";

// Utility function to get current portfolio from localStorage
function getCurrentPortfolioFromStorage(): PortfolioCompany[] {
  try {
    const stored = localStorage.getItem("portfolio-companies");
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error reading portfolio from localStorage:", error);
    return [];
  }
}

// Utility function to get current analytics views data from localStorage
function getCurrentViewsDataFromStorage() {
  try {
    const companies = getCurrentPortfolioFromStorage();

    // Get current analytics settings from localStorage
    const selectedHorizon =
      localStorage.getItem("portfolio-selected-horizon") || "2050";
    const selectedPathway =
      localStorage.getItem("portfolio-selected-pathway") || "ssp245";
    const selectedRisk = localStorage.getItem("portfolio-selected-risk") ||
      "physical";
    const selectedMetric = localStorage.getItem("portfolio-selected-metric") ||
      "dcr_score";
    const activeTab = localStorage.getItem("portfolio-active-tab") || "sector";

    // Calculate portfolio metrics
    const portfolioMetrics = {
      totalCompanies: companies.length,
      totalWeight: companies.reduce((sum, c) => sum + c.weight, 0),
      avgScore: 0.42, // This would be calculated from real data
      highRiskCompanies: Math.floor(companies.length * 0.3),
    };

    return {
      companies,
      portfolioMetrics,
      settings: {
        horizon: Number(selectedHorizon),
        pathway: selectedPathway,
        risk: selectedRisk as "physical" | "transition",
        metric: selectedMetric,
        activeTab,
      },
      availableHorizons: [
        { label: "2025", value: 2025 },
        { label: "2030", value: 2030 },
        { label: "2040", value: 2040 },
        { label: "2050", value: 2050 },
        { label: "2060", value: 2060 },
        { label: "2070", value: 2070 },
        { label: "2080", value: 2080 },
        { label: "2090", value: 2090 },
        { label: "2100", value: 2100 },
      ],
      availablePathways: [
        { label: "Stochastic View", value: "RT3" },
        { label: "<2 degrees", value: "<2 degrees" },
        { label: "2-3 degrees", value: "2-3 degrees" },
        { label: "3-4 degrees", value: "3-4 degrees" },
        { label: ">4 degrees", value: ">4 degrees" },
        { label: "SSP1-2.6", value: "ssp126" },
        { label: "SSP2-4.5", value: "ssp245" },
        { label: "SSP3-7.0", value: "ssp370" },
        { label: "SSP5-8.5", value: "ssp585" },
      ],
      availableRiskTypes: [
        { label: "Physical Risk", value: "physical" },
        { label: "Transition Risk", value: "transition" },
      ],
      availableMetrics: [
        { label: "DCR Score", value: "dcr_score" },
        { label: "Expected Impact", value: "expected_impact" },
        { label: "CVaR 50%", value: "cvar_50" },
        { label: "CVaR 95%", value: "cvar_95" },
        { label: "CVaR 99%", value: "cvar_99" },
        { label: "VaR 50%", value: "var_50" },
        { label: "VaR 95%", value: "var_95" },
        { label: "VaR 99%", value: "var_99" },
      ],
      availableTabs: [
        { label: "Sector", value: "sector" },
        { label: "Geography", value: "geography" },
        { label: "Hazard", value: "hazard" },
        { label: "Horizon", value: "horizon" },
        { label: "Top-N Drivers", value: "drivers" },
      ],
    };
  } catch (error) {
    console.error(
      "Error reading analytics views data from localStorage:",
      error,
    );
    return {
      companies: [],
      portfolioMetrics: {
        totalCompanies: 0,
        totalWeight: 0,
        avgScore: 0,
        highRiskCompanies: 0,
      },
      settings: {
        horizon: 2050,
        pathway: "ssp245",
        risk: "physical" as const,
        metric: "dcr_score",
        activeTab: "sector",
      },
      availableHorizons: [],
      availablePathways: [],
      availableRiskTypes: [],
      availableMetrics: [],
      availableTabs: [],
    };
  }
}

export function ChatBot() {
  const { messages, sendMessage, addToolResult } = useChat({
    transport: new DefaultChatTransport({
      api: "/server/chat",
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls, // Disable automatic sending to prevent duplicate messages

    async onToolCall({ toolCall }) {
      if (toolCall.dynamic) {
        return;
      }

      if (toolCall.toolName === "getCurrentPortfolio") {
        addToolResult({
          tool: "getCurrentPortfolio",
          toolCallId: toolCall.toolCallId,
          state: "output-available",
          output: {
            results: getCurrentPortfolioFromStorage(),
          },
        });
      }

      if (toolCall.toolName === "getCurrentViewsData") {
        addToolResult({
          tool: "getCurrentViewsData",
          toolCallId: toolCall.toolCallId,
          state: "output-available",
          output: {
            results: getCurrentViewsDataFromStorage(),
          },
        });
      }
    },
  });

  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSendMessage = async () => {
    if (!message.trim() || isSending) return;

    setIsSending(true);
    try {
      setMessage("");
      await sendMessage({ text: message });
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full w-full bg-card">
      {/* Messages Area */}
      <div className="flex-1 px-4 py-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.length === 0
            ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <Bot className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Start a conversation with your AI assistant
                </p>
              </div>
            )
            : (
              messages?.map((message) => {
                return (
                  <Message
                    key={message.id}
                    message={message}
                  />
                );
              })
            )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-sidebar-border bg-card p-4">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="min-h-[44px] max-h-32 resize-none pr-12"
              disabled={isSending}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || isSending}
            size="icon"
            className="h-11 w-11 shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
