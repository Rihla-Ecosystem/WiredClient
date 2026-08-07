import { create } from "zustand";
import {
  chatApi,
  type Conversation,
  type Persona,
  type IdentifyResult,
  type ProviderCall,
  type ProviderAttempt,
  type UsageResult,
} from "@/lib/api/chat";
import { useAuthStore } from "@/lib/stores/auth-store";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  persona?: Persona;
  timestamp: string;
  blocked?: boolean;
  reason?: string;
  metadata?: Record<string, string>;
  audioUrl?: string;
  audioMime?: string;
  usage?: UsageResult | null;
  providerCalls?: ProviderCall[] | null;
  providerAttempts?: ProviderAttempt[] | null;
}

interface ContextData {
  environment?: Record<string, unknown>;
  geography?: Record<string, unknown>;
  safety?: Record<string, unknown>;
  currency?: Record<string, unknown>;
}

interface ChatState {
  conversations: Conversation[];
  currentConversationId: string | null;
  messages: Record<string, Message[]>;
  persona: Persona;
  isStreaming: boolean;
  contextData: ContextData | null;
  error: string | null;

  setPersona: (p: Persona) => void;
  setConversations: (convs: Conversation[]) => void;
  setCurrentConversation: (id: string | null) => void;
  addMessage: (conversationId: string, message: Message) => void;
  appendStreamToken: (conversationId: string, token: string) => void;
  finalizeStream: (conversationId: string, fullContent: string) => void;
  setStreaming: (streaming: boolean) => void;
  setContextData: (data: ContextData | null) => void;
  setError: (error: string | null) => void;
  resetChat: () => void;

  sendMessage: (content: string, context?: { lat?: number; lon?: number }) => Promise<void>;
  sendVoice: (
    blob: Blob,
    mimeType: string,
    context?: { lat?: number; lon?: number }
  ) => Promise<void>;
  sendImage: (file: File, context?: { lat?: number; lon?: number }) => Promise<void>;
  updateMessage: (
    conversationId: string,
    messageId: string,
    patch: Partial<Message>
  ) => void;
  createConversation: () => void;
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  deleteConversation: (id: string) => void;
  setActiveConversation: (id: string) => void;
  setActivePersona: (p: Persona | null) => void;
}

