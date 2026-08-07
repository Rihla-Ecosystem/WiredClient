"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { RihlaGlyph } from "@/components/shared/rihla-logo";
import { NotificationBell } from "@/components/layout/notification-bell";
import {
  Menu, LogOut, User, Wallet, Compass, Shield, X,
  Home, MessageCircle, Landmark, Coins, Settings, Ticket,
} from "lucide-react";

const C = {
  basalt: "#141008",
  nile: "#0F3D3E",
  limestone: "#F5EFE0",
  sand: "#D4A84E",
  solarBright: "#E8A820",
  copper: "#8A5A34",
  alertAmber: "#D98E2C",
  faience: "#2E9C93",
};

const PARTICLES = [
  { left: "6%", top: "42%", delay: "0s", dur: "11s", size: 3 },
  { left: "18%", top: "30%", delay: "2.2s", dur: "13s", size: 2 },
  { left: "34%", top: "52%", delay: "4.1s", dur: "10s", size: 2.5 },
  { left: "52%", top: "35%", delay: "1.4s", dur: "12s", size: 2 },
  { left: "64%", top: "58%", delay: "5.5s", dur: "9s", size: 3 },
  { left: "78%", top: "28%", delay: "3.3s", dur: "12s", size: 2 },
  { left: "88%", top: "46%", delay: "0.8s", dur: "10s", size: 2.5 },
  { left: "93%", top: "62%", delay: "6.2s", dur: "13s", size: 2 },
];

const SUN_ROTATION = Array.from({ length: 12 }, (_, i) => i * 30);

const HIEROGLYPHS = [
  { glyph: "𓋹", left: "3%", top: "22%", delay: "0s", dur: "6s", size: 20 },   // ankh
  { glyph: "𓂀", left: "11%", top: "55%", delay: "1.4s", dur: "7s", size: 22 },  // eye of horus
  { glyph: "𓆣", left: "22%", top: "30%", delay: "3s", dur: "6.5s", size: 18 }, // scarab
  { glyph: "𓅃", left: "42%", top: "60%", delay: "0.8s", dur: "8s", size: 20 }, // falcon
  { glyph: "𓇼", left: "56%", top: "24%", delay: "4s", dur: "6s", size: 18 },   // star
  { glyph: "𓊽", left: "76%", top: "58%", delay: "2.2s", dur: "7s", size: 19 }, // djed pillar
  { glyph: "𓆼", left: "88%", top: "28%", delay: "1.2s", dur: "8s", size: 20 }, // lotus
  { glyph: "𓆑", left: "31%", top: "52%", delay: "4.6s", dur: "6.5s", size: 17 }, // cobra
];

interface TopBarLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navLinks: TopBarLink[] = [
  { href: "/", label: "Home", icon: <Home size={17} strokeWidth={1.9} /> },
  { href: "/explore", label: "Explore", icon: <Compass size={17} strokeWidth={1.9} /> },
  { href: "/chat", label: "Rafiq", icon: <MessageCircle size={17} strokeWidth={1.9} /> },
  { href: "/safety", label: "Safety", icon: <Shield size={17} strokeWidth={1.9} /> },
  { href: "/tickets", label: "Tickets", icon: <Ticket size={17} strokeWidth={1.9} /> },
  { href: "/currency", label: "Currency", icon: <Coins size={17} strokeWidth={1.9} /> },
  { href: "/quests", label: "Quests", icon: <Landmark size={17} strokeWidth={1.9} /> },
];

