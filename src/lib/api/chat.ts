import { coreClient, coreBaseURL } from "./client";
import { useAuthStore } from "@/lib/stores/auth-store";

export type Persona = "auto" | "tour_guide" | "local_expert" | "safety_guru";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  persona?: Persona;
  timestamp: string;
  blocked?: boolean;
  reason?: string;
  metadata?: Record<string, string>;
}

export interface Conversation {
  id: string;
  title: string;
  persona: Persona;
  lastMessageAt: string;
  messageCount: number;
}

export interface UsageTelemetry {
  model?: string | null;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  reasoningTokens?: number;
  imageInputTokens?: number;
  imageOutputTokens?: number;
  audioInputTokens?: number;
  audioOutputTokens?: number;
}

export interface ProviderCall {
  provider: string;
  providerCallId?: string;
  providerCallMade?: boolean;
  requestedModel?: string | null;
  actualModel?: string | null;
  operation?: string | null;
  usageSource?: string | null;
  usageCompleteness?: string | null;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  reasoningTokens?: number;
}

export interface ProviderAttempt {
  provider: string;
  attemptId?: string;
  attemptNumber?: number;
  operation?: string | null;
  requestedModel?: string | null;
  actualModel?: string | null;
  outcome?: string | null;
  providerCallStarted?: boolean;
  providerResponseReceived?: boolean;
  errorCategory?: string | null;
  httpStatus?: number | null;
}

export interface UsageResult {
  model?: string | null;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  reasoningTokens?: number;
}

export interface ChatResult {
  response: string;
  conversation_id: string;
  persona: Persona;
  blocked?: boolean;
  reason?: string;
  environment?: Record<string, unknown>;
  geography?: Record<string, unknown>;
  safety?: Record<string, unknown>;
  currency?: Record<string, unknown>;
  usage?: UsageResult | null;
  model?: string | null;
  providerCalls?: ProviderCall[] | null;
  providerAttempts?: ProviderAttempt[] | null;
}

export interface VoiceResult {
  text_response: string;
  audio_response?: string | null;
  audio_url?: string | null;
  conversation_id?: string | null;
  usage?: UsageResult | null;
  model?: string | null;
  providerCalls?: ProviderCall[] | null;
  providerAttempts?: ProviderAttempt[] | null;
}

export interface IdentifyResult {
  name: string;
  name_ar?: string | null;
  description: string;
  category?: string | null;
  historical_period?: string | null;
  wikipedia_url?: string | null;
  image_url?: string | null;
  nearby_sites?: unknown[] | null;
  cached?: boolean;
  usage?: UsageResult | null;
  model?: string | null;
  providerCalls?: ProviderCall[] | null;
  providerAttempts?: ProviderAttempt[] | null;
}

export interface StreamResult {
  text: string;
  conversationId: string;
  usage?: UsageResult | null;
  model?: string | null;
  providerCalls?: ProviderCall[] | null;
  providerAttempts?: ProviderAttempt[] | null;
}

interface BackendConversation {
  id: string;
  title: string | null;
  persona?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
  _count?: { messages?: number };
}

const CORE_API_URL = coreBaseURL;

