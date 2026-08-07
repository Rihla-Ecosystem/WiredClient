"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Menu } from "lucide-react";
import Link from "next/link";

import { AuthGuard } from "@/components/layout/auth-guard";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { EmptyState } from "@/components/shared/empty-state";
import { useChatStore } from "@/lib/stores/chat-store";

export default function ChatDetailPage() {
  const t = useTranslations("chat");
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);
  const prevConvRef = useRef<string | null>(null);
  const {
    conversations,
    messages,
    currentConversationId,
    setActiveConversation,
    error: chatError,
    setError,
  } = useChatStore();

  useEffect(() => {
    if (id) setActiveConversation(id);
  }, [id, setActiveConversation]);

  const activeConv = conversations.find((c) => c.id === id);
  const activeMessages = useMemo(
    () => (id ? messages[id] || [] : []),
    [messages, id]
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
    if (prevConvRef.current !== id) {
      prevConvRef.current = id;
      stickToBottomRef.current = true;
    }
    if (stickToBottomRef.current) el.scrollTop = el.scrollHeight;
  }, [activeMessages, id]);

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
            <Link
              href="/chat"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-nile dark:hover:text-sand transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{t("title")}</span>
            </Link>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: "#2E9C93", boxShadow: "0 0 8px rgba(46,156,147,0.8)" }}
              />
              <h1 className="text-lg font-serif font-bold text-nile dark:text-sand truncate">
                {activeConv?.title || t("title")}
              </h1>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={messagesRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
          >
            {activeMessages.length === 0 ? (
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