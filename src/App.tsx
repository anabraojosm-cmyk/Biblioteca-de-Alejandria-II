import { useState, useRef, useEffect, useMemo } from "react";
import { MessageSquare, LogOut } from "lucide-react";
import { Modal } from "./modals";
import { SaveControl, VerticalTabs } from "./components/layout";
import { LibraryScreen } from "./pages/Library";
import { ShelfLibrary } from "./pages/Shelf";
import { BookTopBar } from "./pages/Book";
import { ChaptersTab } from "./tabs/ChaptersTab";
import {
  CharactersTab, StructureTab, CalendarTab, AppearanceTab, StoryTimelineTab,
  LocationTab, UniverseTab, LoreTab, CorkboardTab, ExportTab, BetaReaderTab,
} from "./components/tabs";
import { useLibraryActions } from "./state/actions";
import { primaryBtn, smallOutlineBtn } from "./styles";
import { colorForReader } from "./utils";
import { DARK, LIGHT } from "./constants";
import {
  seedUniverses, seedSagas, seedBooks, seedBookActs, seedChapters, seedCharacters,
  seedUniverseEntries, seedEvents, seedAppearances, seedStoryEvents, seedLocations,
  seedEraConfig, seedBorders, seedLore, seedBestiary, seedCork, seedIdeas, seedSurveys,
} from "./data/seeds";
import { supabase } from "./lib/supabase";
import Auth from "./Auth";

function useInjectedFont() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `.no-select{-webkit-user-select:none;user-select:none;}`;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
}

function useIsMobile() {
  const [mobile, setMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 860 : false);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 860);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
}

function protagColor(light: boolean) { return light ? "#D4A017" : "#FF3FA4"; }

const SEED_BUNDLE = {
  universes: seedUniverses, sagas: seedSagas, books: seedBooks, bookActs: seedBookActs,
  chapters: seedChapters, characters: seedCharacters, universeEntries: seedUniverseEntries,
  events: seedEvents, appearances: seedAppearances, storyEvents: seedStoryEvents,
  locations: seedLocations, eraConfig: seedEraConfig, borders: seedBorders,
  loreEntries: seedLore, bestiary: seedBestiary, corkNotes: seedCork, ideas: seedIdeas, surveys: seedSurveys,
};

// ---- Punto de entrada: gestiona sesión y carga de datos desde Supabase ----
export default function App() {
  const [session, setSession] = useState<any>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [cloudData, setCloudData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCheckingSession(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setShowWelcomeMessage(false);
      return;
    }

    setShowWelcomeMessage(true);
    const timer = window.setTimeout(() => {
      setShowWelcomeMessage(false);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [session]);

  useEffect(() => {
    if (!session) return;
    setLoadingData(true);
    supabase
      .from("library_data")
      .select("data")
      .eq("user_id", session.user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) console.error("Error cargando datos:", error);
        setCloudData(data?.data ?? null);
        setLoadingData(false);
      });
  }, [session]);

  if (checkingSession) return <CenteredMessage text="Bienvenida de nuevo, Majestad." subtitle="Como nos pidió, la biblioteca ha sido custodiada." />;
  if (!session) return <Auth />;
  if (showWelcomeMessage || loadingData) return <CenteredMessage text="Bienvenida de nuevo, Majestad." subtitle="Como nos pidió, la biblioteca ha sido custodiada." />;

  return <Workspace key={session.user.id} userId={session.user.id} initialData={cloudData} />;
}