export const useChatStore = create<ChatState>()((set, get) => ({
  conversations: [],
  currentConversationId: null,
  messages: {},
  persona: "auto",
  isStreaming: false,
  contextData: null,
  error: null,

  setPersona: (persona) => set({ persona }),

  setConversations: (conversations) => set({ conversations }),

  setCurrentConversation: (id) => set({ currentConversationId: id }),

  addMessage: (conversationId, message) => {
    const messages = get().messages;
    const existing = messages[conversationId] || [];
    set({
      messages: { ...messages, [conversationId]: [...existing, message] },
    });
  },

  appendStreamToken: (conversationId, token) => {
    const messages = get().messages;
    const existing = messages[conversationId] || [];
    const lastMsg = existing[existing.length - 1];
    if (lastMsg && lastMsg.role === "assistant") {
      const updated = { ...lastMsg, content: lastMsg.content + token };
      set({
        messages: {
          ...messages,
          [conversationId]: [...existing.slice(0, -1), updated],
        },
      });
    }
  },

  finalizeStream: (conversationId, fullContent) => {
    const messages = get().messages;
    const existing = messages[conversationId] || [];
    const lastMsg = existing[existing.length - 1];
    if (lastMsg && lastMsg.role === "assistant") {
      const updated = { ...lastMsg, content: fullContent };
      set({
        messages: {
          ...messages,
          [conversationId]: [...existing.slice(0, -1), updated],
        },
        isStreaming: false,
      });
    } else {
      set({ isStreaming: false });
    }
  },

  setStreaming: (isStreaming) => set({ isStreaming }),

  updateMessage: (conversationId, messageId, patch) => {
    const messages = get().messages;
    const existing = messages[conversationId] || [];
    set({
      messages: {
        ...messages,
        [conversationId]: existing.map((msg) =>
          msg.id === messageId ? { ...msg, ...patch } : msg
        ),
      },
    });
  },

  setContextData: (contextData) => set({ contextData }),

  setError: (error) => set({ error }),

  resetChat: () =>
    set({
      currentConversationId: null,
      persona: "auto",
      contextData: null,
      error: null,
    }),

  createConversation: () => {
    const id = crypto.randomUUID();
    const conv: Conversation = {
      id,
      title: "New conversation",
      persona: "auto",
      lastMessageAt: new Date().toISOString(),
      messageCount: 0,
    };
    set((s) => ({
      conversations: [conv, ...s.conversations],
      currentConversationId: id,
    }));
  },

  deleteConversation: (id) => {
    set((s) => {
      const conversations = s.conversations.filter((c) => c.id !== id);
      const messages = { ...s.messages };
      delete messages[id];
      return {
        conversations,
        messages,
        currentConversationId:
          s.currentConversationId === id
            ? conversations[0]?.id || null
            : s.currentConversationId,
      };
    });
    chatApi.deleteConversation(id).catch(() => {
      // conversation may not exist on the backend yet (local-only)
    });
  },

  loadConversations: async () => {
    const { accessToken } = useAuthStore.getState();
    if (!accessToken) return;
    try {
      const convs = await chatApi.getConversations();
      set({ conversations: convs });
    } catch {
      // ignore load failures
    }
  },

  loadMessages: async (conversationId) => {
    const existing = get().messages[conversationId];
    if (existing && existing.length > 0) return;
    try {
      const msgs = await chatApi.getMessages(conversationId);
      set((s) => ({ messages: { ...s.messages, [conversationId]: msgs } }));
    } catch {
      // conversation may not exist on the backend yet (local-only)
    }
  },

  setActiveConversation: (id) => {
    set({ currentConversationId: id });
    get().loadMessages(id);
  },

  setActivePersona: (p) => set({ persona: p || "auto" }),

  sendMessage: async (content, context) => {
    const state = get();
    if (state.isStreaming) return;
    const convId = state.currentConversationId;

    const conversationId = convId || crypto.randomUUID();
    if (!convId) {
      const conv: Conversation = {
        id: conversationId,
        title: content.slice(0, 40),
        persona: state.persona,
        lastMessageAt: new Date().toISOString(),
        messageCount: 1,
      };
      set({
        conversations: [conv, ...state.conversations],
        currentConversationId: conversationId,
      });
    }

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      persona: state.persona,
      timestamp: new Date().toISOString(),
    };
    get().addMessage(conversationId, userMsg);

    const assistantMsg: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      persona: state.persona,
      timestamp: new Date().toISOString(),
    };
    get().addMessage(conversationId, assistantMsg);
    set({ isStreaming: true, error: null });

    try {
      const result = await chatApi.streamMessage(
        content,
        state.persona === "auto" ? null : state.persona,
        (token) => get().appendStreamToken(conversationId, token),
        {
          conversationId,
          lat: context?.lat,
          lon: context?.lon,
        }
      );

      const telemetry: Partial<Message> = {
        usage: result.usage ?? null,
        providerCalls: result.providerCalls ?? [],
        providerAttempts: result.providerAttempts ?? [],
      };

      const { text, conversationId: backendId } = result;

      if (backendId && backendId !== conversationId) {
        const messages = { ...get().messages };
        const existing = messages[conversationId] || [];
        delete messages[conversationId];
        const updatedLast = [
          ...existing.slice(0, -1),
          { ...existing[existing.length - 1], ...telemetry },
        ];
        set((s) => ({
          messages: { ...messages, [backendId]: updatedLast },
          currentConversationId: backendId,
          conversations: s.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  id: backendId,
                  title:
                    c.title === "New conversation"
                      ? content.slice(0, 40)
                      : c.title,
                  lastMessageAt: new Date().toISOString(),
                  messageCount: c.messageCount + 1,
                }
              : c
          ),
        }));
        get().finalizeStream(backendId, text);
      } else {
        get().finalizeStream(conversationId, text);
        get().updateMessage(conversationId, assistantMsg.id, telemetry);
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  title:
                    c.title === "New conversation"
                      ? content.slice(0, 40)
                      : c.title,
                  lastMessageAt: new Date().toISOString(),
                  messageCount: c.messageCount + 1,
                }
              : c
          ),
        }));
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Something went wrong";
      get().finalizeStream(conversationId, "");
      set({
        error: message,
        currentConversationId: conversationId,
      });
    }
  },

  sendVoice: async (blob, mimeType, context) => {
    const state = get();
    if (state.isStreaming) return;
    const conversationId = state.currentConversationId || crypto.randomUUID();

    if (!state.currentConversationId) {
      const conv: Conversation = {
        id: conversationId,
        title: "Voice message",
        persona: state.persona,
        lastMessageAt: new Date().toISOString(),
        messageCount: 1,
      };
      set({
        conversations: [conv, ...state.conversations],
        currentConversationId: conversationId,
      });
    }

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: "Voice message",
      persona: state.persona,
      timestamp: new Date().toISOString(),
    };
    get().addMessage(conversationId, userMsg);

    const assistantMsg: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      persona: state.persona,
      timestamp: new Date().toISOString(),
    };
    get().addMessage(conversationId, assistantMsg);
    set({ isStreaming: true, error: null });

    try {
      const result = await chatApi.voice(blob, mimeType, {
        conversationId,
        lat: context?.lat,
        lon: context?.lon,
        businessRequestId: crypto.randomUUID(),
      });
      const patch: Partial<Message> = {};
      if (result.audio_url) {
        patch.audioUrl = result.audio_url;
        patch.audioMime = result.audio_url.split(";")[0].split(":")[1];
      } else if (result.audio_response) {
        patch.audioUrl = result.audio_response.startsWith("data:")
          ? result.audio_response
          : `data:audio/wav;base64,${result.audio_response}`;
        patch.audioMime = patch.audioUrl.split(";")[0].split(":")[1];
      }
      if (!patch.audioUrl) {
        patch.content = result.text_response || "";
      }
      patch.usage = result.usage ?? null;
      patch.providerCalls = result.providerCalls ?? [];
      patch.providerAttempts = result.providerAttempts ?? [];
      if (result.model) patch.metadata = { model: result.model };
      get().updateMessage(conversationId, assistantMsg.id, patch);
      set({ isStreaming: false });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Something went wrong";
      get().updateMessage(conversationId, assistantMsg.id, {
        content: message,
      });
      set({ isStreaming: false, error: message });
    }
  },

  sendImage: async (file, context) => {
    const state = get();
    if (state.isStreaming) return;
    const conversationId = state.currentConversationId || crypto.randomUUID();

    if (!state.currentConversationId) {
      const conv: Conversation = {
        id: conversationId,
        title: file.name.slice(0, 40),
        persona: state.persona,
        lastMessageAt: new Date().toISOString(),
        messageCount: 1,
      };
      set({
        conversations: [conv, ...state.conversations],
        currentConversationId: conversationId,
      });
    }

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: `Image: ${file.name}`,
      persona: state.persona,
      timestamp: new Date().toISOString(),
    };
    get().addMessage(conversationId, userMsg);

    const assistantMsg: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      persona: state.persona,
      timestamp: new Date().toISOString(),
    };
    get().addMessage(conversationId, assistantMsg);
    set({ isStreaming: true, error: null });

    try {
      const result = await chatApi.identify(file, {
        lat: context?.lat,
        lon: context?.lon,
      });
      get().updateMessage(conversationId, assistantMsg.id, {
        content: formatIdentify(result),
        usage: result.usage ?? null,
        providerCalls: result.providerCalls ?? [],
        providerAttempts: result.providerAttempts ?? [],
      });
      set({ isStreaming: false });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Something went wrong";
      get().updateMessage(conversationId, assistantMsg.id, {
        content: message,
      });
      set({ isStreaming: false, error: message });
    }
  },
}));

function formatIdentify(result: IdentifyResult): string {
  const lines: string[] = [];
  const title = result.name_ar ? `${result.name} (${result.name_ar})` : result.name;
  lines.push(`**${title}**`);
  if (result.description) lines.push(result.description);
  const meta: string[] = [];
  if (result.category) meta.push(`**Category:** ${result.category}`);
  if (result.historical_period) meta.push(`**Period:** ${result.historical_period}`);
  if (result.wikipedia_url) meta.push(`[Wikipedia](${result.wikipedia_url})`);
  if (meta.length > 0) lines.push(meta.join("  \n"));
  return lines.join("\n\n");
}
