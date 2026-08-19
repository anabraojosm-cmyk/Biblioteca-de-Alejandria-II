import { useState } from "react";
import {
  BookOpen, Users, Layers, Calendar as CalendarIcon, GitBranch, MapPin, Globe2,
  ScrollText, StickyNote, Download, MessageSquare, ChevronLeft, ChevronRight, Save, Sun, Moon,
} from "lucide-react";

const iconBtn = { border: "none", background: "none", cursor: "pointer", padding: 0 };
const smallOutlineBtn = { border: "1px solid var(--border)", borderRadius: 6, padding: "6px 10px", cursor: "pointer", fontSize: 12, background: "var(--bg2)", color: "var(--text)" };

export function SaveControl({ dirty, savedFlash, onSave, light, setLight }: any) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {savedFlash && <span style={{ fontSize: 11, color: "#5FA98C" }}>Biblioteca guardada</span>}
      <button onClick={onSave} style={{ ...smallOutlineBtn, ...(dirty ? { borderColor: "var(--accent)", color: "var(--accent)" } : {}) }} title="Guardar cambios ahora">
        <Save size={13} /> Guardar
      </button>
      <button onClick={() => setLight((v: boolean) => !v)} style={smallOutlineBtn}>
        {light ? <Moon size={13} /> : <Sun size={13} />}
      </button>
    </div>
  );
}

export function VerticalTabs({ tab, setTab, isMobile }: any) {
  const [collapsed, setCollapsed] = useState(false);
  const items = [
    { id: "capitulos", label: "Capítulos", icon: BookOpen },
    { id: "personajes", label: "Personajes", icon: Users },
    { id: "estructura", label: "Estructura", icon: Layers },
    { id: "calendario", label: "Calendario", icon: CalendarIcon },
    { id: "aparicion", label: "Línea aparición", icon: GitBranch },
    { id: "linea", label: "Línea temporal", icon: GitBranch },
    { id: "localizacion", label: "Localización", icon: MapPin },
    { id: "universo", label: "Universo", icon: Globe2 },
    { id: "lore", label: "Lore", icon: ScrollText },
    { id: "pizarra", label: "Pizarra", icon: StickyNote },
    { id: "exportar", label: "Exportar", icon: Download },
    { id: "beta", label: "Beta lectores", icon: MessageSquare },
  ];

  if (isMobile) return (
    <div style={{ order: 0, display: "flex", overflowX: "auto", borderTop: "1px solid var(--border)", background: "var(--bg3)", padding: "6px 4px", gap: 2 }}>
      {items.map(({ id, label, icon: Icon }) => (
        <button key={id} onClick={() => setTab(id)} style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: tab === id ? "var(--bg2)" : "none", border: "none", borderRadius: 6, padding: "6px 10px", color: tab === id ? "var(--text)" : "var(--dim)", fontSize: 9.5 }}>
          <Icon size={15} />{label}
        </button>
      ))}
    </div>
  );

  return (
    <div style={{ width: collapsed ? 44 : 172, flexShrink: 0, borderLeft: "1px solid var(--border)", background: "var(--bg3)", display: "flex", flexDirection: "column", padding: "10px 6px", transition: "width 0.15s" }}>
      <button onClick={() => setCollapsed((c) => !c)} style={{ ...iconBtn, alignSelf: collapsed ? "center" : "flex-end", marginBottom: 8 }}>
        {collapsed ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
      </button>
      {items.map(({ id, label, icon: Icon }) => (
        <button key={id} onClick={() => setTab(id)} title={label} style={{ display: "flex", alignItems: "center", gap: 8, padding: collapsed ? "9px 0" : "9px 10px", justifyContent: collapsed ? "center" : "flex-start", background: tab === id ? "var(--bg2)" : "none", border: "none", borderRight: tab === id ? "2px solid var(--accent)" : "2px solid transparent", color: tab === id ? "var(--text)" : "var(--dim)", fontSize: 12.5, cursor: "pointer", borderRadius: 6, marginBottom: 2, textAlign: "left" }}>
          <Icon size={14} style={{ flexShrink: 0 }} /> {!collapsed && label}
        </button>
      ))}
    </div>
  );
}