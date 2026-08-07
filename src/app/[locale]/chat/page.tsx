"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Menu } from "lucide-react";

import { AuthGuard } from "@/components/layout/auth-guard";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ContextAlert } from "@/components/chat/context-alert";
import { EmptyState } from "@/components/shared/empty-state";
import { useChatStore } from "@/lib/stores/chat-store";

export default function ChatPage() {
  const t = useTranslations("chat");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);
  const prevConvRef = useRef<string | null>(null);
  const { conversations, messages, currentConversationId: activeConversationId, error: chatError, setError } = useChatStore();

  const activeConv = conversations.find(
    (c) => c.id === activeConversationId
  );
  const activeMessages = useMemo(
    () => (activeConversationId ? messages[activeConversationId] || [] : []),
    [messages, activeConversationId]
  );

  const handleScroll = () => {
    const el = messagesRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottomRef.current = distance < 80;
  };

  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    if (prevConvRef.current !== activeConversationId) {
      prevConvRef.current = activeConversationId;
      stickToBottomRef.current = true;
    }
    if (stickToBottomRef.current) el.scrollTop = el.scrollHeight;
  }, [activeMessages, activeConversationId]);

  return (
    <AuthGuard>
      <div className="flex h-[calc(100vh-4rem)] bg-sand/20 dark:bg-nile-dark">
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-40 w-72 pt-16 transform transition-transform lg:relative lg:pt-0 lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <ChatSidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-sand/50 dark:border-nile-light/20 bg-white dark:bg-nile">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-nile dark:hover:text-sand hover:bg-sand/30 dark:hover:bg-nile-light/20 transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: "#2E9C93", boxShadow: "0 0 8px rgba(46,156,147,0.8)" }}
              />
              <h1 className="text-lg font-serif font-bold text-nile dark:text-sand">
                {t("title")}
              </h1>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={messagesRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
          >
            <ContextAlert />
            {!activeConv || activeMessages.length === 0 ? (
              <EmptyState
                icon="MessageSquare"
                title={t("noConversations")}
                description={t("startNewChat")}
              />
            ) : (
              activeMessages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  persona={msg.persona}
                  timestamp={msg.timestamp}
                  metadata={msg.metadata}
                  audioUrl={msg.audioUrl}
                  usage={msg.usage}
                  providerCalls={msg.providerCalls}
                  providerAttempts={msg.providerAttempts}
                />
              ))
            )}
          </div>

          {/* Error banner */}
          {chatError && (
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 mx-4 mb-2 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60">
              <p className="text-sm text-red-700 dark:text-red-300">
                <span className="font-medium">{t("chatError")}: </span>
                {chatError}
              </p>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700 dark:hover:text-red-200 text-sm shrink-0"
              >
                {t("dismiss")}
              </button>
            </div>
          )}

          {/* Input */}
          <ChatInput />
        </div>
      </div>
    </AuthGuard>
  );
}
