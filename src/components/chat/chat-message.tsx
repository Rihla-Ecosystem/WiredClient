"use client";

import { type ReactNode } from "react";
import { Bot, User, Shield, MapPin } from "lucide-react";
import { MarkdownContent } from "./markdown-content";

type Persona = "auto" | "tour_guide" | "local_expert" | "safety_guru";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string | ReactNode;
  persona?: Persona | null;
  timestamp?: string;
  isStreaming?: boolean;
  metadata?: Record<string, string>;
  audioUrl?: string;
}

const PERSONA_CONFIG = {
  tour_guide: { icon: MapPin, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
  local_expert: { icon: MapPin, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
  safety_guru: { icon: Shield, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" },
};

export function ChatMessage({
  role,
  content,
  persona,
  timestamp,
  isStreaming,
  metadata,
  audioUrl,
}: ChatMessageProps) {
  const isUser = role === "user";
  const pConfig =
    persona && persona !== "auto"
      ? PERSONA_CONFIG[persona as keyof typeof PERSONA_CONFIG]
      : null;

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
          isUser
            ? "bg-[#2E9C93] text-white"
            : pConfig
            ? pConfig.bg + " " + pConfig.color
            : "bg-nile/10 dark:bg-nile-light/30 text-nile dark:text-sand"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4" />
        ) : persona ? (
          pConfig && <pConfig.icon className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </div>

      <div className={`max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? "bg-[#2E9C93] text-white rounded-tr-sm"
              : "bg-sand/50 dark:bg-nile-light/30 text-nile dark:text-sand rounded-tl-sm"
          } ${isStreaming ? "animate-pulse" : ""}`}
        >
          {typeof content === "string" && !isUser ? (
            <MarkdownContent content={content} />
          ) : (
            content
          )}
          {!isUser && audioUrl && (
            <audio
              controls
              src={audioUrl}
              autoPlay
              className="w-full max-w-xs mt-2"
            />
          )}
          {isStreaming && (
            <span className="inline-block w-1.5 h-4 bg-current ml-1 animate-blink" />
          )}
        </div>

        {timestamp && (
          <p
            className={`text-xs text-muted-foreground mt-1 ${
              isUser ? "text-right" : "text-left"
            }`}
          >
            {timestamp}
          </p>
        )}

        {metadata && Object.keys(metadata).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {Object.entries(metadata).map(([key, val]) => (
              <span
                key={key}
                className="text-xs px-2 py-0.5 rounded-full bg-sand/30 dark:bg-nile-light/20 text-muted-foreground"
              >
                {key}: {val}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