function CenteredMessage({ text, subtitle }: { text: string; subtitle?: string }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(circle at top, rgba(180, 146, 88, 0.18), transparent 42%), #15161d", color: "#F6F0E2", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ textAlign: "center", position: "relative", padding: "10px 18px" }}>
        <div style={{ position: "absolute", inset: "-18px 8px -8px 8px", filter: "blur(26px)", background: "radial-gradient(circle, rgba(201, 162, 75, 0.26), transparent 62%)", pointerEvents: "none", animation: "mysticGlow 4s ease-in-out infinite alternate" }} />
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 28, letterSpacing: "0.08em", textTransform: "uppercase", color: "#F2E7C3", marginBottom: 10, position: "relative", textShadow: "0 0 8px rgba(255,255,255,0.8), 0 0 18px rgba(214, 181, 96, 0.7), 0 0 30px rgba(214, 181, 96, 0.35)", animation: "letterShimmer 3s ease-in-out infinite alternate" }}>{text}</div>
        {subtitle && <div style={{ fontSize: 12.5, color: "#C7B89A", letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.9, position: "relative", textShadow: "0 0 14px rgba(214, 181, 96, 0.28)", animation: "subtitlePulse 3.5s ease-in-out infinite alternate" }}>{subtitle}</div>}
      </div>
      <style>{`
        @keyframes mysticGlow {
          0% { transform: translateX(-10px) scale(0.98); opacity: 0.45; }
          50% { transform: translateX(10px) scale(1.05); opacity: 0.8; }
          100% { transform: translateX(-6px) scale(1); opacity: 0.6; }
        }
        @keyframes letterShimmer {
          0% { filter: drop-shadow(0 0 4px rgba(255,245,198,0.4)); }
          50% { filter: drop-shadow(0 0 10px rgba(214,181,96,0.9)) drop-shadow(0 0 20px rgba(255,245,198,0.5)); }
          100% { filter: drop-shadow(0 0 4px rgba(255,255,255,0.7)); }
        }
        @keyframes subtitlePulse {
          0% { opacity: 0.7; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function VaultTransition({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, background: "#0a0a0d", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`
        @keyframes doorOpenLeft { from { transform:translateX(0); } to { transform:translateX(-100%); } }
        @keyframes doorOpenRight { from { transform:translateX(0); } to { transform:translateX(100%); } }
        @keyframes handleGlow {
          0%,100% { filter:brightness(.85) drop-shadow(0 0 2px rgba(183,126,36,.35)); }
          50% { filter:brightness(1.35) drop-shadow(0 0 12px rgba(224,169,64,.9)); }
        }
      `}</style>

      <div style={{ position: "absolute", inset: 0, background: "#090807" }} />
      <div style={{ position: "absolute", inset: 0, width: "50%", background: "linear-gradient(90deg, #0d0907 0%, #24150e 34%, #3a2112 78%, #1b100a 100%), repeating-linear-gradient(90deg, rgba(11,6,3,.4) 0 3px, transparent 3px 38px)", borderRight: "5px solid #4b2c16", boxShadow: "inset -24px 0 28px rgba(0,0,0,.72)", animation: "doorOpenLeft 1.4s ease forwards" }}>
        <div style={{ position: "absolute", inset: "8% 13%", border: "2px solid rgba(82,48,23,.8)", boxShadow: "inset 0 0 20px rgba(0,0,0,.55)" }} />
        <div style={{ position: "absolute", top: "50%", right: "8%", width: 30, height: 30, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #f1c56a, #9b681e 42%, #4a2b0b 78%)", border: "3px solid #5d3a12", boxShadow: "0 0 0 2px #b27a25, inset 3px 3px 5px rgba(255,220,130,.55)", animation: "handleGlow 1.1s ease-in-out infinite" }} />
      </div>
      <div style={{ position: "absolute", inset: 0, left: "50%", width: "50%", background: "linear-gradient(270deg, #0d0907 0%, #24150e 34%, #3a2112 78%, #1b100a 100%), repeating-linear-gradient(270deg, rgba(11,6,3,.4) 0 3px, transparent 3px 38px)", borderLeft: "5px solid #4b2c16", boxShadow: "inset 24px 0 28px rgba(0,0,0,.72)", animation: "doorOpenRight 1.4s ease forwards" }}>
        <div style={{ position: "absolute", inset: "8% 13%", border: "2px solid rgba(82,48,23,.8)", boxShadow: "inset 0 0 20px rgba(0,0,0,.55)" }} />
        <div style={{ position: "absolute", top: "50%", left: "8%", width: 30, height: 30, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #f1c56a, #9b681e 42%, #4a2b0b 78%)", border: "3px solid #5d3a12", boxShadow: "0 0 0 2px #b27a25, inset 3px 3px 5px rgba(255,220,130,.55)", animation: "handleGlow 1.1s ease-in-out infinite" }} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MagicVault.tsx
// Reemplaza el componente `MagicVault` (y opcionalmente `useVaultLight`) que
// ya tienes en App.tsx por esta versión. Misma firma de props, misma lógica
// de notas/filtros/formulario — solo cambia la piel visual para parecerse a
// la cámara de piedra circular con el rayo de luz cenital y la mesa redonda.
//
// Requiere que sigan existiendo en tu archivo: smallOutlineBtn (import desde
// "./styles") y useMemo/useState/useEffect de React, tal como ya los tienes.
// ---------------------------------------------------------------------------

function useVaultLight() {
  const [hour, setHour] = useState(new Date().getHours());
  useEffect(() => {
    const id = setInterval(() => setHour(new Date().getHours()), 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);
  // Color del rayo de luz según la hora del día (mañana / mediodía / tarde / noche)
  if (hour >= 9 && hour < 13) return { glow: "rgba(255,201,140,0.9)", ambient: "rgba(255,196,140,0.10)" };
  if (hour >= 13 && hour < 17) return { glow: "rgba(173, 166, 126, 0.95)", ambient: "rgba(95, 37, 99, 0.12)" };
  if (hour >= 17 && hour < 20) return { glow: "rgba(183, 162, 76, 0.85)", ambient: "rgba(255,140,90,0.10)" };
  if (hour >= 20 && hour < 6) return { glow: "rgba(59, 58, 42, 0.85)", ambient: "rgba(255,140,90,0.10)" };
  return { glow: "rgba(102, 112, 158, 0.55)", ambient: "rgba(120,140,220,0.08)" };
}

function MagicVault({ notifications, notes, books, sagas, characters, onAddNote, onDeleteNote, onMoveNote, onBack, isMobile, filter, setFilter }: any) {
  const light = useVaultLight();
  const protagonists = [...new Map((characters || []).filter((c: any) => c.importance === "Principal" || /protagon/i.test(c.role || "") || Object.values(c.roleByBook || {}).some((role: any) => /protagon/i.test(String(role)))).map((c: any) => [c.name, c])).values()];
  const vaultPhrases = notifications.map((n: any) => `${n.title}: ${n.text}`);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [secondElfAwake, setSecondElfAwake] = useState(false);
  const displayedPhrases = secondElfAwake ? [...vaultPhrases, "Elfo de la puerta derecha: vuelve ya al trabajo, o que haces aun por aqui"] : vaultPhrases;
  const wrappedPhrase = displayedPhrases.length > 0
    ? displayedPhrases[phraseIndex % displayedPhrases.length].split(" ").reduce((lines: string[], word: string, index: number) => {
      const lineIndex = Math.floor(index / 6);
      lines[lineIndex] = `${lines[lineIndex] || ""}${lines[lineIndex] ? " " : ""}${word}`;
      return lines;
    }, []).map((line: string) => <span key={line} style={{ display: "block" }}>{line}</span>)
    : null;
  useEffect(() => {
    if (displayedPhrases.length === 0) return;
    const id = setInterval(() => setPhraseIndex((i) => (i + 1) % displayedPhrases.length), 60000);
    return () => clearInterval(id);
  }, [displayedPhrases.length]);
  useEffect(() => {
    const id = window.setTimeout(() => setSecondElfAwake(true), 5 * 60 * 1000);
    return () => window.clearTimeout(id);
  }, []);

  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [urgent, setUrgent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onAddNote(text, date, urgent);
    setText(""); setUrgent(false); setDate(new Date().toISOString().slice(0, 10));
    setShowForm(false);
  }

  const filteredNotes = useMemo(() => {
    if (!Array.isArray(notes)) return [];
    if (filter === "urgent") return notes.filter((n: any) => n.urgent);
    if (filter === "today") return notes.filter((n: any) => n.date === new Date().toISOString().slice(0, 10));
    if (filter === "upcoming") return notes.filter((n: any) => n.date >= new Date().toISOString().slice(0, 10)).sort((a: any, b: any) => a.date.localeCompare(b.date));
    return notes;
  }, [filter, notes]);

  // Distribuye las notas sobre el óvalo de la mesa (coords en % del contenedor de escena)
    function noteLayout(note: any, index: number, total: number) {
      if (typeof note.left === "number" && typeof note.top === "number") {
        return { rotate: note.rotate ?? 0, left: note.left, top: note.top };
      }
      const id = note.id;
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360;
    const spread = Math.min(total, 10);
    const t = spread <= 1 ? 0.5 : index / (spread - 1);
    const angle = -0.9 + t * 1.8; // radianes, abanico frontal sobre la mesa
    const rx = 15 + (h % 6); // radio horizontal %
    const ry = 4.5 + (h % 3); // radio vertical % (perspectiva elíptica)
    return {
      rotate: (h % 16) - 8,
      left: 50 + Math.sin(angle) * rx,
      top: 84 + Math.cos(angle) * -ry + (h % 4),
    };
  }

  const today = new Date().toISOString().slice(0, 10);
  const visibleNotes = filteredNotes.filter((note: any) => !note.date || note.date <= today);

  return (
    <div style={{ height: "100%", overflow: "auto", position: "relative", color: "#EFE3C8", background: "#0e0c09" }}>
      <style>{`
        @keyframes vaultBeamPulse { 0%,100% { opacity:.85; } 50% { opacity:1; } }
        @keyframes vaultTorchFlicker { 0%,100% { opacity:.7; r:6.5;} 50% { opacity:1; r:7.5;} }
        @keyframes vaultBubbleIn { from { opacity:0; transform:translateY(6px) scale(.98);} to { opacity:1; transform:translateY(0) scale(1);} }
        @keyframes vaultElfSway { 0%,100% { transform:translateY(0);} 50% { transform:translateY(-4px);} }
        @keyframes vaultDust { 0% { transform:translateY(0); opacity:0;} 12%{opacity:.55;} 100% { transform:translateY(260px); opacity:0;} }
        @keyframes vaultRunePulse { 0%,100% { opacity:.18; } 50% { opacity:.65; } }
        @keyframes vaultNameRunePulse { 0%,100% { opacity:.28; text-shadow:0 0 4px rgba(193,229,139,.18); } 50% { opacity:.92; text-shadow:0 0 8px rgba(193,229,139,.8), 0 0 22px rgba(139,206,114,.45); } }
        @keyframes vaultShadowDrift { 0%,100% { transform:translateX(-8px); opacity:.18; } 50% { transform:translateX(8px); opacity:.34; } }
        @keyframes vaultMossGlow { 0%,100% { opacity:.35; } 50% { opacity:.9; } }
      `}</style>

      <button onClick={onBack} style={{ ...smallOutlineBtn, position: "absolute", top: 16, left: 16, zIndex: 8, background: "rgba(20,17,13,0.7)" }}>
        ← Volver a la biblioteca
      </button>

      {/* Escenario SVG: bóveda, arcos, mesa, haz de luz */}
      <div style={{ position: "relative", width: "100%", height: "calc(100vh - 8px)", minHeight: 620, maxWidth: "none", margin: "0 auto" }}>
        <svg viewBox="0 0 800 620" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
          <defs>
            <radialGradient id="domeGrad" cx="50%" cy="18%" r="92%">
              <stop offset="0%" stopColor="#3e3225" />
              <stop offset="38%" stopColor="#2a2118" />
              <stop offset="72%" stopColor="#17130f" />
              <stop offset="100%" stopColor="#080706" />
            </radialGradient>
            <radialGradient id="oculusGlow" cx="50%" cy="46%" r="60%">
              <stop offset="0%" stopColor={light.glow} stopOpacity="0.95" />
              <stop offset="100%" stopColor={light.glow} stopOpacity="0" />
            </radialGradient>
            <linearGradient id="beamGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={light.glow} stopOpacity="0.7" />
              <stop offset="100%" stopColor={light.glow} stopOpacity="0" />
            </linearGradient>
            <radialGradient id="archGlow" cx="50%" cy="38%" r="76%">
              <stop offset="0%" stopColor="#70401f" stopOpacity="0.42" />
              <stop offset="48%" stopColor="#24150c" stopOpacity="0.96" />
              <stop offset="100%" stopColor="#060504" stopOpacity="1" />
            </radialGradient>
            <radialGradient id="tableGrad" cx="45%" cy="35%" r="70%">
              <stop offset="0%" stopColor="#a8733e" />
              <stop offset="32%" stopColor="#754522" />
              <stop offset="72%" stopColor="#4d2914" />
              <stop offset="100%" stopColor="#211006" />
            </radialGradient>
            <linearGradient id="tableEdge" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2c1a0c" />
              <stop offset="100%" stopColor="#170d05" />
            </linearGradient>
            <filter id="softBlur"><feGaussianBlur stdDeviation="6" /></filter>
            <filter id="softBlurSm"><feGaussianBlur stdDeviation="2.5" /></filter>
            <filter id="stoneRelief" x="-12%" y="-12%" width="124%" height="124%">
              <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" seed="9" result="stone" />
              <feDisplacementMap in="SourceGraphic" in2="stone" scale="10" />
              <feGaussianBlur stdDeviation="0.25" />
            </filter>
          </defs>

          {/* Bóveda de piedra */}
          <rect x="0" y="0" width="800" height="620" fill="url(#domeGrad)" />
          <path d="M0,190 C105,86 247,33 400,42 C553,33 695,86 800,190 L800,0 L0,0 Z" fill="#17110c" opacity="0.44" />
          {/* vetas y estratos orgánicos de la roca */}
          <g fill="none" stroke="#1d1209" opacity="0.42" filter="url(#stoneRelief)">
            <path d="M-30 112 C105 55 170 110 280 66 S495 38 612 84 S735 63 835 118" strokeWidth="8" />
            <path d="M-30 176 C88 121 174 177 286 132 S500 112 618 151 S739 132 835 182" strokeWidth="5" />
            <path d="M-20 250 C96 208 189 257 294 213 S505 191 622 226 S730 216 820 252" strokeWidth="3" />
          </g>
          {/* Runas antiguas y sombras que se mueven suavemente sobre la piedra */}
          <g fill="none" stroke="#b79a55" strokeWidth="2" opacity="0.3" style={{ animation: "vaultRunePulse 7s ease-in-out infinite" }}>
            <path d="M104 142 l12 -16 12 16 -12 16z M116 126v32 M104 142h24" />
            <path d="M672 150 q12 -20 24 0 q-12 20 -24 0 M684 130v40" />
            <path d="M260 286 l12 -18 12 18 -12 20z M272 268v38" />
          </g>
          <path d="M80 276 C180 232 230 278 302 250 S454 228 520 260 S650 290 730 250 L760 430 C650 396 560 432 470 410 S270 392 150 430 Z" fill="#5a4c48" opacity="0.24" filter="url(#softBlur)" style={{ animation: "vaultShadowDrift 11s ease-in-out infinite" }} />
          {/* Óculo + halo */}
          <ellipse cx="400" cy="94" rx="150" ry="65" fill="url(#oculusGlow)" filter="url(#softBlur)" />
          <ellipse cx="400" cy="94" rx="76" ry="29" fill="#5d5f2f" opacity="0.92" filter="url(#softBlurSm)" />
          <ellipse cx="400" cy="94" rx="76" ry="29" fill="#444831" opacity="0.48" />
          <ellipse cx="400" cy="91" rx="52" ry="17" fill="#d2ce9b" opacity="0.8" filter="url(#softBlurSm)" />
          <g fill="#bed173" style={{ animation: "vaultMossGlow 4s ease-in-out infinite" }}>
            <circle cx="104" cy="470" r="3" /><circle cx="112" cy="468" r="2" /><circle cx="692" cy="472" r="3" /><circle cx="700" cy="469" r="2" />
          </g>
          {/* Haz de luz (forma orgánica, no polígono duro — bordes curvos + blur) */}
          <path
            d="M350,106 C377,114 425,109 451,106 C469,228 524,420 574,600 L216,600 C274,419 327,226 350,106 Z"
            fill="url(#beamGrad)" filter="url(#softBlur)"
            style={{ animation: "vaultBeamPulse 5s ease-in-out infinite" }}
          />
          {/* Entradas talladas en la roca, deliberadamente mas pequenas y en perspectiva */}
          <g transform="translate(65 -112) skewX(-6) scale(.75 1.38)">
            <path d="M58 490 L58 350 C58 278 118 222 190 222 C254 222 308 270 322 340 L322 490 Z" fill="#21150d" stroke="#5e625f" strokeWidth="16" filter="url(#stoneRelief)" />
            <path d="M79 490 L79 352 C79 294 126 248 190 248 C245 248 287 288 300 345 L300 490 Z" fill="#100b07" />
            <path d="M67 350 C67 270 121 210 190 210 C257 210 316 260 332 338" fill="none" stroke="#888b86" strokeWidth="6" opacity="0.72" />
            <path d="M82 350 C82 289 128 237 190 237 C249 237 296 282 308 344" fill="none" stroke="#3d403d" strokeWidth="8" opacity="0.8" />
            <g transform="translate(78 333)">
              <path d="M0 14 C-8 2 5 -1 5 -13 C17 0 20 8 11 17 C8 21 2 20 0 14Z" fill="#ff7b27" />
              <path d="M5 12 C1 5 9 1 10 -6 C17 4 16 10 11 14Z" fill="#ffe7a1" />
              <path d="M6 27 L6 42 M-2 42 L14 42" stroke="#2a1a0e" strokeWidth="4" strokeLinecap="round" />
              <circle cx="7" cy="6" r="28" fill="#ffb35c" opacity="0.22" filter="url(#softBlurSm)" />
            </g>
          </g>

          <g transform="translate(141 -112) skewX(6) scale(.75 1.38)">
            <path d="M478 490 L478 340 C492 270 546 222 610 222 C682 222 742 278 742 350 L742 490 Z" fill="#21150d" stroke="#5e625f" strokeWidth="16" filter="url(#stoneRelief)" />
            <path d="M500 490 L500 345 C513 288 555 248 610 248 C674 248 721 294 721 352 L721 490 Z" fill="#100b07" />
            <path d="M468 338 C484 260 543 210 610 210 C679 210 733 270 733 350" fill="none" stroke="#888b86" strokeWidth="6" opacity="0.72" />
            <path d="M491 344 C503 282 551 237 610 237 C672 237 718 289 718 350" fill="none" stroke="#3d403d" strokeWidth="8" opacity="0.8" />
            <g transform="translate(718 333)">
              <path d="M0 14 C-8 2 5 -1 5 -13 C17 0 20 8 11 17 C8 21 2 20 0 14Z" fill="#ff7b27" />
              <path d="M5 12 C1 5 9 1 10 -6 C17 4 16 10 11 14Z" fill="#ffe7a1" />
              <path d="M6 27 L6 42 M-2 42 L14 42" stroke="#2a1a0e" strokeWidth="4" strokeLinecap="round" />
              <circle cx="7" cy="6" r="28" fill="#ffb35c" opacity="0.22" filter="url(#softBlurSm)" />
            </g>
          </g>

          {/* Estanteria de Alejandria, solo decorativa en el sotano */}
          <g transform="translate(316 220)" opacity="0.92">
            <rect x="0" y="0" width="168" height="262" rx="5" fill="#24160d" stroke="#8b633c" strokeWidth="5" />
            <path d="M9 80 H159 M9 157 H159 M9 234 H159" stroke="#6a4527" strokeWidth="8" />
            <path d="M14 5 V256 M154 5 V256" stroke="#9e7042" strokeWidth="7" />
            <g stroke="#2a170b" strokeWidth="1">
              <path fill="#a86535" d="M18 65V25h12v40zM33 65V12h13v53zM49 65V30h10v35zM63 65V18h14v47zM81 65V8h11v57zM96 65V28h14v37zM114 65V16h10v49z" />
              <path fill="#6d3f29" d="M18 136V88h13v48zM35 136V98h11v38zM50 136V83h13v53zM67 136V91h10v45zM81 136V80h14v56zM99 136V94h11v42zM115 136V87h9v49z" />
              <path fill="#bd8147" d="M18 207V158h12v49zM34 207V170h13v37zM50 207V154h10v53zM64 207V165h14v42zM82 207V151h11v56zM98 207V174h13v33zM116 207V158h9v49z" />
            </g>
          </g>

          {/* Suelo */}
          <path d="M0,540 C220,510 580,510 800,540 L800,620 L0,620 Z" fill="#211b14" />
          <path d="M0,548 C220,522 580,522 800,548" stroke="#0e0b08" strokeWidth="2" fill="none" opacity="0.6" />
          <path d="M0 586 C180 557 270 604 410 578 S650 558 800 592" stroke="#66503a" strokeWidth="2" fill="none" opacity="0.42" />

          {/* Mesa rectangular, baja y en primer plano */}
          <path d="M0 520 L800 520 L800 620 L0 620 Z" fill="url(#tableEdge)" />
          <path d="M0 505 L800 505 L800 585 L0 585 Z" fill="url(#tableGrad)" />
          <path d="M0 519 L800 519" fill="none" stroke="#4f3518" strokeWidth="2" opacity="0.34" />
          <path d="M0 542 L800 542 M0 565 L800 565" fill="none" stroke="#2a1509" strokeWidth="3" opacity="0.34" />
          <path d="M176 584 L190 620 L223 620 L217 581 Z M583 581 L577 620 L610 620 L624 584 Z" fill="url(#tableEdge)" />
        </svg>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {protagonists.map((character: any, index: number) => (
            <div key={character.id} style={{
              position: "absolute", left: `${16 + (index % 4) * 23}%`, top: `${11 + Math.floor(index / 4) * 10}%`,
              transform: "rotate(-5deg)", fontFamily: "'Cinzel', 'Fraunces', Georgia, serif", fontSize: isMobile ? 10 : 15,
              fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "#4c432f",
              textShadow: "1px 1px 0 rgba(20,13,7,.9), -1px -1px 0 rgba(231,205,132,.18), 0 0 5px rgba(183,154,85,.22)",
              WebkitTextStroke: "0.35px rgba(75,54,27,.9)",
              filter: "drop-shadow(0 0 2px rgba(183,154,85,.35))", animation: `vaultNameRunePulse ${3.4 + (index % 3) * .8}s ease-in-out infinite`, animationDelay: `${index * .45}s`,
            }}>{character.name}</div>
          ))}
        </div>

        {/* Pequenos objetos de estudio sobre la mesa: decorativos y no interactivos */}
        <div style={{ position: "absolute", left: "50%", top: "84%", width: 210, height: 42, transform: "translate(-50%, -50%) rotate(-5deg)", zIndex: 2, pointerEvents: "none", opacity: 0.9 }}>
          <div style={{ position: "absolute", left: 18, top: 13, width: 128, height: 24, background: "#c9b078", border: "1px solid #765632", boxShadow: "0 3px 5px rgba(0,0,0,.45)", transform: "rotate(4deg)" }}>
            <div style={{ width: "90%", margin: "7px auto 0", borderTop: "1px solid rgba(75,45,20,.55)", borderBottom: "1px solid rgba(75,45,20,.38)", height: 7 }} />
          </div>
          <div style={{ position: "absolute", left: 116, top: 2, width: 70, height: 12, borderRadius: "50%", background: "#dbc38c", border: "1px solid #765632", transform: "rotate(-13deg)" }} />
          <div style={{ position: "absolute", right: 7, top: 3, width: 18, height: 30, borderRadius: "45% 45% 35% 35%", background: "linear-gradient(90deg, #1d1712, #56402a, #15100c)", border: "1px solid #94744a" }} />
          <div style={{ position: "absolute", left: 2, top: 20, width: 28, height: 3, borderRadius: 4, background: "#b78d52", transform: "rotate(-18deg)", boxShadow: "0 0 7px rgba(240,191,94,.5)" }} />
        </div>

        {/* Vista decorativa de los mismos libros de Alejandria II */}
        <div style={{ position: "absolute", left: "40%", top: "39%", width: "20%", height: "37%", padding: "3px 4px", background: "linear-gradient(90deg, #0e0805, #2b180d, #0e0805)", border: "3px solid #51321d", boxShadow: "0 8px 18px rgba(0,0,0,.65)", zIndex: 1, pointerEvents: "none" }}>
          {[0, 1, 2].map((row) => (
            <div key={row} style={{ height: "33.333%", display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 2, borderBottom: row < 2 ? "5px solid #432515" : "none", padding: "3px 2px" }}>
              {books.slice(row * 10, row * 10 + 10).map((book: any, i: number) => {
                const isLight = ["#F5F3EB", "#E8C547"].includes(book.color);
                return (
                  <div key={book.id} title={book.title} style={{ width: `${8 + ((i * 3) % 5)}%`, height: `${52 + ((i * 11) % 36)}%`, minWidth: 5, background: book.color || "#5c351e", borderRadius: "1px 2px 0 0", borderLeft: "1px solid rgba(205,155,91,.2)", color: isLight ? "#241d12" : "#d8b27a", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    <span style={{ writingMode: "vertical-rl", fontFamily: "'Fraunces', serif", fontSize: 6, whiteSpace: "nowrap" }}>{book.title}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Motas de polvo (HTML, superpuestas sobre el haz) */}
        {!isMobile && Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{
            position: "absolute", top: "16%", left: `calc(50% + ${(i % 5 - 2) * 12}px)`,
            width: 4, height: 4, borderRadius: "50%", background: "#d4cd6f", opacity: 0.88,
            animation: `vaultDust ${5 + (i % 4)}s linear infinite`, animationDelay: `${i * 0.7}s`,
          }} />
        ))}

        {/* Avisos del sotano, sin personaje visible */}
        <div style={{ position: "absolute", left: isMobile ? "13%" : "18%", top: isMobile ? "42%" : "47%", maxWidth: isMobile ? "72%" : "30%", zIndex: 8 }}>
          {vaultPhrases.length > 0 && (
            <div key={phraseIndex} style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: -10, bottom: 12, width: 0, height: 0, borderTop: "7px solid transparent", borderBottom: "7px solid transparent", borderRight: "12px solid rgba(35,24,14,0.9)" }} />
              <div style={{
                animation: "vaultBubbleIn .4s ease", background: "rgba(35,24,14,0.96)", border: "1px solid rgba(201,162,75,0.5)",
                borderRadius: 11, borderBottomLeftRadius: 3, padding: "10px 11px", width: isMobile ? 170 : 145, fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 12, lineHeight: 1.5, color: "#F2E9D7",
                boxShadow: "0 6px 20px rgba(0,0,0,0.5)",
              }}>
                {wrappedPhrase}
              </div>
            </div>
          )}
        </div>

        {/* Notas sobre la mesa */}
        {visibleNotes.length === 0 ? (
          <div style={{ position: "absolute", top: "79%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 12, color: "#e8d9b8", opacity: 0.75, textAlign: "center", width: "50%" }}>
            La mesa está vacía por ahora
          </div>
        ) : visibleNotes.slice(0, 10).map((note: any, i: number) => {
          const pos = noteLayout(note, i, visibleNotes.length);
          return (
            <div key={note.id} style={{
              position: "absolute", left: `${pos.left}%`, top: `${pos.top}%`, transform: `translate(-50%,-50%) rotate(${pos.rotate}deg)`,
              zIndex: 9, width: 96, minHeight: 72, background: note.urgent ? "linear-gradient(135deg, #e4c878, #b9954d)" : "linear-gradient(135deg, #e8d5a7, #bfa979)", color: "#332711",
              padding: "8px 9px", fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 11, lineHeight: 1.3, borderRadius: "3px 2px 7px 2px",
              boxShadow: "0 5px 12px rgba(0,0,0,0.58)",
              border: note.urgent ? "1px solid #b5892b" : "1px solid rgba(84,55,24,0.35)",
            }} onPointerDown={(e) => {
              const target = e.currentTarget;
              const scene = target.parentElement?.parentElement;
              if (!scene || !onMoveNote) return;
              target.setPointerCapture(e.pointerId);
              const rect = scene.getBoundingClientRect();
              const move = (event: PointerEvent) => onMoveNote(note.id, Math.max(8, Math.min(92, ((event.clientX - rect.left) / rect.width) * 100)), Math.max(63, Math.min(96, ((event.clientY - rect.top) / rect.height) * 100)));
              const up = () => { target.releasePointerCapture(e.pointerId); target.removeEventListener("pointermove", move); target.removeEventListener("pointerup", up); };
              target.addEventListener("pointermove", move);
              target.addEventListener("pointerup", up, { once: true });
            }}>
              <button
                onClick={() => onDeleteNote(note.id)}
                title="Borrar nota"
                style={{
                  position: "absolute", top: -7, right: -7, width: 15, height: 15, borderRadius: "50%",
                  border: "1px solid rgba(0,0,0,0.3)", background: "#8a1f1f", color: "#fff", fontSize: 9,
                  lineHeight: "13px", cursor: "pointer", padding: 0,
                }}
              >×</button>
              <div style={{ fontWeight: 700, marginBottom: 3, fontSize: 9 }}>{note.date}</div>
              {note.text}
            </div>
          );
        })}
      </div>

      {/* Controles: filtros + nueva nota */}
      <div style={{ maxWidth: 520, margin: "8px auto 40px", padding: "0 16px" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12, justifyContent: "center" }}>
          {['all', 'today', 'upcoming', 'urgent'].map((mode: string) => (
            <button key={mode} onClick={() => setFilter(mode)} style={{ ...smallOutlineBtn, background: "rgba(20,17,13,0.55)", borderColor: filter === mode ? "rgba(214,181,96,0.75)" : "rgba(201,162,75,0.24)", color: filter === mode ? "#F2E7C3" : "#C7B89A" }}>
              {mode === 'all' ? 'Todos' : mode === 'today' ? 'Hoy' : mode === 'upcoming' ? 'Próximos' : 'Urgentes'}
            </button>
          ))}
          <button onClick={() => setShowForm((s) => !s)} style={{ ...smallOutlineBtn, background: "rgba(20,17,13,0.55)" }}>{showForm ? "Cancelar" : "+ Nueva nota"}</button>
        </div>
        {showForm && (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10, background: "rgba(18,14,10,0.88)", border: "1px solid rgba(201,162,75,0.26)", borderRadius: 14, padding: 16 }}>
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Deje una nota para la fecha elegida..." rows={3} style={{ width: "100%", resize: "vertical", borderRadius: 10, border: "1px solid rgba(201,162,75,0.28)", background: "rgba(10,8,6,0.7)", color: "#F6F0E2", padding: 10, fontSize: 13 }} />
            <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ flex: 1, minWidth: 150, borderRadius: 10, border: "1px solid rgba(201,162,75,0.28)", background: "rgba(10,8,6,0.7)", color: "#F6F0E2", padding: "9px 10px", fontSize: 13 }} />
              <label style={{ display: "flex", alignItems: "center", gap: 6, color: "#E7D19A", fontSize: 12.5 }}>
                <input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} /> Urgente
              </label>
            </div>
            <button type="submit" style={{ ...smallOutlineBtn, alignSelf: "flex-start" }}>Guardar nota mágica</button>
          </form>
        )}
      </div>
    </div>
  );
}

// Puerta en arco con antorchas, como las dos aberturas laterales de la referencia
function VaultArchDoor({ side, isMobile }: { side: "left" | "right"; isMobile: boolean }) {
  const width = isMobile ? 74 : 120;
  const height = isMobile ? 130 : 210;
  return (
    <div style={{
      position: "absolute", top: isMobile ? "8%" : "2%",
      [side]: isMobile ? "-6%" : "1%",
      width, height, zIndex: 3,
    } as any}>
      {/* marco en arco */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: `${width}px ${width}px 6px 6px`,
        background: "linear-gradient(180deg, #6b5b46, #3c3226)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
      }} />
      {/* hueco de la puerta (abierta, con luz cálida al fondo) */}
      <div style={{
        position: "absolute", top: "10%", left: "12%", right: "12%", bottom: "4%",
        borderRadius: `${width}px ${width}px 4px 4px`,
        background: "radial-gradient(ellipse at 50% 30%, rgba(255,196,120,0.35), rgba(20,14,8,0.95) 70%)",
      }} />
      {/* antorcha */}
      <div style={{
        position: "absolute", top: "42%", [side === "left" ? "right" : "left"]: -10,
        width: 8, height: 8, borderRadius: "50%", background: "#ffb35c",
        boxShadow: "0 0 16px 6px rgba(255,179,92,0.7)", animation: "vaultTorchFlicker 1.8s ease-in-out infinite",
      } as any} />
    </div>
  );
}

// ---- El resto de la app, ya con sesión y datos listos ----
function Workspace({ userId, initialData }: { userId: string; initialData: any }) {
  useInjectedFont();
  const isMobile = useIsMobile();
  const [light, setLight] = useState(false);
  const T = light ? LIGHT : DARK;
  const authorName = "Ana Bramell";
  const bundle = initialData || SEED_BUNDLE;

  const [universes, setUniverses] = useState(bundle.universes ?? seedUniverses);
  const [sagas, setSagas] = useState(bundle.sagas ?? seedSagas);
  const [books, setBooks] = useState(bundle.books ?? seedBooks);
  const [bookActs, setBookActs] = useState(bundle.bookActs ?? seedBookActs);
  const [chapters, setChapters] = useState(bundle.chapters ?? seedChapters);
  const [characters, setCharacters] = useState(bundle.characters ?? seedCharacters);
  const [universeEntries, setUniverseEntries] = useState(bundle.universeEntries ?? seedUniverseEntries);
  const [events, setEvents] = useState(bundle.events ?? seedEvents);
  const [appearances, setAppearances] = useState(bundle.appearances ?? seedAppearances);
  const [appearanceCategories, setAppearanceCategories] = useState(bundle.appearanceCategories ?? {});
  const [storyEvents, setStoryEvents] = useState(bundle.storyEvents ?? seedStoryEvents);
  const [locations, setLocations] = useState(bundle.locations ?? seedLocations);
  const [eraConfig, setEraConfig] = useState(bundle.eraConfig ?? seedEraConfig);
  const [borders, setBorders] = useState(bundle.borders ?? seedBorders);
  const [loreEntries, setLoreEntries] = useState(bundle.loreEntries ?? seedLore);
  const [bestiary, setBestiary] = useState(bundle.bestiary ?? seedBestiary);
  const [corkNotes, setCorkNotes] = useState(bundle.corkNotes ?? seedCork);
  const [ideas, setIdeas] = useState(bundle.ideas ?? seedIdeas);
  const [surveys, setSurveys] = useState(bundle.surveys ?? seedSurveys);
  const [relPositions, setRelPositions] = useState<any>(bundle.relPositions ?? {});
  const [vaultNotes, setVaultNotes] = useState<any[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(`atelier:vault:${userId}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [vaultFilter, setVaultFilter] = useState("all");
  const lastVisitAt = useMemo(() => {
    if (typeof window === "undefined") return Date.now();
    const raw = localStorage.getItem(`atelier:lastVisit:${userId}`);
    const value = raw ? Number(raw) : Date.now();
    return Number.isFinite(value) ? value : Date.now();
  }, [userId]);
    const [shelfLayout, setShelfLayout] = useState<any>(bundle.shelfLayout ?? {});
  const [shelfDecor, setShelfDecor] = useState<any[]>(bundle.shelfDecor ?? []);
  const [lastEditedBookId, setLastEditedBookId] = useState<string | null>(null);

  const savedNav = (() => {
    try {
      const raw = localStorage.getItem(`atelier:nav:${userId}`);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  })();
  const [view, setView] = useState(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("openVault") === "1") return "vault";
    const candidate = savedNav?.view;
    return candidate && ["library", "shelf", "book", "vault"].includes(candidate) ? candidate : "library";
  });
  const [currentBookId, setCurrentBookId] = useState<string | null>(savedNav?.currentBookId ?? null);
  const [tab, setTab] = useState(savedNav?.tab || "capitulos");

  useEffect(() => {
    setView((current: string) => (current === "library" || current === "shelf" || current === "book" || current === "vault" ? current : "library"));
  }, [userId]);

  useEffect(() => {
    localStorage.setItem(`atelier:nav:${userId}`, JSON.stringify({ view, tab, currentBookId }));
  }, [view, tab, currentBookId, userId]);

  useEffect(() => {
    if (view === "book" && !books.find((b: any) => b.id === currentBookId)) setView("library");
  }, []); // eslint-disable-line

  const currentBook = books.find((b: any) => b.id === currentBookId);
  const bookSagaId = currentBook?.sagaId ?? null;
  const scopeId = bookSagaId || currentBookId;
  const scopeBooks = bookSagaId ? books.filter((b: any) => b.sagaId === bookSagaId) : books.filter((b: any) => b.id === currentBookId);

  const { openBook, addUniverse, addSaga, addBook, deleteSagaCascade, deleteUniverseCascade, deleteBook } = useLibraryActions({
    sagas, setSagas, books, setBooks, setBookActs, setUniverses,
    setChapters, setCharacters, setUniverseEntries, setEvents,
    setAppearances, setStoryEvents, setLocations, setLoreEntries,
    setBestiary, setIdeas, setCurrentBookId, setTab, setView, setLastEditedBookId,
  });

  const snapshotRef = useRef("");
  const lastSavedAtRef = useRef(Date.now());
  const [dirty, setDirty] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [saveError, setSaveError] = useState("");
    const allState = { universes, sagas, books, bookActs, chapters, characters, universeEntries, events, appearances, appearanceCategories, storyEvents, locations, eraConfig, borders, loreEntries, bestiary, corkNotes, ideas, surveys, relPositions, shelfLayout, shelfDecor };
    const allStateRef = useRef(allState);
  allStateRef.current = allState;

  useEffect(() => {
    let cancelled = false;

    supabase
      .from("beta_comments")
      .select("id, chapter_id, reader_name, comment, excerpt")
      .eq("owner_id", userId)
      .then(({ data, error }) => {
        if (error) {
          console.error("Error cargando comentarios de beta lectores:", error);
          return;
        }
        if (cancelled) return;

        setChapters((cs: any[]) => {
          const updated = cs.map((chapter) => {
            const comments = data
              .filter((row: any) => row.chapter_id === chapter.id)
              .map((row: any) => ({
                id: row.id,
                reader: row.reader_name,
                comment: row.comment,
                excerpt: row.excerpt,
                notified: false,
              }));
            return { ...chapter, betaComments: comments };
          });
          supabase.from("library_data").upsert({
            user_id: userId,
            data: { ...allStateRef.current, chapters: updated },
            updated_at: new Date().toISOString(),
          });
          return updated;
        });
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

    const [pendingReads, setPendingReads] = useState<any[]>([]);

  useEffect(() => {
    const channel = supabase
      .channel(`beta-updates-${userId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "beta_comments", filter: `owner_id=eq.${userId}` }, (payload: any) => {
        const row = payload.new;
        setChapters((cs: any[]) => {
          const updated = cs.map((c) =>
            c.id === row.chapter_id
              ? {
                ...c,
                betaComments: (c.betaComments || []).some((comment: any) => comment.id === row.id)
                  ? c.betaComments
                  : [...(c.betaComments || []), { id: row.id, reader: row.reader_name, comment: row.comment, excerpt: row.excerpt, notified: false }],
              }
              : c
          );
          supabase.from("library_data").upsert({ user_id: userId, data: { ...allStateRef.current, chapters: updated }, updated_at: new Date().toISOString() });
          return updated;
        });
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "beta_surveys", filter: `owner_id=eq.${userId}` }, (payload: any) => {
        const row = payload.new;
        setSurveys((s: any[]) => {
          const updated = [...s, { id: row.id, chapterId: row.chapter_id, reader: row.reader_name || "Anónimo", importance: row.importance, impact: row.impact, opinion: row.opinion }];
          supabase.from("library_data").upsert({ user_id: userId, data: { ...allStateRef.current, surveys: updated }, updated_at: new Date().toISOString() });
          return updated;
        });
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "beta_links", filter: `owner_id=eq.${userId}` }, (payload: any) => {
        const row = payload.new;
        if (row.finished_at && !payload.old?.finished_at) {
          setPendingReads((p: any[]) => [...p, { reader: row.reader_name || "Alguien", chapterTitle: row.chapter_title }]);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  useEffect(() => {
    const snap = JSON.stringify(allState);
    if (snapshotRef.current === "") snapshotRef.current = snap;
    else if (snap !== snapshotRef.current) setDirty(true);
  });

  useEffect(() => {
    const timer = setInterval(() => {
      if (dirty && Date.now() - lastSavedAtRef.current > 15 * 60 * 1000) saveNow();
    }, 30000);
    return () => clearInterval(timer);
  }, [dirty]); // eslint-disable-line

  async function saveNow() {
    const snapshot = JSON.stringify(allState);
    const { error } = await supabase.from("library_data").upsert({
      user_id: userId,
      data: allState,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.error("Error guardando:", error);
      setSaveError("No se pudo guardar. Comprueba tu conexión.");
      return;
    }
    setSaveError("");
    snapshotRef.current = snapshot;
    lastSavedAtRef.current = Date.now();
    setDirty(false);
    setSavedFlash(true);
    window.dispatchEvent(new Event("atelier:cloud-saved")); // ← añadir esta línea
    setTimeout(() => setSavedFlash(false), 2500);
  }
  
  const saveNowRef = useRef(saveNow);
  saveNowRef.current = saveNow;

  useEffect(() => {
    function handleVisibility() {
      if (document.hidden && dirty) saveNowRef.current();
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [dirty]);

  async function handleSignOut() {
    if (dirty) await saveNow();
    await supabase.auth.signOut();
  }

  const pendingBeta = useMemo(() => {
    const list: any[] = [];
    chapters.forEach((c: any) => (c.betaComments || []).forEach((bc: any) => {
      if (!bc.notified) {
        const book = books.find((b: any) => b.id === c.bookId);
        list.push({ reader: bc.reader, chapter: c.title, book: book?.title || "" });
      }
    }));
    return list;
  }, [books, chapters]);

  const elfMessages = useMemo(() => {
    const daysSinceVisit = Math.max(0, Math.floor((Date.now() - lastVisitAt) / 86400000));
    const totalChapters = chapters.length;
    const totalBooks = books.length;
    const latestBook = [...books].sort((a: any, b: any) => (b.updatedAt || 0) - (a.updatedAt || 0))[0];
    const latestBookText = latestBook ? latestBook.title : "las páginas vacías";
    const urgentCount = vaultNotes.filter((note: any) => note.urgent).length;

    const phrases = [
      `Su puta madre, me ha dado un susto de muerte.`,
      `Mi señora, hace ${daysSinceVisit} días que no le veo en los pasillos.`,
      `La biblioteca guarda ${totalBooks} tomos y ${totalChapters} capítulos. Todos esperando a ser abiertos por su mano sabia.`,
      `El último libro que leyó  fue ${latestBookText}. Aún humea con la luz de su última visita.`,
      `He contado ${totalChapters} capítulos bajo su custodia.`,
      `Hace tiempo que la última obra no recibe su mirada, maestro. Los estantes ya comienzan a murmurar su nombre.`,
      `He dejado su sello de atención sobre ${urgentCount || "ningún"} recordatorio urgente; el resto espera, en silencio, a que usted lo ordene.`,
      `La secretaria del castillo me ha pedido que le recuerde que la biblioteca siempre esta abierta para usted, incluso en las noches más largas.`,
      `Con su última visita, los libros quedaron en paz. Hoy, el aire vuelve a vibrar con la promesa de otra noche de lectura.`,
      `No recuerdo cuando comí por ultima vez. Tal vez pueda dejarle un rato con los manuscritos...`,
      `Mire bien, mi señora. He ordenado desde la última vez`,
      `Ruidos fuertes... No se preocupe mi señora, la edad hacen estas manos torpes.`,
      `Como me apetece un pollo frito con patatas...`,
      `Mi señora, tiene un gusto exquisito para la lectura.`,
      `PEDO.`,
      `Suena música de Taylor Swift.`,
      `Suena música de Olivia Rodrigo.`,
      `Alguna vez hace algo más que leer libros?`,
      `Me darias una perrillas para un helado?`,
      `Mi personaje favorito es el ${characters.length > 0 ? characters[Math.floor(Math.random() * characters.length)].name : "desconocido"}.`,
    ];

    return phrases.slice(0, 3);
  }, [books, chapters, lastVisitAt, vaultNotes]);

  const vaultNotifications = useMemo(() => {
    const betaItems = pendingBeta.map((p: any) => ({
      title: "Beta lector",
      text: `${p.reader} ha dejado un comentario en "${p.chapter}"${p.book ? ` de ${p.book}` : ""}.`,
    }));

    const today = new Date().toISOString().slice(0, 10);
    const reminderItems = vaultNotes
      .filter((note: any) => !note.date || note.date <= today)
      .slice(0, 3)
      .map((note: any) => ({
        title: note.urgent ? "Recordatorio urgente" : "Recordatorio",
        text: `Para el ${note.date}: ${note.text}`,
      }));

    return [...elfMessages.map((msg: string) => ({ title: "Susurro del Elfo Fwyen", text: msg })), ...betaItems, ...reminderItems];
  }, [elfMessages, pendingBeta, vaultNotes]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`atelier:vault:${userId}`, JSON.stringify(vaultNotes));
    }
  }, [userId, vaultNotes]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`atelier:lastVisit:${userId}`, String(Date.now()));
    }
  }, [userId]);

  function handleAddVaultNote(text: string, date: string, urgent: boolean) {
    const clean = text.trim();
    if (!clean) return;
    setVaultNotes((notes: any[]) => [{
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      text: clean,
      date: date || new Date().toISOString().slice(0, 10),
      urgent,
    }, ...notes]);
  }
  function handleDeleteVaultNote(id: string) {
  setVaultNotes((notes: any[]) => notes.filter((n: any) => n.id !== id));
}
  function handleMoveVaultNote(id: string, left: number, top: number) {
    setVaultNotes((notes: any[]) => notes.map((note: any) => note.id === id ? { ...note, left, top } : note));
  }

  const [showBetaNotice, setShowBetaNotice] = useState(pendingBeta.length > 0);
  async function dismissBetaNotice() {
    const updatedChapters = chapters.map((c: any) => ({ ...c, betaComments: (c.betaComments || []).map((bc: any) => ({ ...bc, notified: true })) }));
    setChapters(updatedChapters);
    setShowBetaNotice(false);
    const nextState = { ...allState, chapters: updatedChapters };
    const { error } = await supabase.from("library_data").upsert({
      user_id: userId,
      data: nextState,
      updated_at: new Date().toISOString(),
    });
    if (!error) {
      snapshotRef.current = JSON.stringify(nextState);
      lastSavedAtRef.current = Date.now();
    }
  }

  const headerControls = (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <SaveControl dirty={dirty} savedFlash={savedFlash} onSave={saveNow} light={light} setLight={setLight} />
      <button onClick={handleSignOut} style={smallOutlineBtn} title="Cerrar sesión"><LogOut size={13} /></button>
    </div>
  );

  return (
    <div style={{ "--bg": T.bg, "--bg2": T.bg2, "--bg3": T.bg3, "--border": T.border, "--text": T.text, "--dim": T.dim, "--accent": T.accent, "--accentText": T.accentText, "--protag": protagColor(light), fontFamily: "'Inter', sans-serif", background: "var(--bg)", color: "var(--text)", width: "100%", height: "100dvh", overflow: "auto", display: "flex", flexDirection: "column" } as any}>
      <div style={{ width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", height: "100%", minHeight: "100dvh" }}>
        {saveError && <div style={{ background: "#C1594A", color: "#fff", fontSize: 12, padding: "6px 14px", textAlign: "center" }}>{saveError}</div>}
        {showBetaNotice && (
          <Modal onClose={dismissBetaNotice}>
            <div style={{ width: 340, maxWidth: "90vw" }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 17, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <MessageSquare size={16} color="var(--accent)" /> Nuevos comentarios de beta lectores
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                {pendingReads.map((p, i) => (
                  <div key={`read-${i}`} style={{ fontSize: 13, color: "var(--text)", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: 10 }}>
                    <b>{p.reader}</b> ha terminado de leer <b>{p.chapterTitle}</b>.
                  </div>
                ))}
                {pendingBeta.map((p, i) => (
                  <div key={`comment-${i}`} style={{ fontSize: 13, color: "var(--text)", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: 10 }}>
                    <b style={{ color: colorForReader(p.reader) }}>{p.reader}</b> ha comentado en <b>{p.chapter}</b>{p.book ? ` de "${p.book}"` : ""}.
                  </div>
                ))}
              </div>
              <button onClick={() => { dismissBetaNotice(); setPendingReads([]); }} style={primaryBtn}>Cerrar</button>
            </div>
          </Modal>
        )}
        {view === "library" ? (
          <LibraryScreen
            universes={universes} sagas={sagas} setSagas={setSagas} books={books} setBooks={setBooks}
            setUniverses={setUniverses} openBook={openBook} addUniverse={addUniverse} addSaga={addSaga}
            addBook={addBook} deleteSagaCascade={deleteSagaCascade} deleteUniverseCascade={deleteUniverseCascade} deleteBook={deleteBook}
            authorName={authorName} onOpenShelf={() => setView("shelf")} onOpenVault={() => setView("vault-transition")} headerControls={headerControls}
            isMobile={isMobile} lastEditedBookId={lastEditedBookId}
          />
        ) : view === "shelf" ? (
          <ShelfLibrary
            books={books} sagas={sagas} onBack={() => setView("library")} onOpenBook={openBook}
            isMobile={isMobile} layout={shelfLayout} setLayout={setShelfLayout} decor={shelfDecor}
            setDecor={setShelfDecor} lastEditedBookId={lastEditedBookId}
          />
        ) : view === "vault-transition" ? (
          <VaultTransition onComplete={() => setView("vault")} />
        ) : view === "vault" ? (
          <MagicVault
             notifications={vaultNotifications}
              notes={vaultNotes}
              books={books}
              sagas={sagas}
              characters={characters}
              onAddNote={handleAddVaultNote}
              onDeleteNote={handleDeleteVaultNote}
              onMoveNote={handleMoveVaultNote}
              onBack={() => setView("library")}
              isMobile={isMobile}
              filter={vaultFilter}
             setFilter={setVaultFilter}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", flex: 1, minHeight: 0, width: "100%" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0, order: isMobile ? 1 : 0 }}>
              <BookTopBar book={currentBook} onBack={() => setView("library")} headerControls={headerControls} />
              <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: isMobile ? "14px 14px" : "20px 28px" }}>
                {tab === "capitulos" && <ChaptersTab bookId={currentBookId} chapters={chapters} setChapters={setChapters} bookActs={bookActs[currentBookId!] || []} setBookActs={setBookActs} isMobile={isMobile} />}
                {tab === "personajes" && <CharactersTab sagaId={scopeId} bookId={currentBookId} books={scopeBooks} bookActs={bookActs} characters={characters} setCharacters={setCharacters} ideas={ideas} setIdeas={setIdeas} light={light} relPositions={relPositions[scopeId!] || {}} setRelPositions={(update: any) => setRelPositions((r: any) => ({ ...r, [scopeId!]: typeof update === "function" ? update(r[scopeId!] || {}) : update }))} />}
                {tab === "estructura" && <StructureTab bookId={currentBookId} chapters={chapters} setChapters={setChapters} bookActs={bookActs} setBookActs={setBookActs} />}
                {tab === "calendario" && <CalendarTab sagaId={scopeId} characters={characters} events={events} setEvents={setEvents} />}
                {tab === "aparicion" && <AppearanceTab sagaId={scopeId} books={scopeBooks} chapters={chapters} characters={characters} appearances={appearances} setAppearances={setAppearances} appearanceCategories={appearanceCategories} setAppearanceCategories={setAppearanceCategories} />}
                {tab === "linea" && <StoryTimelineTab sagaId={scopeId} books={scopeBooks} setBooks={setBooks} storyEvents={storyEvents} setStoryEvents={setStoryEvents} characters={characters.filter((c: any) => c.sagaId === scopeId)} eraConfig={eraConfig[scopeId!]} setEraConfig={(patch: any) => setEraConfig((e: any) => ({ ...e, [scopeId!]: { ...(e[scopeId!] || { startYear: 0, suffix: "" }), ...patch } }))} />}
                {tab === "localizacion" && <LocationTab sagaId={scopeId} books={scopeBooks} chapters={chapters} characters={characters.filter((c: any) => c.sagaId === scopeId)} universeEntries={universeEntries} setUniverseEntries={setUniverseEntries} locations={locations} setLocations={setLocations} borders={borders[scopeId!] || []} setBorders={(list: any) => setBorders((f: any) => ({ ...f, [scopeId!]: list }))} />}
                {tab === "universo" && <UniverseTab sagaId={scopeId} universeEntries={universeEntries} setUniverseEntries={setUniverseEntries} />}
                {tab === "lore" && <LoreTab sagaId={scopeId} loreEntries={loreEntries} setLoreEntries={setLoreEntries} bestiary={bestiary} setBestiary={setBestiary} />}
                {tab === "pizarra" && <CorkboardTab bookId={currentBookId} corkNotes={corkNotes} setCorkNotes={setCorkNotes} />}
                {tab === "exportar" && <ExportTab book={currentBook} chapters={chapters.filter((c: any) => c.bookId === currentBookId)} characters={characters.filter((c: any) => c.sagaId === scopeId)} universeEntries={universeEntries.filter((u: any) => u.sagaId === scopeId)} bookActs={bookActs[currentBookId!] || []} />}
                {tab === "beta" && <BetaReaderTab bookId={currentBookId} userId={userId} chapters={chapters.filter((c: any) => c.bookId === currentBookId)} setChapters={setChapters} surveys={surveys} setSurveys={setSurveys} />}
              </div>
            </div>
            <VerticalTabs tab={tab} setTab={setTab} isMobile={isMobile} />
          </div>
        )}
      </div>
    </div>
  );
}