"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Bot, X } from "lucide-react";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { EmptyState } from "@/components/shared/empty-state";
import { useChatStore } from "@/lib/stores/chat-store";
import { RihlaGlyph } from "@/components/shared/rihla-logo";

const C = {
  basalt: "#141008",
  nile: "#0F3D3E",
  limestone: "#F5EFE0",
  sand: "#D4A84E",
};

export interface RafiqDrawerProps {
  open: boolean;
  onClose: () => void;
  suggestions?: string[];
}

export function RafiqDrawer({ open, onClose, suggestions = [] }: RafiqDrawerProps) {
  const t = useTranslations("chat");
  const { currentConversationId, messages, isStreaming, sendMessage } =
    useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const curMessages = currentConversationId
    ? messages[currentConversationId] ?? []
    : [];

  const askSuggestion = (text: string) => {
    if (isStreaming || !text.trim()) return;
    void sendMessage(text.trim(), undefined);
  };

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [curMessages.length, open]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(20,16,8,0.4)" }} />

      {/* Panel */}
      <div
        className="dark:bg-[var(--surface)]"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 440,
          height: "100%",
          background: "var(--surface)",
          color: "var(--fg-body)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-8px 0 40px rgba(0,0,0,0.18)",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: `linear-gradient(-60deg, ${C.basalt}, ${C.nile}, ${C.basalt})`,
            backgroundSize: "300% 300%",
            padding: "20px 22px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexShrink: 0,
          }}
        >
          <RihlaGlyph size={36} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Cairo',sans-serif", fontSize: "20px", fontWeight: 500, color: C.limestone }}>
              Rafiq
            </div>
            <div
              style={{
                fontFamily: "'Cairo',sans-serif",
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: `${C.sand}80`,
              }}
            >
              AI Travel Companion
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: "none", border: "none", color: `${C.limestone}70`, cursor: "pointer", padding: 6 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          style={{ flex: 1, overflowY: "auto", padding: "18px 18px", display: "flex", flexDirection: "column", gap: 12 }}
        >
          {curMessages.length === 0 ? (
            <div style={{ padding: "40px 8px" }}>
              <EmptyState icon={<Bot className="w-10 h-10 text-faience" />} title={t("noConversations")} description={t("startNewChat")} />
              {suggestions.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => askSuggestion(s)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium border border-faience/30 text-faience hover:bg-faience hover:text-white hover:border-faience transition-all duration-200 cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            curMessages.map((m) => (
              <ChatMessage
                key={m.id}
                role={m.role}
                content={m.content}
                persona={m.persona}
                timestamp={m.timestamp}
                isStreaming={m.id === curMessages[curMessages.length - 1]?.id && isStreaming}
              />
            ))
          )}
        </div>

        {/* Input */}
        <div style={{ flexShrink: 0, borderTop: "1px solid var(--border)", padding: "12px 14px" }}>
          <ChatInput />
        </div>
      </div>
    </div>
  );
}