export const chatApi = {
  sendMessage: (
    message: string,
    persona?: string | null,
    context?: { location?: string; conversationId?: string }
  ) =>
    coreClient.post<ChatResult>(
      "/chat",
      {
        message,
        persona: persona || undefined,
        conversation_id: context?.conversationId || undefined,
      },
      { headers: { "Idempotency-Key": crypto.randomUUID() } }
    ),

  streamMessage: async (
    message: string,
    persona?: string | null,
    onToken?: (token: string) => void,
    context?: {
      location?: string;
      lat?: number;
      lon?: number;
      conversationId?: string;
    }
  ): Promise<StreamResult> => {
    const token = useAuthStore.getState().accessToken;
    const response = await fetch(`${CORE_API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": crypto.randomUUID(),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        message,
        persona: persona || undefined,
        conversation_id: context?.conversationId || undefined,
        lat: context?.lat,
        lon: context?.lon,
      }),
    });

    if (!response.ok) {
      throw new Error(`Chat failed: ${response.status}`);
    }

    const payload = (await response.json()) as Partial<ChatResult> &
      Record<string, unknown>;

    if (payload && typeof payload === "object" && "error" in payload) {
      throw new Error(String(payload.error));
    }

    const fullReply = typeof payload.response === "string" ? payload.response : "";
    if (fullReply) {
      onToken?.(fullReply);
    }

    const conversationId =
      typeof payload.conversation_id === "string"
        ? payload.conversation_id
        : context?.conversationId || "";

    return {
      text: fullReply,
      conversationId,
      usage: (payload.usage as UsageResult | null | undefined) ?? null,
      model: (payload.model as string | null | undefined) ?? null,
      providerCalls:
        (payload.providerCalls as ProviderCall[] | null | undefined) ?? [],
      providerAttempts:
        (payload.providerAttempts as ProviderAttempt[] | null | undefined) ?? [],
    };
  },

  getConversations: async (): Promise<Conversation[]> => {
    const { data } = await coreClient.get<{
      conversations: BackendConversation[];
    }>("/chat/conversations");
    return (data.conversations || []).map((c) => ({
      id: c.id,
      title: c.title || "New conversation",
      persona: (c.persona || "auto") as Persona,
      lastMessageAt: c.updatedAt || c.createdAt || new Date().toISOString(),
      messageCount: c._count?.messages ?? 0,
    }));
  },

  getMessages: async (conversationId: string): Promise<ChatMessage[]> => {
    const { data } = await coreClient.get<{
      messages: Array<{
        id: string;
        role: string;
        content: string;
        createdAt: string;
      }>;
    }>(`/chat/conversations/${conversationId}/messages`);
    return (data.messages || []).map((m) => ({
      id: m.id,
      role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
      content: m.content,
      timestamp: m.createdAt,
    }));
  },

  deleteConversation: (id: string) =>
    coreClient.delete(`/chat/conversations/${id}`),

  voice: async (
    audio: Blob,
    mimeType: string,
    context?: {
      lat?: number;
      lon?: number;
      conversationId?: string;
      businessRequestId?: string;
    }
  ): Promise<VoiceResult> => {
    const token = useAuthStore.getState().accessToken;
    const formData = new FormData();
    const ext = mimeType.split("/")[1] || "webm";
    formData.append("audio", audio, `audio.${ext}`);
    if (context?.lat !== undefined) formData.append("lat", String(context.lat));
    if (context?.lon !== undefined) formData.append("lon", String(context.lon));
    if (context?.conversationId) {
      formData.append("conversation_id", context.conversationId);
    }

    const response = await fetch(`${CORE_API_URL}/voice`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(context?.businessRequestId
          ? { "Idempotency-Key": context.businessRequestId }
          : {}),
      },
      body: formData,
      signal: AbortSignal.timeout(90000),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(detail || `Voice request failed: ${response.status}`);
    }

    const result = (await response.json()) as VoiceResult;
    if (
      result.audio_url &&
      !result.audio_url.startsWith("http") &&
      !result.audio_url.startsWith("data:")
    ) {
      result.audio_url = `${CORE_API_URL}${result.audio_url}`;
    }
    return result;
  },

  identify: async (
    file: File,
    context?: {
      lat?: number;
      lon?: number;
      radius?: number;
    }
  ): Promise<IdentifyResult> => {
    const token = useAuthStore.getState().accessToken;
    const formData = new FormData();
    formData.append("image", file);
    if (context?.lat !== undefined) formData.append("lat", String(context.lat));
    if (context?.lon !== undefined) formData.append("lon", String(context.lon));
    if (context?.radius !== undefined) {
      formData.append("radius", String(context.radius));
    }

    const response = await fetch(`${CORE_API_URL}/identify`, {
      method: "POST",
      headers: {
        "Idempotency-Key": crypto.randomUUID(),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
      signal: AbortSignal.timeout(90000),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(detail || `Identify request failed: ${response.status}`);
    }

    return (await response.json()) as IdentifyResult;
  },
};
