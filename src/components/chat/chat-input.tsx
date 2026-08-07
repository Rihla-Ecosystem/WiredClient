"use client";

import { useState, useRef, useCallback, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import {
  Send,
  Mic,
  ImagePlus,
  MapPin,
  Bot,
  Loader2,
  StopCircle,
  X,
} from "lucide-react";

import { useChatStore } from "@/lib/stores/chat-store";

const DEFAULT_LOCATION = { latitude: 30.0444, longitude: 31.2357 };

const PERSONAS = [
  { value: "auto" as const, labelKey: "personaAuto", icon: Bot },
  { value: "tour_guide" as const, labelKey: "personaTourGuide", icon: MapPin },
  { value: "local_expert" as const, labelKey: "personaLocalExpert", icon: MapPin },
  { value: "safety_guru" as const, labelKey: "personaSafetyGuru", icon: ShieldIcon },
] as const;

function ShieldIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export function ChatInput() {
  const t = useTranslations("chat");
  const [input, setInput] = useState("");
  const [showPersonas, setShowPersonas] = useState(false);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locating, setLocating] = useState(false);
  const [recording, setRecording] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const {
    persona: activePersona,
    setActivePersona,
    sendMessage,
    sendVoice,
    sendImage,
    isStreaming,
  } = useChatStore();

  const resolveLocation = useCallback(() => {
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
  }, [location]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      streamRef.current = stream;
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const mimeType = recorder.mimeType || "audio/webm";
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setRecording(false);
        sendVoice(
          blob,
          mimeType,
          location
            ? { lat: location.latitude, lon: location.longitude }
            : undefined
        );
      };
      recorder.start();
      setRecording(true);
    } catch {
      // microphone unavailable or permission denied — leave recording off
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
    mediaRecorderRef.current = null;
  };

  const toggleRecording = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    sendImage(
      file,
      location ? { lat: location.latitude, lon: location.longitude } : undefined
    );
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    sendMessage(
      trimmed,
      location
        ? { lat: location.latitude, lon: location.longitude }
        : undefined
    );
    setInput("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = inputRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 150) + "px";
    }
  };

  return (
    <div className="border-t border-sand/50 dark:border-nile-light/20 bg-white dark:bg-nile-dark px-4 py-3">
      {/* Persona bar */}
      <div className="flex items-center gap-2 mb-2">
        <button
          type="button"
          onClick={() => setShowPersonas(!showPersonas)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-sand/30 dark:bg-nile-light/20 text-muted-foreground hover:text-nile dark:hover:text-sand transition-colors"
        >
          <Bot className="w-3.5 h-3.5" />
          {t(`persona${activePersona === "tour_guide" ? "TourGuide" : activePersona === "local_expert" ? "LocalExpert" : activePersona === "safety_guru" ? "SafetyGuru" : "Auto"}`)}
        </button>
      </div>

      {/* Persona dropdown */}
      {showPersonas && (
        <div className="mb-2 p-2 bg-sand/20 dark:bg-nile rounded-xl border border-sand/50 dark:border-nile-light/30">
          <div className="grid grid-cols-4 gap-1">
            {PERSONAS.map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => {
                    setActivePersona(
                      p.value === "auto" ? null : p.value
                    );
                    setShowPersonas(false);
                  }}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition-all ${
                    (p.value === "auto" && !activePersona) ||
                    activePersona === p.value
                      ? "bg-[#2E9C93]/15 text-[#2E9C93]"
                      : "text-muted-foreground hover:bg-sand/30 dark:hover:bg-nile-light/20"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t(p.labelKey)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Location badge */}
      {location && (
        <div className="flex items-center gap-2 mb-2 px-1">
          <MapPin className="w-3.5 h-3.5 text-gold" />
          <span className="text-xs text-muted-foreground">
            {`${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
          </span>
          <button
            type="button"
            onClick={() => setLocation(null)}
            className="p-0.5 rounded text-muted-foreground hover:text-nile dark:hover:text-sand hover:bg-sand/30 dark:hover:bg-nile-light/20 transition-all"
            aria-label={t("clearLocation")}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={toggleRecording}
            disabled={isStreaming}
            className={`p-2 rounded-lg transition-all ${
              recording
                ? "text-red-500 bg-red-50 dark:bg-red-900/20 animate-pulse"
                : "text-muted-foreground hover:text-nile dark:hover:text-sand hover:bg-sand/30 dark:hover:bg-nile-light/20"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            title={recording ? t("stopRecording") : t("voiceInput")}
          >
            {recording ? (
              <StopCircle className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isStreaming}
            className="p-2 rounded-lg text-muted-foreground hover:text-nile dark:hover:text-sand hover:bg-sand/30 dark:hover:bg-nile-light/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            title={t("imageInput")}
          >
            <ImagePlus className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={resolveLocation}
            disabled={locating}
            className={`p-2 rounded-lg transition-all ${
              location
                ? "text-gold"
                : "text-muted-foreground hover:text-nile dark:hover:text-sand hover:bg-sand/30 dark:hover:bg-nile-light/20"
            } disabled:opacity-60`}
            title={location ? t("locationSet") : t("locationInput")}
          >
            {locating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <MapPin className="w-5 h-5" />
            )}
          </button>
        </div>

        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            handleInput();
          }}
          onKeyDown={handleKeyDown}
          placeholder={t("placeholder")}
          rows={1}
          className="flex-1 px-4 py-2.5 rounded-xl border border-sand/60 dark:border-nile-light/40 bg-sand/20 dark:bg-nile resize-none text-sm text-nile dark:text-sand placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all max-h-[150px]"
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!input.trim() || isStreaming}
          className="p-2.5 rounded-xl bg-[#C8831A] hover:bg-[#a96f14] text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ boxShadow: "0 3px 12px rgba(200,131,26,0.35)" }}
        >
          <Send className="w-5 h-5" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
