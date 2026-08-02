"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
} from "react";
import { useTranslations } from "next-intl";
import {
  Bot,
  X,
  Send,
  LocateFixed,
  Loader2,
  MapPin,
  Shield,
} from "lucide-react";

import { chatApi, type Persona } from "@/lib/api/chat";
import { MarkdownContent } from "@/components/chat/markdown-content";

const DEFAULT_LOCATION = { latitude: 30.0444, longitude: 31.2357 };

interface BotMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  error?: boolean;
}

interface LocationBotProps {
  initialLocation?: { latitude: number; longitude: number } | null;
  locationLabel?: string;
  persona?: Persona;
  suggestions?: string[];
  mode?: "explore" | "safety";
}

export function LocationBot({
  initialLocation,
  locationLabel,
  persona = "auto",
  suggestions = [],
  mode = "explore",
}: LocationBotProps) {
  const t = useTranslations("bot");
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<BotMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(initialLocation || null);
  const [locating, setLocating] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);

  const resolveLocation = useCallback(() => {
    if (initialLocation) {
      setLocation(initialLocation);
      return;
    }
    if (location) return;
    if (!("geolocation" in navigator)) {
      setLocation(DEFAULT_LOCATION);
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLocating(false);
      },
      () => {
        setLocation(DEFAULT_LOCATION);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [initialLocation, location]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(resolveLocation, 0);
    return () => clearTimeout(timer);
  }, [open, resolveLocation]);

  const handleScroll = () => {
    const el = messagesRef.current;
    if (!el) return;
    stickToBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < 60;
  };

  useEffect(() => {
    const el = messagesRef.current;
    if (!el || !stickToBottomRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  const send = useCallback(
    async (raw: string) => {
      const content = raw.trim();
      if (!content || streaming) return;
      setInput("");
      const userMsg: BotMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content,
      };
      const replyId = crypto.randomUUID();
      setMessages((m) => [
        ...m,
        userMsg,
        { id: replyId, role: "assistant", content: "" },
      ]);
      setStreaming(true);
      stickToBottomRef.current = true;

      const { latitude: lat, longitude: lon } = location || DEFAULT_LOCATION;
      try {
        let full = "";
        await chatApi.streamMessage(
          content,
          persona,
          (token) => {
            full += token;
            setMessages((m) =>
              m.map((msg) =>
                msg.id === replyId ? { ...msg, content: full } : msg
              )
            );
          },
          { lat, lon }
        );
        setMessages((m) =>
          m.map((msg) =>
            msg.id === replyId ? { ...msg, content: full } : msg
          )
        );
      } catch (e) {
        const reason =
          e instanceof Error ? e.message : "Something went wrong";
        setMessages((m) =>
          m.map((msg) =>
            msg.id === replyId
              ? { ...msg, content: reason, error: true }
              : msg
          )
        );
      } finally {
        setStreaming(false);
      }
    },
    [streaming, location, persona]
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const hasConversation = messages.length > 0;

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 z-[1100] w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-transform hover:scale-105 bg-gradient-to-br from-gold to-amber-600"
        aria-label={t("open")}
      >
        {open ? (
          <X className="w-6 h-6" />
        ) : mode === "safety" ? (
          <Shield className="w-6 h-6" />
        ) : (
          <Bot className="w-6 h-6" />
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-[1100] w-[26rem] max-w-[calc(100vw-2.5rem)] h-[34rem] max-h-[calc(100vh-7rem)] flex flex-col rounded-2xl overflow-hidden border border-sand/50 dark:border-nile-light/20 bg-white dark:bg-nile shadow-2xl">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-nile to-nile-light dark:from-nile-light dark:to-nile-dark text-sand flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gold text-white flex items-center justify-center flex-shrink-0">
              {mode === "safety" ? (
                <Shield className="w-4.5 h-4.5" />
              ) : (
                <Bot className="w-4.5 h-4.5" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm">{t("title")}</p>
              <p className="text-xs text-sand/70 flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                {locating
                  ? t("locating")
                  : location
                  ? locationLabel ||
                    `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                  : t("noLocation")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              aria-label={t("close")}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={messagesRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-sand/20 dark:bg-nile-dark"
          >
            {!hasConversation && (
              <div className="text-center py-6">
                <Bot className="w-8 h-8 mx-auto mb-2 text-gold opacity-80" />
                <p className="text-sm text-muted-foreground px-4">
                  {t("greeting")}
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gold text-white rounded-tr-sm"
                      : msg.error
                      ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-tl-sm"
                      : "bg-white dark:bg-nile-light/60 text-nile dark:text-sand rounded-tl-sm border border-sand/50 dark:border-nile-light/20"
                  }`}
                >
                  {msg.role === "user" ? (
                    msg.content
                  ) : (
                    <MarkdownContent content={msg.content || "\u200b"} />
                  )}
                  {streaming && msg.content === "" && (
                    <span className="inline-block w-1.5 h-4 bg-current ml-1 animate-blink" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Suggestions */}
          {!hasConversation && suggestions.length > 0 && (
            <div className="px-3 py-2 flex flex-wrap gap-1.5 border-t border-sand/50 dark:border-nile-light/20 bg-white dark:bg-nile">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  disabled={streaming}
                  className="text-xs px-3 py-1.5 rounded-full border border-gold/40 text-gold hover:bg-gold/10 transition-colors disabled:opacity-40"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex items-end gap-2 p-3 border-t border-sand/50 dark:border-nile-light/20 bg-white dark:bg-nile">
            <button
              type="button"
              onClick={resolveLocation}
              disabled={locating || !!initialLocation}
              className="p-2 rounded-lg text-muted-foreground hover:text-nile dark:hover:text-sand hover:bg-sand/30 dark:hover:bg-nile-light/20 transition-all disabled:opacity-50"
              title={t("useMyLocation")}
            >
              {locating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LocateFixed className="w-4 h-4" />
              )}
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("placeholder")}
              rows={1}
              className="flex-1 px-3 py-2 rounded-xl border border-sand/60 dark:border-nile-light/40 bg-sand/20 dark:bg-nile resize-none text-sm text-nile dark:text-sand placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
            />
            <button
              type="button"
              onClick={() => send(input)}
              disabled={!input.trim() || streaming}
              className="p-2 rounded-xl bg-gold hover:bg-gold-dark text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label={t("send")}
            >
              {streaming ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
