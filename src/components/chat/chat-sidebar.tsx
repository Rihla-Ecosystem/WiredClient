"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { MessageSquare, Plus, Trash2 } from "lucide-react";

import { useChatStore } from "@/lib/stores/chat-store";
import { useAuthStore } from "@/lib/stores/auth-store";

export function ChatSidebar({ onClose }: { onClose?: () => void }) {
  const t = useTranslations("chat");
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const {
    conversations,
    messages: storeMessages,
    currentConversationId: activeConversationId,
    setActiveConversation,
    createConversation,
    loadConversations,
    deleteConversation,
  } = useChatStore();

  useEffect(() => {
    if (accessToken) loadConversations();
  }, [accessToken, loadConversations]);

  return (
    <div className="w-72 h-full bg-white dark:bg-nile border-r border-sand/50 dark:border-nile-light/20 flex flex-col">
      <div className="p-4 border-b border-sand/50 dark:border-nile-light/20">
        <button
          type="button"
          onClick={() => {
            createConversation();
            router.push("/chat");
            onClose?.();
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2E9C93] hover:bg-[#27867f] text-white rounded-lg font-medium transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          {t("newConversation")}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {conversations.length === 0 && (
          <div className="text-center py-8">
            <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-xs text-muted-foreground">{t("noConversations")}</p>
          </div>
        )}

        {conversations.map((conv) => (
          <div
            key={conv.id}
            role="button"
            tabIndex={0}
            onClick={() => {
              setActiveConversation(conv.id);
              router.push(`/chat/${conv.id}`);
              onClose?.();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setActiveConversation(conv.id);
                router.push(`/chat/${conv.id}`);
                onClose?.();
              }
            }}
            className={`w-full text-left p-3 rounded-lg transition-all text-sm group cursor-pointer ${
              activeConversationId === conv.id
                ? "bg-[#2E9C93]/10 text-[#2E9C93] border border-[#2E9C93]/25"
                : "text-muted-foreground hover:bg-sand/30 dark:hover:bg-nile-light/20 hover:text-nile dark:hover:text-sand"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span className="truncate text-sm">{conv.title}</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(conv.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            {(storeMessages[conv.id]?.length ?? 0) > 0 && (
              <p className="text-xs text-muted-foreground/60 mt-1 truncate">
                {storeMessages[conv.id].at(-1)?.content.slice(0, 60)}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
