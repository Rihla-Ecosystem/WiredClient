"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Bot } from "lucide-react";
import { RafiqDrawer } from "@/components/shared/rafiq-drawer";

const C = { faience: "#2E9C93" };

export function RafiqLauncher() {
  const t = useTranslations("chat");
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const route = pathname.split("/").filter(Boolean)[1] ?? "";

  const suggestions = [t("suggestions.nearby"), t("suggestions.hidden"), t("suggestions.history")].filter(Boolean);

  if (route === "chat") return null;

  return (
    <>
      {/* Floating trigger */}
<button
        onClick={() => setOpen(true)}
        aria-label="Ask Rafiq"
        title="Ask Rafiq"
        className="flex"
        style={{
          position: "fixed",
          bottom: 24,
          right: 20,
          zIndex: 55,
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: C.faience,
          color: "#0B2F30",
          border: "none",
          cursor: "pointer",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(46,156,147,0.4)",
        }}
      >
        <Bot size={26} />
      </button>

      <RafiqDrawer open={open} onClose={() => setOpen(false)} suggestions={suggestions} />
    </>
  );
}