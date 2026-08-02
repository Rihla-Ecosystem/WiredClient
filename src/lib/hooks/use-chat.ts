"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { chatApi } from "@/lib/api/chat";

export function useSendMessage() {
  return useMutation({
    mutationFn: ({
      message,
      persona,
      context,
    }: {
      message: string;
      persona?: string | null;
      context?: { location?: string; conversationId?: string };
    }) => chatApi.sendMessage(message, persona, context),
  });
}

export function useConversations() {
  return useQuery({
    queryKey: ["chat", "conversations"],
    queryFn: chatApi.getConversations,
  });
}

export function useDeleteConversation() {
  return useMutation({
    mutationFn: (id: string) => chatApi.deleteConversation(id),
  });
}