export function TopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const initial = (user?.displayName || "Traveler").charAt(0).toUpperCase();
  const pageTitle = pathname.split("/").filter(Boolean)[1] ?? "Home";
  const prettyTitle = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1);

  return (
    <>
      <style>{`
        @keyframes rihlaGrad { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes rihlaSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes rihlaParticle { 0%{transform:translateY(0) scale(1);opacity:0} 12%{opacity:0.9} 70%{opacity:0.5} 100%{transform:translateY(-120px) scale(0.3);opacity:0} }
        @keyframes rihlaWiggle { 0%,100%{transform:rotate(0)} 20%{transform:rotate(12deg)} 40%{transform:rotate(-10deg)} 60%{transform:rotate(6deg)} 80%{transform:rotate(-4deg)} }
        @keyframes rihlaGlow { 0%,100%{box-shadow:0 0 0 0 rgba(232,168,32,0.45)} 50%{box-shadow:0 0 0 8px rgba(232,168,32,0)} }
        @keyframes rihlaFadeUp { 0%{opacity:0;transform:translateY(10px)} 100%{opacity:1;transform:translateY(0)} }
      `}</style>

      <div
        style={{
          background: `linear-gradient(-60deg, ${C.basalt}, ${C.nile}, ${C.basalt})`,
          backgroundSize: "300% 300%",
          animation: "rihlaGrad 14s ease infinite",
          borderBottom: "1px solid rgba(232,168,32,0.22)",
          minHeight: 68,
          position: "sticky",
          top: 0,
          zIndex: 30,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
        {/* Rotating solar disc */}
        <div
          style={{
            position: "absolute",
            right: "8%",
            top: -110,
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "repeating-conic-gradient(from 0deg, rgba(232,168,32,0) 0deg 9deg, rgba(232,168,32,0.10) 9deg 18deg)",
            animation: "rihlaSpin 60s linear infinite",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: "13%",
            top: -52,
            width: 150,
            height: 150,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(232,168,32,0.35) 0%, rgba(232,168,32,0.10) 55%, transparent 75%)",
            pointerEvents: "none",
          }}
        />

        {/* Floating sand particles */}
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: C.solarBright,
              opacity: 0,
              animation: `rihlaParticle ${p.dur}s linear ${p.delay} infinite`,
              pointerEvents: "none",
            }}
          />
        ))}

        {/* Floating hieroglyphs */}
        {HIEROGLYPHS.map((h, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: h.left,
              top: h.top,
              fontFamily: "'Noto Sans Egyptian Hieroglyphs', 'Segoe UI Symbol', sans-serif",
              fontSize: h.size,
              color: "#F0B429",
              textShadow: "0 0 12px rgba(240,180,41,0.65), 0 0 2px rgba(240,180,41,0.9)",
              opacity: 0.9,
              animation: `rihlaHiero ${h.dur}s ease-in-out ${h.delay} infinite`,
              willChange: "transform",
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            {h.glyph}
          </div>
        ))}

        {/* Horizon glow line */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 2,
            background: "linear-gradient(90deg, transparent, rgba(232,168,32,0.7), rgba(245,192,64,0.9), rgba(232,168,32,0.7), transparent)",
            backgroundSize: "200% 100%",
            animation: "rihlaGrad 6s ease infinite",
          }}
        />
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 2,
            padding: "0 26px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            minHeight: 68,
            animation: "rihlaFadeUp 0.6s ease-out both",
          }}
        >
          {/* Left: mobile menu + brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden"
              style={{ background: "none", border: "none", color: `${C.limestone}80`, cursor: "pointer", padding: 4 }}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }}>
              <RihlaGlyph size={36} />
              <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1 }} className="hidden sm:flex">
                <span style={{ fontFamily: "'Cairo',sans-serif", fontSize: "18px", fontWeight: 500, color: C.limestone, letterSpacing: "0.02em" }}>رحلة Rihla</span>
                <span style={{ fontFamily: "'Cairo',sans-serif", fontSize: "9.5px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: `${C.sand}90`, marginTop: 3 }}>AI Travel Companion</span>
              </span>
            </Link>
            <span style={{ width: 1, height: 22, background: `${C.limestone}18`, flexShrink: 0 }} className="hidden md:block" />
            <span
              style={{
                fontFamily: "'Cairo',sans-serif",
                fontSize: "16px",
                fontWeight: 400,
                color: `${C.limestone}80`,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              className="hidden md:block"
            >
              {pageTitle}
            </span>
          </div>

          {/* Mid: desktop nav */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = link.href === "/"
                ? pathname === "/" || pathname.length === 0
                : pathname.includes(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    fontFamily: "'Cairo',sans-serif",
                    fontSize: "13px",
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? C.solarBright : `${C.limestone}70`,
                    padding: "8px 11px",
                    borderRadius: 9,
                    background: isActive ? "rgba(245,239,224,0.10)" : "transparent",
                    whiteSpace: "nowrap",
                  }}
                >
                  {link.icon}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <NotificationBell />

            <span className="hidden md:inline-flex">
              <LanguageSwitcher />
            </span>
            <span className="hidden md:inline-flex">
              <ThemeToggle />
            </span>

            {isAuthenticated ? (
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setUserOpen(!userOpen)}
                  aria-label="Account"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg,${C.sand}55,${C.copper}55)`,
                    border: `2px solid rgba(232,168,32,0.5)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    animation: "rihlaGlow 3s ease-in-out infinite",
                  }}
                >
                  <span style={{ fontFamily: "'Cairo',sans-serif", fontSize: "15px", fontWeight: 500, color: C.limestone }}>{initial}</span>
                </button>
                {userOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 glass-card p-1.5 z-30" style={{ background: "var(--surface)" }}>
                      <Link href="/profile" onClick={() => setUserOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-sand/30 dark:hover:bg-nile-light/20">
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <Link href="/wallet" onClick={() => setUserOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-sand/30 hover:bg-sand/30 dark:hover:bg-nile-light/20">
                        <Wallet className="w-4 h-4" /> Wallet
                      </Link>
                      <Link href="/settings" onClick={() => setUserOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-sand/30 hover:bg-sand/30 dark:hover:bg-nile-light/20">
                        <Settings className="w-4 h-4" /> Settings
                      </Link>
                      <Link href="/quests" onClick={() => setUserOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-sand/30 hover:bg-sand/30 dark:hover:bg-nile-light/20">
                        <Compass className="w-4 h-4" /> Quests
                      </Link>
                      <hr className="my-1 border-primary-200/20" />
                      <button
                        onClick={() => { logout(); setUserOpen(false); router.push("/"); }}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  fontWeight: 600,
                  fontFamily: "'Cairo',sans-serif",
                  fontSize: "13px",
                  background: C.solarBright,
                  color: "#141008",
                  boxShadow: "0 3px 14px rgba(232,168,32,0.35)",
                }}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile dropdown nav */}
      {mobileOpen && (
        <div className="md:hidden glass border-b border-primary-200/20" style={{ position: "relative", zIndex: 29 }}>
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-sand/30 hover:bg-sand/30 dark:hover:bg-nile-light/20">
                <span className="text-current">{link.icon}</span>
                {link.label}
              </Link>
            ))}
            <Link href="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-sand/30 dark:hover:bg-nile-light/20">
              <User size={17} strokeWidth={1.9} /> Profile
            </Link>
            <Link href="/wallet" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-sand/30 dark:hover:bg-nile-light/20">
              <Wallet size={17} strokeWidth={1.9} /> Wallet
            </Link>
            <Link href="/settings" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-sand/30 dark:hover:bg-nile-light/20">
              <Settings size={17} strokeWidth={1.9} /> Settings
            </Link>
            <div className="flex items-center gap-2 pt-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </>
  );
}