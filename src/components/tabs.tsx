import { Fragment, useState, useRef, useMemo, useEffect } from "react";
import { Link2, GitBranch, Users, Ruler, Quote, Calendar as CalendarIcon, Search, Plus, GripVertical, Skull, X, Trash2, ZoomOut, ZoomIn, ImageIcon, Crown, Pencil, Star, ArrowLeft, Landmark, DoorOpen, ScrollText, PawPrint, PlusSquare, Download, Mail, Ban,} from "lucide-react";
import { Badge, SectionTitle, Row2, Field, FieldArea } from "../ui";
import {
  toggleBtn, toggleBtnActive, selectInput, primaryBtn, smallOutlineBtn, textArea,
  miniIconBtn, fieldLabel, iconBtn, titleInput, textInput,
} from "../styles";
import {
  IMPORTANCE, NATURE_TYPES, REL_RECIPROCAL, FAMILY_REL_KEYS, REL_TYPES,
  NATURE_SUBTYPES, MILITARY_RANKS, NOBLE_TITLES,
  EVENT_CATEGORIES, APPEARANCE_CATEGORIES, TENSION_LEVELS, MONTHS, MONTH_DAYS,
  COLOR_PRESETS, UNIVERSE_CATEGORIES, OBJECT_KINDS, LORE_TYPES, BESTIARY_DANGER, BESTIARY_DANGER_COLOR,
  CORK_COLORS, CORK_SHAPES, CORK_SIZES, READER_COLORS,
} from "../constants";
import {
  uid, hash, protagColor, fileToDataUrl, actForOrder, dateToPos,
  rootPlaceId, pointInPolygon, colorForReader,
} from "../utils";
import { Modal } from "../modals";
import { exportChaptersToWord, exportChaptersToPdf, exportWorldbuilding } from "../utils/exportDoc";
import { supabase } from "../lib/supabase";
import { Waves, Flame, Tent, Mountain } from "lucide-react";
import { RIVER_COLOR, SEA_COLORS, MOUNTAIN_LEVELS } from "../constants";

export function CharactersTab({ sagaId, bookId, books, bookActs, characters, setCharacters, ideas, setIdeas, light, relPositions, setRelPositions }: any) {
  const allSagaChars = useMemo(() => characters.filter((c: any) => c.sagaId === sagaId).sort((a: any, b: any) => a.order - b.order), [characters, sagaId]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState("fichas");
  const [filterImportance, setFilterImportance] = useState("Todos");
  const [filterNature, setFilterNature] = useState("Todos");
  const [search, setSearch] = useState("");
  const dragIdRef = useRef<string | null>(null);
  const highlight = protagColor(light);
  const sagaChars = allSagaChars.filter((c: any) => (filterImportance === "Todos" || c.importance === filterImportance) && (filterNature === "Todos" || c.natureType === filterNature) && c.name.toLowerCase().includes(search.toLowerCase()));

  function addCharacter() {
    const name = prompt("Nombre del personaje:");
    if (!name) return;
    const nc = { id: uid(), sagaId, order: allSagaChars.length, name, nickname: "", customFamilyTag: "", photo: null, emblem: null, importance: "Secundario", lineageGroup: "", powerLevel: 3, natureType: "Humano", natureSubtype: "", natureSubtypeOther: "", natureEffect: "", isMilitary: false, militaryRank: "", isNoble: false, nobleTitle: "", isDead: false, deathBookId: "", deathNote: "", deathAge: "", age: "", birthYear: "", birthday: "", birthplace: "", civilStatus: "", title: "", occupation: "", physicalHeight: "", physicalDesc: "", role: "", motivation: "", virtues: "", defects: "", weakness: "", personality: "", itemsCarried: "", importantItems: "", hobbies: "", trivia: "", statusByBook: {}, roleByBook: {}, relationships: [] };
    setCharacters((cs: any[]) => [...cs, nc]);
    setSelectedId(nc.id);
  }
  function reorder(fromId: string, toId: string) {
    if (fromId === toId) return;
    const ordered = [...allSagaChars];
    const fromIdx = ordered.findIndex((c) => c.id === fromId), toIdx = ordered.findIndex((c) => c.id === toId);
    const [moved] = ordered.splice(fromIdx, 1);
    ordered.splice(toIdx, 0, moved);
    const orderMap = Object.fromEntries(ordered.map((c, i) => [c.id, i]));
    setCharacters((cs: any[]) => cs.map((c) => (c.sagaId === sagaId ? { ...c, order: orderMap[c.id] ?? c.order } : c)));
  }
  function updateCharacterBidirectional(id: string, patch: any) { setCharacters((cs: any[]) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c))); }
  function addRelationshipBoth(sourceId: string, targetId: string, type: string, note: string) {
    const relId1 = uid(), relId2 = uid();
    setCharacters((cs: any[]) => cs.map((c) => {
      if (c.id === sourceId) return { ...c, relationships: [...c.relationships, { id: relId1, targetId, type, note }] };
      if (c.id === targetId) return { ...c, relationships: [...c.relationships, { id: relId2, targetId: sourceId, type: (REL_RECIPROCAL as any)[type] ? (REL_RECIPROCAL as any)[type] : type, note }] };
      return c;
    }));
  }
  function removeRelationshipBoth(sourceId: string, relId: string, targetId: string) {
    setCharacters((cs: any[]) => cs.map((c) => {
      if (c.id === sourceId) return { ...c, relationships: c.relationships.filter((r: any) => r.id !== relId) };
      if (c.id === targetId) return { ...c, relationships: c.relationships.filter((r: any) => r.targetId !== sourceId) };
      return c;
    }));
  }
  const selected = characters.find((c: any) => c.id === selectedId);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <button onClick={() => setView("fichas")} style={{ ...toggleBtn, ...(view === "fichas" ? toggleBtnActive : {}) }}>Fichas</button>
          <button onClick={() => setView("red")} style={{ ...toggleBtn, ...(view === "red" ? toggleBtnActive : {}) }}><Link2 size={13} /> Mapa de relaciones</button>
          <button onClick={() => setView("linaje")} style={{ ...toggleBtn, ...(view === "linaje" ? toggleBtnActive : {}) }}><GitBranch size={13} /> Árbol de casas</button>
          <button onClick={() => setView("familia")} style={{ ...toggleBtn, ...(view === "familia" ? toggleBtnActive : {}) }}><Users size={13} /> Árbol familiar</button>
          <button onClick={() => setView("alturas")} style={{ ...toggleBtn, ...(view === "alturas" ? toggleBtnActive : {}) }}><Ruler size={13} /> Comparar alturas</button>
          <button onClick={() => setView("edades")} style={{ ...toggleBtn, ...(view === "edades" ? toggleBtnActive : {}) }}><CalendarIcon size={13} /> Comparar edades</button>
          <button onClick={() => setView("ideas")} style={{ ...toggleBtn, ...(view === "ideas" ? toggleBtnActive : {}) }}><Quote size={13} /> Frases e ideas</button>
          {view === "fichas" && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 4, background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 8px" }}>
                <Search size={12} color="var(--dim)" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." style={{ background: "none", border: "none", outline: "none", color: "var(--text)", fontSize: 12, width: 100 }} />
              </div>
              <select value={filterImportance} onChange={(e) => setFilterImportance(e.target.value)} style={selectInput}><option>Todos</option>{IMPORTANCE.map((i) => <option key={i}>{i}</option>)}</select>
              <select value={filterNature} onChange={(e) => setFilterNature(e.target.value)} style={selectInput}><option>Todos</option>{NATURE_TYPES.map((n) => <option key={n}>{n}</option>)}</select>
            </>
          )}
        </div>
        <button onClick={addCharacter} style={primaryBtn}><Plus size={13} /> Nuevo personaje</button>
      </div>
      {view === "fichas" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 14 }}>
          {sagaChars.map((c: any) => {
            const isProtag = c.importance === "Principal";
            return (
              <div key={c.id} draggable onDragStart={() => (dragIdRef.current = c.id)} onDragOver={(e) => e.preventDefault()} onDrop={() => reorder(dragIdRef.current!, c.id)} onClick={() => setSelectedId(c.id)} style={{ background: "var(--bg2)", border: `1px solid ${isProtag ? highlight : "var(--border)"}`, boxShadow: isProtag ? `0 0 0 1px ${highlight}55` : "none", borderRadius: 10, padding: 14, cursor: "grab", position: "relative", opacity: c.isDead ? 0.75 : 1 }}>
                <GripVertical size={13} color="var(--dim)" style={{ position: "absolute", top: 10, right: 10 }} />
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: c.photo ? `url(${c.photo}) center/cover` : "var(--bg3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', serif", fontSize: 16, marginBottom: 10, position: "relative", border: isProtag ? `2px solid ${highlight}` : "none" }}>
                  {!c.photo && c.name.charAt(0)}
                  {c.isDead && <Skull size={13} color="#C1594A" style={{ position: "absolute", bottom: -3, right: -3, background: "var(--bg2)", borderRadius: "50%", padding: 1 }} />}
                </div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 15, marginBottom: 1, color: isProtag ? highlight : "var(--text)" }}>{c.name}</div>
                {c.nickname && <div style={{ fontSize: 11, fontStyle: "italic", color: "var(--dim)", marginBottom: 4 }}>"{c.nickname}"</div>}
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 6 }}>
                  {c.importance && <Badge text={c.importance} color={isProtag ? highlight : "var(--accent)"} />}
                  {c.natureType === "Sobrenatural" && <Badge text={c.natureSubtype && c.natureSubtype !== "Otro" ? c.natureSubtype : c.natureType} color="#7A5EA8" />}
                  {c.isMilitary && c.militaryRank && <Badge text={c.militaryRank} color="#C1594A" />}
                  {c.isNoble && c.nobleTitle && <Badge text={c.nobleTitle} color="#C9A24B" />}
                  {c.customFamilyTag && <Badge text={c.customFamilyTag} color="#8AA85F" />}
                  {c.age !== "" && c.age != null && <Badge text={`${c.age} años`} color="#6E93C9" />}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--dim)", minHeight: 28 }}>{c.role || "Rol sin definir"}</div>
                {c.statusByBook[bookId] && <div style={{ marginTop: 8, fontSize: 11, color: "var(--accent)", borderTop: "1px solid var(--border)", paddingTop: 8 }}>{c.statusByBook[bookId]}</div>}
              </div>
            );
          })}
          {sagaChars.length === 0 && <div style={{ color: "var(--dim)", fontSize: 12.5 }}>Sin resultados.</div>}
        </div>
      )}
      {view === "red" && <RelationshipWeb characters={allSagaChars} onSelect={setSelectedId} highlight={highlight} positions={relPositions} setPositions={setRelPositions} />}
      {view === "linaje" && <LineageTree characters={allSagaChars} onSelect={setSelectedId} highlight={highlight} />}
      {view === "familia" && <FamilyTree characters={allSagaChars} onSelect={setSelectedId} highlight={highlight} />}
      {view === "alturas" && <HeightCompare characters={allSagaChars} highlight={highlight} />}
      {view === "edades" && <AgeCompare characters={allSagaChars} highlight={highlight} />}
      {view === "ideas" && <IdeasTab sagaId={sagaId} characters={allSagaChars} books={books} bookActs={bookActs} ideas={ideas} setIdeas={setIdeas} />}
      {selected && (
        <CharacterPanel
          character={selected} bookId={bookId} books={books} allChars={allSagaChars} onClose={() => setSelectedId(null)}
          onUpdate={(patch: any) => updateCharacterBidirectional(selected.id, patch)}
          onAddRelationship={(targetId: string, type: string, note: string) => addRelationshipBoth(selected.id, targetId, type, note)}
          onRemoveRelationship={(relId: string, targetId: string) => removeRelationshipBoth(selected.id, relId, targetId)}
          onDelete={() => { setCharacters((cs: any[]) => cs.filter((c) => c.id !== selected.id)); setSelectedId(null); }}
        />
      )}
    </div>
  );
}

function IdeasTab({ sagaId, characters, books, bookActs, ideas, setIdeas }: any) {
  const sagaIdeas = ideas.filter((i: any) => i.sagaId === sagaId);
  const [draft, setDraft] = useState({ text: "", characterId: "", bookId: "", actId: "" });
  const draftActs = draft.bookId ? (bookActs[draft.bookId] || []) : [];
  function add() { if (!draft.text.trim()) return; setIdeas((i: any[]) => [...i, { id: uid(), sagaId, ...draft }]); setDraft({ text: "", characterId: "", bookId: "", actId: "" }); }
  function remove(id: string) { setIdeas((i: any[]) => i.filter((x) => x.id !== id)); }
  return (
    <div>
      <div style={fieldLabel}>Frases sueltas, diálogos o ideas de personajes para recoger sin perderlas</div>
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: 12, margin: "10px 0 16px" }}>
        <textarea value={draft.text} onChange={(e) => setDraft((d) => ({ ...d, text: e.target.value }))} rows={2} placeholder="Ej: A Dain le viene un recuerdo sobre ropa rota al escuchar música..." style={textArea} />
        <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
          <select value={draft.characterId} onChange={(e) => setDraft((d) => ({ ...d, characterId: e.target.value }))} style={selectInput}><option value="">Personaje (opcional)</option>{characters.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          <select value={draft.bookId} onChange={(e) => setDraft((d) => ({ ...d, bookId: e.target.value, actId: "" }))} style={selectInput}><option value="">Libro (opcional)</option>{books.map((b: any) => <option key={b.id} value={b.id}>{b.title}</option>)}</select>
          {draft.bookId && <select value={draft.actId} onChange={(e) => setDraft((d) => ({ ...d, actId: e.target.value }))} style={selectInput}><option value="">Acto (opcional)</option>{draftActs.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}</select>}
          <button onClick={add} style={smallOutlineBtn}>+ Guardar idea</button>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sagaIdeas.map((i: any) => {
          const char = characters.find((c: any) => c.id === i.characterId), book = books.find((b: any) => b.id === i.bookId), act = book && (bookActs[book.id] || []).find((a: any) => a.id === i.actId);
          return (
            <div key={i.id} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: 10, fontSize: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ color: "var(--text)" }}>{i.text}</div>
                <button onClick={() => remove(i.id)} style={miniIconBtn}><X size={11} /></button>
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                {char && <Badge text={char.name} color="var(--accent)" />}
                {book && <Badge text={book.title + (act ? ` · ${act.name}` : "")} color="#6E93C9" />}
              </div>
            </div>
          );
        })}
        {sagaIdeas.length === 0 && <div style={{ color: "var(--dim)", fontSize: 12 }}>Sin ideas guardadas todavía.</div>}
      </div>
    </div>
  );
}

function HeightCompare({ characters, highlight }: any) {
  const withHeight = characters.map((c: any) => ({ ...c, h: parseFloat((c.physicalHeight || "").replace(",", ".")) })).filter((c: any) => !isNaN(c.h));
  const [order, setOrder] = useState(withHeight.map((c: any) => c.id));
  const [selectedIds, setSelectedIds] = useState(withHeight.map((c: any) => c.id));
  const dragRef = useRef<string | null>(null);
  const shown = order.filter((id) => selectedIds.includes(id)).map((id) => withHeight.find((c: any) => c.id === id)).filter(Boolean);
  function toggle(id: string) { setSelectedIds((s: string[]) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id])); }
  if (withHeight.length === 0) return <div style={{ color: "var(--dim)", fontSize: 12.5 }}>Añade la altura (en metros, ej. "1.75") en la ficha de un personaje para compararlas aquí.</div>;
  const pxPerM = 150;
  function onDrop(id: string) { if (!dragRef.current || dragRef.current === id) return; const arr = [...order]; const from = arr.indexOf(dragRef.current), to = arr.indexOf(id); arr.splice(from, 1); arr.splice(to, 0, dragRef.current); setOrder(arr); dragRef.current = null; }
  return (
    <div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>{withHeight.map((c: any) => <button key={c.id} onClick={() => toggle(c.id)} style={{ ...toggleBtn, padding: "3px 8px", fontSize: 11, ...(selectedIds.includes(c.id) ? toggleBtnActive : {}) }}>{c.name}</button>)}</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 26, overflowX: "auto", paddingBottom: 4, borderBottom: "3px solid var(--border)" }}>
        {shown.map((c: any) => (
          <div key={c.id} draggable onDragStart={() => (dragRef.current = c.id)} onDragOver={(e) => e.preventDefault()} onDrop={() => onDrop(c.id)} style={{ textAlign: "center", flexShrink: 0, width: 84, cursor: "grab" }}>
            <div style={{ fontSize: 11, color: "var(--dim)", marginBottom: 4 }}>{c.h.toFixed(2)} m</div>
            <div style={{ width: 52, height: c.h * pxPerM, background: c.importance === "Principal" ? highlight : "var(--accent)", borderRadius: "8px 8px 0 0", margin: "0 auto", position: "relative" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: c.photo ? `url(${c.photo}) center/cover` : "var(--bg3)", border: "2px solid var(--bg)", position: "absolute", top: -34, left: "50%", transform: "translateX(-50%)" }} />
            </div>
            <div style={{ fontSize: 11.5, marginTop: 4, width: 84, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={c.name}>{c.name}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 10.5, color: "var(--dim)", marginTop: 6 }}>Arrastra para reordenar. Todas las franjas parten de la misma línea base para comparar bien.</div>
    </div>
  );
}

function AgeCompare({ characters, highlight }: any) {
  const usable = characters.map((c: any) => ({ ...c, years: Number(c.age) })).filter((c: any) => Number.isFinite(c.years) && c.years >= 0);
  const [selectedIds, setSelectedIds] = useState<string[]>(usable.map((c: any) => c.id));
  const shown = usable.filter((c: any) => selectedIds.includes(c.id));
  function toggle(id: string) { setSelectedIds((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]); }
  if (usable.length === 0) return <div style={{ color: "var(--dim)", fontSize: 12.5 }}>Añade la edad actual del personaje para compararla aquí.</div>;
  const maxAge = Math.max(...shown.map((c: any) => c.years), 1);
  const gridSize = Math.max(320, maxAge * 24);
  return (
    <div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {usable.map((c: any) => <button key={c.id} onClick={() => toggle(c.id)} style={{ ...toggleBtn, padding: "3px 8px", fontSize: 11, ...(selectedIds.includes(c.id) ? toggleBtnActive : {}) }}>{c.name}</button>)}
      </div>
      {shown.length === 0 ? <div style={{ color: "var(--dim)", fontSize: 12.5 }}>Selecciona al menos un personaje.</div> : (
        <div style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 12px 8px" }}>
          <div style={{ minWidth: gridSize }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--dim)", fontSize: 10, borderBottom: "1px solid var(--border)", paddingBottom: 4 }}>
              <span>0 años</span><span>{Math.ceil(maxAge / 2)} años</span><span>{maxAge} años</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 10 }}>
          {shown.map((c: any) => (
            <div key={c.id} style={{ display: "grid", gridTemplateColumns: "120px 1fr 100px", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: c.importance === "Principal" ? highlight : "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
              <div title={`${c.name}: ${c.years} años`} style={{ height: 22, position: "relative", background: "repeating-linear-gradient(90deg, var(--bg3) 0 23px, var(--border) 23px 24px)", borderRadius: 5, overflow: "visible" }}>
                <div style={{ position: "absolute", right: 0, width: `${(c.years / maxAge) * 100}%`, height: "100%", background: c.importance === "Principal" ? highlight : "var(--accent)", opacity: .85 }} />
                {Array.from({ length: maxAge + 1 }, (_, age) => <span key={age} title={`${c.name} tenía ${age} años`} style={{ position: "absolute", right: `${(age / maxAge) * 100}%`, top: 0, width: 1, height: "100%", background: age % 5 === 0 ? "rgba(0,0,0,.35)" : "transparent" }} />)}
                <span style={{ position: "absolute", right: `${(c.years / maxAge) * 100}%`, top: 3, transform: "translateX(50%)", fontSize: 11, color: "#000", fontWeight: 700 }}>{c.years}</span>
              </div>
              <span style={{ fontSize: 11, color: "var(--dim)" }}>{c.isDead && c.deathAge ? `Murió a los ${c.deathAge}` : "Vivo"}</span>
            </div>
          ))}
            </div>
          </div>
        </div>
      )}
      <div style={{ fontSize: 10.5, color: "var(--dim)", marginTop: 8 }}>La longitud de cada línea permite comparar visualmente las edades; puedes ocultar personajes con los botones superiores.</div>
    </div>
  );
}

function FamilyTree({ characters, onSelect, highlight }: any) {
  const byId = Object.fromEntries(characters.map((c: any) => [c.id, c]));
  const pairTypes = ["amor", "matrimonio", "prometido", "alma_gemela"];
  const familyIds = new Set<string>();
  const parents: Record<string, Set<string>> = {};
  const children: Record<string, Set<string>> = {};
  const siblingPairs: string[][] = [];
  const couples: string[][] = [];
  characters.forEach((c: any) => (c.relationships || []).forEach((r: any) => {
    if (!byId[r.targetId]) return;
    if (FAMILY_REL_KEYS.includes(r.type)) { familyIds.add(c.id); familyIds.add(r.targetId); }
    if (r.type === "padre") { (parents[c.id] ||= new Set()).add(r.targetId); (children[r.targetId] ||= new Set()).add(c.id); }
    if (r.type === "hijo") { (parents[r.targetId] ||= new Set()).add(c.id); (children[c.id] ||= new Set()).add(r.targetId); }
    if (r.type === "hermano") { const pair = [c.id, r.targetId].sort(); if (!siblingPairs.some((p) => p[0] === pair[0] && p[1] === pair[1])) siblingPairs.push(pair); }
    if (pairTypes.includes(r.type)) { const pair = [c.id, r.targetId].sort(); if (!couples.some((p) => p[0] === pair[0] && p[1] === pair[1])) couples.push(pair); familyIds.add(c.id).add(r.targetId); }
  }));
  if (!familyIds.size) return <div style={{ color: "var(--dim)", fontSize: 12.5 }}>Marca relaciones familiares o de pareja en las fichas para ver el árbol familiar.</div>;
  const levelOf: Record<string, number> = {};
  const generation = (id: string, visiting = new Set<string>()): number => {
    if (visiting.has(id) || !parents[id]?.size) return 0;
    visiting.add(id);
    return Math.max(...[...(parents[id] || [])].map((parent) => generation(parent, new Set(visiting)))) + 1;
  };
  [...familyIds].forEach((id) => { levelOf[id] = generation(id); });
  const levels: Record<number, string[]> = {};
  [...familyIds].forEach((id) => (levels[levelOf[id]] ||= []).push(id));
  const units: string[][] = [];
  Object.keys(levels).forEach((level) => {
    const used = new Set<string>();
    levels[Number(level)].forEach((id) => {
      if (used.has(id)) return;
      const couple = couples.find((pair) => pair.includes(id) && levels[Number(level)].includes(pair[0]) && levels[Number(level)].includes(pair[1]));
      const unit = couple || [id]; unit.forEach((member) => used.add(member)); units.push(unit);
    });
  });
  const nodePos: Record<string, { x: number; y: number }> = {};
  const unitWidth = 230, rowHeight = 150, pad = 70;
  Object.keys(levels).map(Number).sort((a, b) => a - b).forEach((level) => {
    const row = units.filter((unit) => levelOf[unit[0]] === level);
    row.forEach((unit, index) => unit.forEach((id, memberIndex) => {
      nodePos[id] = { x: pad + index * unitWidth + (unit.length > 1 ? memberIndex * 112 : 56), y: 58 + level * rowHeight };
    }));
  });
  const width = Math.max(760, Math.max(...Object.values(nodePos).map((p) => p.x), 0) + pad);
  const height = Math.max(180, (Math.max(...Object.keys(levels).map(Number), 0) + 1) * rowHeight);
  const person = (id: string) => <button onClick={() => onSelect(id)} style={{ position: "absolute", left: nodePos[id].x - 48, top: nodePos[id].y - 28, width: 96, minHeight: 56, padding: "7px 6px", borderRadius: 8, border: `1px solid ${byId[id].importance === "Principal" ? highlight : "var(--border)"}`, background: "var(--bg2)", color: "var(--text)", cursor: "pointer", fontSize: 11 }}>{byId[id].name}</button>;
  const coupleOf = (id: string) => couples.find((pair) => pair.includes(id) && nodePos[pair[0]] && nodePos[pair[1]]);
  const centerOf = (id: string) => {
    const couple = coupleOf(id);
    if (!couple) return nodePos[id];
    return { x: (nodePos[couple[0]].x + nodePos[couple[1]].x) / 2, y: nodePos[id].y };
  };
  const edges: any[] = [];
  Object.entries(children).forEach(([parentId, childSet]) => {
    const childIds = [...childSet].filter((id) => nodePos[id]);
    if (!childIds.length || !nodePos[parentId]) return;
    const parent = centerOf(parentId);
    const busY = Math.min(...childIds.map((id) => nodePos[id].y)) - 58;
    edges.push(<line key={`parent-${parentId}`} x1={parent.x} y1={parent.y + 29} x2={parent.x} y2={busY} stroke="var(--accent)" strokeWidth="2" opacity=".8" />);
    edges.push(<line key={`bus-${parentId}`} x1={Math.min(parent.x, ...childIds.map((id) => nodePos[id].x))} y1={busY} x2={Math.max(parent.x, ...childIds.map((id) => nodePos[id].x))} y2={busY} stroke="var(--accent)" strokeWidth="2" opacity=".8" />);
    childIds.forEach((childId) => edges.push(<line key={`${parentId}-${childId}`} x1={nodePos[childId].x} y1={busY} x2={nodePos[childId].x} y2={nodePos[childId].y - 29} stroke="var(--accent)" strokeWidth="2" opacity=".8" />));
  });
  const siblingEdges: any[] = [];
  Object.values(children).forEach((siblingsOfParent) => {
    const ids = [...siblingsOfParent].filter((id) => nodePos[id]);
    if (ids.length > 1) {
      const y = nodePos[ids[0]].y - 43;
      siblingEdges.push(<line key={`sib-${ids.join("-")}`} x1={Math.min(...ids.map((id) => nodePos[id].x))} y1={y} x2={Math.max(...ids.map((id) => nodePos[id].x))} y2={y} stroke="var(--accent)" strokeWidth="2" opacity=".55" />);
      ids.forEach((id) => siblingEdges.push(<line key={`sib-drop-${id}`} x1={nodePos[id].x} y1={y} x2={nodePos[id].x} y2={nodePos[id].y - 29} stroke="var(--accent)" strokeWidth="2" opacity=".55" />));
    }
  });
  siblingPairs.forEach(([a, b]) => {
    if (nodePos[a] && nodePos[b]) siblingEdges.push(<line key={`explicit-sib-${a}-${b}`} x1={nodePos[a].x} y1={nodePos[a].y - 43} x2={nodePos[b].x} y2={nodePos[b].y - 43} stroke="var(--accent)" strokeWidth="2" opacity=".55" />);
  });
  return <div style={{ overflow: "auto", paddingBottom: 12 }}><div style={{ position: "relative", width, height, minWidth: width }}>
    <svg width={width} height={height} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>{edges}{siblingEdges}{couples.filter(([a, b]) => nodePos[a] && nodePos[b]).map(([a, b]) => <line key={`couple-${a}-${b}`} x1={nodePos[a].x + 48} y1={nodePos[a].y} x2={nodePos[b].x - 48} y2={nodePos[b].y} stroke="var(--accent)" strokeWidth="3" />)}</svg>
    {units.flatMap((unit) => unit).map((id) => <Fragment key={id}>{person(id)}</Fragment>)}
  </div></div>;
}
function RelationshipWeb({ characters, onSelect, highlight, positions, setPositions }: any) {
  const w = 720, h = 480;
  const dragRef = useRef<any>(null);
  const [zoomTarget, setZoomTarget] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const defaultPositions = useMemo(() => {
    const cols = Math.ceil(Math.sqrt(characters.length || 1)); const rows = Math.ceil((characters.length || 1) / cols); const map: any = {};
    characters.forEach((c: any, i: number) => { const col = i % cols, row = Math.floor(i / cols); const jitterX = (hash(c.id + "x") % 30) - 15, jitterY = (hash(c.id + "y") % 30) - 15; map[c.id] = { x: ((col + 0.5) / cols) * (w - 80) + 40 + jitterX, y: ((row + 0.5) / rows) * (h - 80) + 40 + jitterY }; });
    return map;
  }, [characters]);
  const pos = (id: string) => positions[id] || defaultPositions[id] || { x: w / 2, y: h / 2 };
  function startDrag(e: any, id: string) { dragRef.current = { id, startX: e.clientX, startY: e.clientY, orig: pos(id) }; window.addEventListener("pointermove", onMove); window.addEventListener("pointerup", onUp); }
  function onMove(e: any) { if (!dragRef.current) return; const { id, startX, startY, orig } = dragRef.current; setPositions((current: any) => ({ ...current, [id]: { x: orig.x + (e.clientX - startX) / zoom, y: orig.y + (e.clientY - startY) / zoom } })); }
  function onUp() { dragRef.current = null; window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); }
  const pairLinks: any = {};
  characters.forEach((c: any) => (c.relationships || []).forEach((r: any) => { const key = [c.id, r.targetId].sort().join("-"); if (!pairLinks[key]) pairLinks[key] = []; if (!pairLinks[key].find((l: any) => l.type === r.type)) pairLinks[key].push({ from: c.id, to: r.targetId, type: r.type }); }));
  const focus = zoomTarget ? pos(zoomTarget) : { x: w / 2, y: h / 2 };
  const vbSize = w / zoom;
  const vbX = Math.max(0, Math.min(w - vbSize, focus.x - vbSize / 2));
  const vbY = Math.max(0, Math.min(h - vbSize, focus.y - vbSize / 2));

  return (
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
      <div>
        <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
          <button onClick={() => setZoom((z) => Math.max(1, z - 0.3))} style={iconBtn}><ZoomOut size={13} /></button>
          <button onClick={() => setZoom((z) => Math.min(3, z + 0.3))} style={iconBtn}><ZoomIn size={13} /></button>
          {zoomTarget && <button onClick={() => { setZoomTarget(null); setZoom(1); }} style={smallOutlineBtn}>Ver todo</button>}
        </div>
        <svg width={w} height={h} viewBox={`${vbX} ${vbY} ${vbSize} ${vbSize}`} style={{ flexShrink: 0, maxWidth: "100%", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10 }}>
          {Object.values(pairLinks).map((links: any) => links.map((l: any, idx: number) => {
            const a = pos(l.from), b = pos(l.to); const conf = (REL_TYPES as any)[l.type] || REL_TYPES.amistad;
            const offset = (idx - (links.length - 1) / 2) * 5; const dx = b.y - a.y, dy = -(b.x - a.x), len = Math.hypot(dx, dy) || 1; const ox = (dx / len) * offset, oy = (dy / len) * offset;
            return <line key={l.type} x1={a.x + ox} y1={a.y + oy} x2={b.x + ox} y2={b.y + oy} stroke={conf.color} strokeWidth={1.8} opacity={0.85} />;
          }))}
          {characters.map((c: any) => {
            const p = pos(c.id); const isProtag = c.importance === "Principal";
            return (
              <g key={c.id} onPointerDown={(e) => startDrag(e, c.id)} onClick={() => onSelect(c.id)} onDoubleClick={() => setZoomTarget(c.id)} style={{ cursor: "grab" }}>
                <circle cx={p.x} cy={p.y} r={26} fill="var(--bg3)" stroke={isProtag ? highlight : "var(--accent)"} strokeWidth={isProtag ? 2.4 : 1.2} />
                <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize={11} fill={isProtag ? highlight : "var(--text)"} fontFamily="Fraunces, serif">{c.name.split(" ")[0]}</text>
              </g>
            );
          })}
        </svg>
        <div style={{ fontSize: 10.5, color: "var(--dim)", marginTop: 4 }}>Arrastra un personaje para moverlo (se guarda). Doble click para centrar el zoom en él.</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 6 }}>
        <div style={{ fontSize: 12, color: "var(--dim)", marginBottom: 4 }}>Leyenda</div>
        {Object.entries(REL_TYPES).map(([key, v]: any) => <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--text)" }}><span style={{ width: 18, height: 3, background: v.color, display: "inline-block", borderRadius: 2 }} /> {v.label}</div>)}
        {characters.length === 0 && <div style={{ color: "var(--dim)", fontSize: 12.5 }}>Añade personajes para ver la red.</div>}
      </div>
    </div>
  );
}

function LineageTree({ characters, onSelect, highlight }: any) {
  const withLineage = characters.filter((c: any) => c.lineageGroup && c.lineageGroup.trim());
  const groups: any = {}; withLineage.forEach((c: any) => { (groups[c.lineageGroup] = groups[c.lineageGroup] || []).push(c); });
  const military = characters.filter((c: any) => c.isMilitary && c.militaryRank);
  const militaryRanks = MILITARY_RANKS.filter((rank) => military.some((c: any) => c.militaryRank === rank));
  return (
    <div style={{ display: "flex", gap: 34, flexWrap: "wrap" }}>
      {Object.entries(groups).map(([group, members]: any) => {
        const byPower: any = {}; members.forEach((m: any) => { (byPower[m.powerLevel || 0] = byPower[m.powerLevel || 0] || []).push(m); });
        const levels = Object.keys(byPower).map(Number).sort((a, b) => b - a);
        return (
          <div key={group} style={{ textAlign: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: 10, margin: "0 auto 8px", background: members[0]?.emblem ? `url(${members[0].emblem}) center/cover` : "var(--bg3)", border: "1px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>{!members[0]?.emblem && <ImageIcon size={16} color="var(--dim)" />}</div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 14, marginBottom: 14 }}>{group}</div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              {levels.map((lvl, li) => (
                <div key={lvl} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  {li > 0 && <div style={{ width: 1, height: 14, background: "var(--border)", margin: "0 auto" }} />}
                  <div style={{ fontSize: 9, color: "var(--dim)", marginBottom: 3 }}>Poder {lvl}</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                    {byPower[lvl].map((c: any) => (
                      <button key={c.id} onClick={() => onSelect(c.id)} style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--bg2)", border: `1px solid ${c.importance === "Principal" ? highlight : "var(--border)"}`, borderRadius: 20, padding: "5px 12px 5px 5px", cursor: "pointer", color: c.importance === "Principal" ? highlight : "var(--text)" }}>
                        <span style={{ width: 22, height: 22, borderRadius: "50%", background: c.photo ? `url(${c.photo}) center/cover` : "var(--bg3)", display: "inline-block" }} />
                        <span style={{ fontSize: 12.5 }}>{c.name}</span>
                        {c.isMilitary && c.militaryRank && <span style={{ fontSize: 9, color: "#C1594A" }}>· {c.militaryRank}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {military.length > 0 && (
        <div style={{ minWidth: 420, textAlign: "center", padding: 14, border: "1px solid var(--border)", borderRadius: 10 }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 15, marginBottom: 14 }}>Casa militar</div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            {militaryRanks.map((rank, index) => (
              <div key={rank} style={{ width: "100%" }}>
                {index > 0 && <div style={{ width: 1, height: 14, background: "var(--border)", margin: "0 auto" }} />}
                <div style={{ fontSize: 9, color: "#C1594A", marginBottom: 4 }}>{rank}</div>
                <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
                  {military.filter((c: any) => c.militaryRank === rank).map((c: any) => (
                    <button key={c.id} onClick={() => onSelect(c.id)} style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--bg2)", border: `1px solid ${c.importance === "Principal" ? highlight : "var(--border)"}`, borderRadius: 20, padding: "5px 12px 5px 5px", cursor: "pointer", color: "var(--text)" }}>
                      <span style={{ width: 22, height: 22, borderRadius: "50%", background: c.photo ? `url(${c.photo}) center/cover` : "var(--bg3)", display: "inline-block" }} />
                      <span style={{ fontSize: 12 }}>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {Object.keys(groups).length === 0 && <div style={{ color: "var(--dim)", fontSize: 12.5 }}>Asigna una "familia / linaje / orden (casa)" en la ficha de un personaje para que aparezca aquí.</div>}
    </div>
  );
}

function CharacterPanel({ character, bookId, books, allChars, onClose, onUpdate, onAddRelationship, onRemoveRelationship, onDelete }: any) {
  const [newRelTarget, setNewRelTarget] = useState(""); const [newRelType, setNewRelType] = useState("amistad"); const [newRelNote, setNewRelNote] = useState("");
  const fileRef = useRef<HTMLInputElement>(null); const emblemRef = useRef<HTMLInputElement>(null);
  const set = (field: string) => (e: any) => onUpdate({ [field]: e.target.value });
  function addRelationship() { if (!newRelTarget) return; onAddRelationship(newRelTarget, newRelType, newRelNote); setNewRelTarget(""); setNewRelNote(""); }
  const otherChars = allChars.filter((c: any) => c.id !== character.id);
  const closeOnes = character.relationships.filter((r: any) => (REL_TYPES as any)[r.type]?.closeness === "buena" && !FAMILY_REL_KEYS.includes(r.type));
  const family = character.relationships.filter((r: any) => FAMILY_REL_KEYS.includes(r.type));
  const enemies = character.relationships.filter((r: any) => (REL_TYPES as any)[r.type]?.closeness === "mala");
  return (
    <Modal onClose={onClose}>
      <div style={{ maxHeight: "76vh", overflowY: "auto", width: 580, maxWidth: "88vw", marginRight: -22, paddingRight: 18 }}>
        <div style={{ display: "flex", gap: 14, marginBottom: 16 }}>
          <div onClick={() => fileRef.current?.click()} style={{ width: 64, height: 64, borderRadius: "50%", background: character.photo ? `url(${character.photo}) center/cover` : "var(--bg3)", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)" }}>{!character.photo && <ImageIcon size={18} color="var(--dim)" />}</div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => e.target.files && e.target.files[0] && fileToDataUrl(e.target.files[0], (url) => onUpdate({ photo: url }))} />
          <div style={{ flex: 1 }}>
            <input value={character.name} onChange={set("name")} placeholder="Nombre completo (editable)" style={{ ...titleInput, fontSize: 20, marginBottom: 6 }} />
            <input value={character.nickname} onChange={set("nickname")} placeholder="Apodo / cómo le llaman / nombre secreto" style={{ ...textInput, marginBottom: 6, fontStyle: "italic" }} />
            <input value={character.customFamilyTag} onChange={set("customFamilyTag")} placeholder="Etiqueta de grupo familiar personalizado (opcional)" style={{ ...textInput, marginBottom: 8 }} />
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <select value={character.importance} onChange={set("importance")} style={selectInput}>{IMPORTANCE.map((i) => <option key={i}>{i}</option>)}</select>
              <select value={character.natureType} onChange={set("natureType")} style={selectInput}>{NATURE_TYPES.map((n) => <option key={n}>{n}</option>)}</select>
            </div>
            {character.natureType !== "Humano" && (
              <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                <select value={character.natureSubtype} onChange={set("natureSubtype")} style={selectInput}><option value="">Tipo de sobrenatural...</option>{NATURE_SUBTYPES.map((n) => <option key={n}>{n}</option>)}</select>
                {character.natureSubtype === "Otro" && <input value={character.natureSubtypeOther} onChange={set("natureSubtypeOther")} placeholder="¿Cuál?" style={{ ...textInput, width: 140 }} />}
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 6 }}><button onClick={onDelete} style={iconBtn}><Trash2 size={14} /></button><button onClick={onClose} style={iconBtn}><X size={14} /></button></div>
        </div>
        <SectionTitle>Estado vital</SectionTitle>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
          <label style={{ ...fieldLabel, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", marginBottom: 0 }}><input type="checkbox" checked={character.isDead} onChange={(e) => onUpdate({ isDead: e.target.checked })} /> <Skull size={12} /> Ha muerto</label>
          {character.isDead && (
            <>
              <select value={character.deathBookId} onChange={set("deathBookId")} style={selectInput}><option value="">¿Cuándo?</option><option value="__before__">Antes de la saga</option>{books.map((b: any) => <option key={b.id} value={b.id}>{b.title}</option>)}</select>
              <input value={character.deathAge || ""} onChange={set("deathAge")} placeholder="Edad al morir" type="number" style={{ ...textInput, width: 110 }} />
              <input value={character.deathNote} onChange={set("deathNote")} placeholder="Nota sobre su muerte" style={{ ...textInput, width: 200 }} />
            </>
          )}
        </div>
        <SectionTitle>Naturaleza militar / noble</SectionTitle>
        <Row2>
          <div><label style={{ ...fieldLabel, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}><input type="checkbox" checked={character.isMilitary} onChange={(e) => onUpdate({ isMilitary: e.target.checked })} /> Es militar</label>{character.isMilitary && <select value={character.militaryRank} onChange={set("militaryRank")} style={{ ...selectInput, marginTop: 6, width: "100%" }}><option value="">Puesto...</option>{MILITARY_RANKS.map((r) => <option key={r}>{r}</option>)}</select>}</div>
          <div><label style={{ ...fieldLabel, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}><input type="checkbox" checked={character.isNoble} onChange={(e) => onUpdate({ isNoble: e.target.checked })} /> <Crown size={12} /> Es noble</label>{character.isNoble && <select value={character.nobleTitle} onChange={set("nobleTitle")} style={{ ...selectInput, marginTop: 6, width: "100%" }}><option value="">Título...</option>{NOBLE_TITLES.map((r) => <option key={r}>{r}</option>)}</select>}</div>
        </Row2>
        <div style={{ marginBottom: 10 }}>
          <div style={fieldLabel}>Escudo familiar / orden / militar</div>
          <div onClick={() => emblemRef.current?.click()} style={{ width: 40, height: 40, borderRadius: 6, background: character.emblem ? `url(${character.emblem}) center/cover` : "var(--bg3)", border: "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{!character.emblem && <ImageIcon size={13} color="var(--dim)" />}</div>
          <input ref={emblemRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => e.target.files && e.target.files[0] && fileToDataUrl(e.target.files[0], (url) => onUpdate({ emblem: url }))} />
        </div>
        <SectionTitle>Identidad</SectionTitle>
        <Row2><Field label="Edad" value={character.age} onChange={(v: string) => onUpdate({ age: v })} /><Field label="Año de nacimiento" value={character.birthYear || ""} onChange={(v: string) => onUpdate({ birthYear: v })} type="number" /></Row2>
        <Field label="Cumpleaños (MM-DD)" value={character.birthday} onChange={(v: string) => onUpdate({ birthday: v })} />
        <Row2><Field label="Lugar de nacimiento" value={character.birthplace} onChange={(v: string) => onUpdate({ birthplace: v })} /><Field label="Situación civil" value={character.civilStatus} onChange={(v: string) => onUpdate({ civilStatus: v })} /></Row2>
        <Row2><Field label="Título / puesto" value={character.title} onChange={(v: string) => onUpdate({ title: v })} /><Field label="Trabajo o estudios" value={character.occupation} onChange={(v: string) => onUpdate({ occupation: v })} /></Row2>
        <Row2><Field label="Altura en metros (ej. 1.75, para comparar)" value={character.physicalHeight} onChange={(v: string) => onUpdate({ physicalHeight: v })} /><Field label="Familia / linaje / orden (casa)" value={character.lineageGroup} onChange={(v: string) => onUpdate({ lineageGroup: v })} /></Row2>
        <Row2><Field label="Nivel de poder (0-10, para el árbol de casas)" value={character.powerLevel} onChange={(v: string) => onUpdate({ powerLevel: Number(v) || 0 })} /><div /></Row2>
        <FieldArea label="Descripción física" value={character.physicalDesc} onChange={(v: string) => onUpdate({ physicalDesc: v })} />
        {character.natureType !== "Humano" && <><SectionTitle>Efecto de su naturaleza</SectionTitle><FieldArea label="Qué le afecta por ser así" value={character.natureEffect} onChange={(v: string) => onUpdate({ natureEffect: v })} /></>}
        <SectionTitle>Psicología</SectionTitle>
        <Field label="Rol en el libro" value={character.role} onChange={(v: string) => onUpdate({ role: v })} />
        <Field label="Motivación" value={character.motivation} onChange={(v: string) => onUpdate({ motivation: v })} />
        <Row2><Field label="Virtudes" value={character.virtues} onChange={(v: string) => onUpdate({ virtues: v })} /><Field label="Defectos" value={character.defects} onChange={(v: string) => onUpdate({ defects: v })} /></Row2>
        <Field label="Debilidad" value={character.weakness} onChange={(v: string) => onUpdate({ weakness: v })} />
        <FieldArea label="Personalidad" value={character.personality} onChange={(v: string) => onUpdate({ personality: v })} />
        <SectionTitle>Posesiones</SectionTitle>
        <Field label="Objetos que lleva encima" value={character.itemsCarried} onChange={(v: string) => onUpdate({ itemsCarried: v })} />
        <Field label="Objetos importantes en la trama" value={character.importantItems} onChange={(v: string) => onUpdate({ importantItems: v })} />
        <SectionTitle>Otros</SectionTitle>
        <Row2><Field label="Hobbies" value={character.hobbies} onChange={(v: string) => onUpdate({ hobbies: v })} /><Field label="Datos importantes" value={character.trivia} onChange={(v: string) => onUpdate({ trivia: v })} /></Row2>
        <SectionTitle>Rol por libro</SectionTitle>
        {books.map((b: any) => (
          <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 12.5, width: 160, color: "var(--dim)" }}>{b.title}</span>
            <select value={character.roleByBook[b.id] || ""} onChange={(e) => onUpdate({ roleByBook: { ...character.roleByBook, [b.id]: e.target.value } })} style={selectInput}><option value="">-</option><option>Protagonista</option><option>Secundario</option><option>Ocasional</option><option>Antagonista</option></select>
          </div>
        ))}
        <SectionTitle>Situación en este libro</SectionTitle>
        <textarea value={character.statusByBook[bookId] || ""} onChange={(e) => onUpdate({ statusByBook: { ...character.statusByBook, [bookId]: e.target.value } })} rows={2} style={textArea} />
        <SectionTitle>Familia (padres, hijos, hermanos)</SectionTitle>
        <RelList list={family} allChars={allChars} onRemove={(relId: string, targetId: string) => onRemoveRelationship(relId, targetId)} />
        <SectionTitle>Relaciones cercanas</SectionTitle>
        <RelList list={closeOnes} allChars={allChars} onRemove={(relId: string, targetId: string) => onRemoveRelationship(relId, targetId)} />
        <SectionTitle>Enemigos</SectionTitle>
        <RelList list={enemies} allChars={allChars} onRemove={(relId: string, targetId: string) => onRemoveRelationship(relId, targetId)} />
        <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
          <select value={newRelTarget} onChange={(e) => setNewRelTarget(e.target.value)} style={selectInput}><option value="">Personaje...</option>{otherChars.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          <select value={newRelType} onChange={(e) => setNewRelType(e.target.value)} style={selectInput}>{Object.entries(REL_TYPES).map(([k, v]: any) => <option key={k} value={k}>{v.label}</option>)}</select>
          <button onClick={addRelationship} style={smallOutlineBtn}>+ Añadir (se actualiza en ambos)</button>
        </div>
      </div>
    </Modal>
  );
}

function RelList({ list, allChars, onRemove }: any) {
  if (list.length === 0) return <div style={{ color: "var(--dim)", fontSize: 12, marginBottom: 10 }}>Ninguna todavía.</div>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
      {list.map((r: any) => {
        const target = allChars.find((c: any) => c.id === r.targetId); const conf = (REL_TYPES as any)[r.type];
        return (
          <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px", fontSize: 12.5, flexWrap: "wrap" }}>
            <span style={{ color: conf.color, fontWeight: 600 }}>{conf.label}</span>
            <span>→ {target?.name || "?"}</span>
            {r.note && <span style={{ color: "var(--dim)" }}>· {r.note}</span>}
            <button onClick={() => onRemove(r.id, r.targetId)} style={{ ...miniIconBtn, marginLeft: "auto" }}><X size={11} /></button>
          </div>
        );
      })}
    </div>
  );
}
export function StructureTab({ bookId, chapters, setChapters, bookActs, setBookActs }: any) {
  const acts = bookActs[bookId] || [];
  const bookChapters = useMemo(() => chapters.filter((c: any) => c.bookId === bookId).sort((a: any, b: any) => a.order - b.order), [chapters, bookId]);
  const [showLegend, setShowLegend] = useState(true);
  const ACT_PALETTE = ["#6E93C9", "#C9A24B", "#C1594A", "#5FA98C", "#7A5EA8", "#C06E97"];
  function addAct() { const name = prompt("Nombre del acto:", `Acto ${acts.length + 1}`); if (!name) return; setBookActs((a: any) => ({ ...a, [bookId]: [...acts, { id: uid(), name, color: ACT_PALETTE[acts.length % ACT_PALETTE.length], startOrder: bookChapters.length }] })); }
  function renameAct(id: string) { const act = acts.find((a: any) => a.id === id); const name = prompt("Nuevo nombre del acto:", act?.name); if (!name) return; setBookActs((a: any) => ({ ...a, [bookId]: acts.map((x: any) => (x.id === id ? { ...x, name } : x)) })); }
  function removeAct(id: string) { if (acts.length <= 1) return alert("Debe haber al menos un acto."); setBookActs((a: any) => ({ ...a, [bookId]: acts.filter((x: any) => x.id !== id) })); }
  function setActStart(actId: string, chapterOrder: number) { setBookActs((a: any) => ({ ...a, [bookId]: acts.map((x: any) => (x.id === actId ? { ...x, startOrder: chapterOrder } : x)) })); }
  function updateChapter(id: string, patch: any) { setChapters((cs: any[]) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c))); }
  const sortedActs = [...acts].sort((a: any, b: any) => a.startOrder - b.startOrder);
  return (
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
      <div style={{ flex: 1, minWidth: 300 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={fieldLabel}>Evolución de la tensión narrativa — se ve completa de inicio a fin, se ajusta al ancho disponible</div>
          <button onClick={() => setShowLegend((v) => !v)} style={smallOutlineBtn}>{showLegend ? "Ocultar" : "Mostrar"} significado de niveles</button>
        </div>
        <TensionChart chapters={bookChapters} acts={acts} />
        <div style={{ display: "flex", justifyContent: "flex-end", margin: "16px 0 10px" }}><button onClick={addAct} style={smallOutlineBtn}>+ Añadir acto</button></div>
        <div style={{ fontSize: 11, color: "var(--dim)", marginBottom: 10 }}>Elige en qué capítulo empieza cada acto — todos los capítulos siguientes se reasignan automáticamente hasta el próximo acto.</div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.max(acts.length, 1)}, 1fr)`, gap: 16 }}>
          {sortedActs.map((act: any, actIdx: number) => {
            const nextStart = sortedActs[actIdx + 1]?.startOrder ?? Infinity;
            const actChapters = bookChapters.filter((c: any) => c.order >= act.startOrder && c.order < nextStart);
            return (
              <div key={act.id} style={{ background: "var(--bg2)", border: `1px solid var(--border)`, borderTop: `3px solid ${act.color}`, borderRadius: 10, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div onClick={() => renameAct(act.id)} style={{ fontFamily: "'Fraunces', serif", fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }} title="Click para renombrar">{act.name} <Pencil size={11} color="var(--dim)" /></div>
                  {acts.length > 1 && <button onClick={() => removeAct(act.id)} style={miniIconBtn}><X size={12} /></button>}
                </div>
                {actIdx === 0 ? <div style={{ fontSize: 10.5, color: "var(--dim)", marginBottom: 8 }}>Siempre empieza en el capítulo 1</div> : (
                  <select value={act.startOrder} onChange={(e) => setActStart(act.id, Number(e.target.value))} style={{ ...selectInput, width: "100%", marginBottom: 8 }}>
                    {bookChapters.map((c: any, i: number) => <option key={c.id} value={c.order}>Empieza en: {i + 1}. {c.title}</option>)}
                  </select>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {actChapters.map((c: any) => (
                    <div key={c.id} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 8, padding: 10 }}>
                      <div style={{ fontSize: 13, marginBottom: 6 }}>{c.title}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input type="range" min={1} max={5} value={c.tension} onChange={(e) => updateChapter(c.id, { tension: Number(e.target.value) })} style={{ flex: 1 }} />
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--accent)" }}>{c.tension}</span>
                      </div>
                    </div>
                  ))}
                  {actChapters.length === 0 && <div style={{ color: "var(--dim)", fontSize: 12 }}>Sin capítulos.</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {showLegend && (
        <div style={{ width: 230, flexShrink: 0 }}>
          <div style={fieldLabel}>¿Qué significa cada nivel?</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            {TENSION_LEVELS.map((t) => (
              <div key={t.level} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}><span style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--accent)", fontWeight: 700 }}>{t.level}</span><span style={{ fontSize: 12.5, fontWeight: 600 }}>{t.label}</span></div>
                <div style={{ fontSize: 11.5, color: "var(--dim)" }}>{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TensionChart({ chapters, acts }: any) {
  const vw = 800, h = 140, pad = 26;
  if (chapters.length === 0) return <div style={{ color: "var(--dim)", fontSize: 12.5 }}>Añade capítulos para ver la evolución.</div>;
  const step = (vw - pad * 2) / Math.max(chapters.length - 1, 1);
  const pts = chapters.map((c: any, i: number) => ({ x: pad + i * step, y: h - pad - ((c.tension - 1) / 4) * (h - pad * 2), act: actForOrder(c.order, acts), title: c.title, tension: c.tension }));
  const actColor = (act: any) => act?.color || "var(--accent)";
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${vw} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
      {pts.slice(1).map((p: any, i: number) => {
        const from = pts[i];
        if (from.act?.id === p.act?.id) return <line key={i} x1={from.x} y1={from.y} x2={p.x} y2={p.y} stroke={actColor(from.act)} strokeWidth={2.5} />;
        const midX = (from.x + p.x) / 2, midY = (from.y + p.y) / 2;
        return (<g key={i}><line x1={from.x} y1={from.y} x2={midX} y2={midY} stroke={actColor(from.act)} strokeWidth={2.5} /><line x1={midX} y1={midY} x2={p.x} y2={p.y} stroke={actColor(p.act)} strokeWidth={2.5} /></g>);
      })}
      {pts.map((p: any, i: number) => <circle key={i} cx={p.x} cy={p.y} r={4.5} fill={actColor(p.act)}><title>{`${p.title} · tensión ${p.tension}`}</title></circle>)}
    </svg>
  );
}

export function CalendarTab({ sagaId, characters, events, setEvents }: any) {
  const sagaEvents = events.filter((e: any) => e.sagaId === sagaId);
  const sagaChars = characters.filter((c: any) => c.sagaId === sagaId && c.birthday);
  const [hover, setHover] = useState<any>(null);
  const [visibleCats, setVisibleCats] = useState(Object.keys(EVENT_CATEGORIES));
  function toggleCat(k: string) { setVisibleCats((v: string[]) => (v.includes(k) ? v.filter((x) => x !== k) : [...v, k])); }
  function addEvent() {
    const title = prompt("Nombre del evento:"); if (!title) return;
    const month = Number(prompt("Mes (1-12):", "1")) || 1;
    const day = Number(prompt("Día del mes:", "1")) || 1;
    const category = prompt(`Categoría (${Object.keys(EVENT_CATEGORIES).join(", ")}):`, "politica_interior") || "politica_interior";
    const continuous = confirm("¿Es un evento continuo (ej. una guerra)?");
    const annual = confirm("¿Se repite cada año?");
    setEvents((ev: any[]) => [...ev, { id: uid(), sagaId, title, category: (EVENT_CATEGORIES as any)[category] ? category : "politica_interior", month, day, continuous, annual }]);
  }
  const filteredEvents = sagaEvents.filter((e: any) => visibleCats.includes(e.category));
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {Object.entries(EVENT_CATEGORIES).map(([k, v]: any) => <button key={k} onClick={() => toggleCat(k)} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: visibleCats.includes(k) ? "var(--text)" : "var(--dim)", background: "none", border: "none", cursor: "pointer", opacity: visibleCats.includes(k) ? 1 : 0.4 }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: v.color }} />{v.label}</button>)}
        </div>
        <button onClick={addEvent} style={primaryBtn}><Plus size={13} /> Nuevo evento</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
        {MONTHS.map((mLabel, mi) => {
          const month = mi + 1; const daysInMonth = MONTH_DAYS[mi];
          const monthEvents = filteredEvents.filter((e: any) => e.month === month || e.annual);
          const bdays = sagaChars.filter((c: any) => Number(c.birthday.split("-")[0]) === month);
          return (
            <div key={mLabel} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: 8 }}>
              <div style={{ fontSize: 11.5, color: "var(--dim)", marginBottom: 6, textTransform: "uppercase" }}>{mLabel}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
                {Array.from({ length: daysInMonth }, (_, di) => {
                  const day = di + 1;
                  const dayEvents = monthEvents.filter((e: any) => e.day === day);
                  const dayBdays = bdays.filter((c: any) => Number(c.birthday.split("-")[1]) === day);
                  const has = dayEvents.length > 0 || dayBdays.length > 0;
                  const key = `${mLabel}-${day}`;
                  return (
                    <div key={day} onMouseEnter={() => has && setHover({ key, month: mLabel, day, events: dayEvents, bdays: dayBdays })} onMouseLeave={() => setHover((h: any) => (h?.key === key ? null : h))} style={{ position: "relative", width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, borderRadius: 3, background: has ? (dayEvents[0] ? (EVENT_CATEGORIES as any)[dayEvents[0].category].color + "33" : "var(--accent)33") : "var(--bg3)", color: has ? "var(--text)" : "var(--dim)", cursor: has ? "pointer" : "default" }}>
                      {day}
                      {dayEvents.length > 0 && <span style={{ position: "absolute", top: -1, right: -1, width: 4, height: 4, borderRadius: "50%", background: (EVENT_CATEGORIES as any)[dayEvents[0].category].color }} />}
                      {dayBdays.length > 0 && <span style={{ position: "absolute", bottom: -1, right: -1, fontSize: 6 }}>🎂</span>}
                    </div>
                  );
                })}
              </div>
              {hover && hover.month === mLabel && (
                <div style={{ marginTop: 6, fontSize: 9.5, color: "var(--text)", borderTop: "1px solid var(--border)", paddingTop: 4 }}>
                  <div style={{ color: "var(--dim)" }}>Día {hover.day}</div>
                  {hover.events.map((e: any) => <div key={e.id} style={{ color: (EVENT_CATEGORIES as any)[e.category].color }}>● {e.title}</div>)}
                  {hover.bdays.map((c: any) => <div key={c.id}>🎂 {c.name}</div>)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AppearanceTab({ sagaId, books, chapters, characters, appearances, setAppearances, appearanceCategories, setAppearanceCategories }: any) {
  const sagaBooks = useMemo(() => books.filter((b: any) => b.sagaId === sagaId || !b.sagaId && books.length === 1), [books, sagaId]);
  const sagaChapters = useMemo(() => chapters.filter((c: any) => sagaBooks.some((b: any) => b.id === c.bookId)).sort((a: any, b: any) => { const ba = sagaBooks.findIndex((x: any) => x.id === a.bookId), bb = sagaBooks.findIndex((x: any) => x.id === b.bookId); return ba - bb || a.order - b.order; }), [chapters, sagaBooks]);
  const sagaChars = characters.filter((c: any) => c.sagaId === sagaId);
  const sagaAppearances = appearances.filter((a: any) => a.sagaId === sagaId);
  const categories = appearanceCategories[sagaId] || APPEARANCE_CATEGORIES;
  const cats = Object.keys(categories);
  const [showForm, setShowForm] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [appearanceDraft, setAppearanceDraft] = useState({ characterId: "", chapterId: "", category: "cultura" });
  function openAppearanceForm(chapterId = "") {
    setAppearanceDraft({ characterId: sagaChars[0]?.id ?? "", chapterId: chapterId || sagaChapters[0]?.id || "", category: cats[0] || "" });
    setShowForm(true);
  }
  function addAppearance() {
    if (!appearanceDraft.characterId || !appearanceDraft.chapterId) return;
    setAppearances((a: any[]) => [...a, { id: uid(), sagaId, characterId: appearanceDraft.characterId, chapterId: appearanceDraft.chapterId, category: appearanceDraft.category }]);
    setShowForm(false);
  }
  function removeAppearance(id: string) {
    setAppearances((a: any[]) => a.filter((appearance: any) => appearance.id !== id));
  }
  function updateCategories(next: any) {
    setAppearanceCategories((all: any) => ({ ...all, [sagaId]: next }));
  }
  function addCategory() {
    const id = `category_${uid()}`;
    updateCategories({ ...categories, [id]: { label: "Nueva categoría", color: "#6E93C9" } });
  }
  function renameCategory(id: string, label: string) {
    updateCategories({ ...categories, [id]: { ...categories[id], label } });
  }
  function recolorCategory(id: string, color: string) {
    updateCategories({ ...categories, [id]: { ...categories[id], color } });
  }
  function deleteCategory(id: string) {
    if (sagaAppearances.some((appearance: any) => appearance.category === id)) {
      alert("No puedes eliminar una categoría que tiene apariciones asignadas. Cambia esas apariciones de categoría primero.");
      return;
    }
    const next = { ...categories };
    delete next[id];
    updateCategories(next);
  }
  const colW = 100; const laneH = 78;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <div style={fieldLabel}>Primera aparición de personajes — la numeración se reinicia en cada libro; pueden aparecer varios en la misma casilla (desplaza a la derecha)</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowCategories(true)} style={smallOutlineBtn}>Editar categorías</button>
          <button onClick={() => openAppearanceForm()} style={primaryBtn} disabled={sagaChars.length === 0 || sagaChapters.length === 0 || cats.length === 0}><Plus size={13} /> Añadir aparición</button>
        </div>
      </div>
      {sagaChars.length === 0 && <div style={{ color: "var(--dim)", fontSize: 12, marginBottom: 10 }}>Crea primero algún personaje en la pestaña Personajes.</div>}
      {sagaChapters.length === 0 && <div style={{ color: "var(--dim)", fontSize: 12, marginBottom: 10 }}>Crea primero algún capítulo para poder indicar dónde aparece.</div>}
      <div style={{ overflowX: "auto", marginTop: 10 }}>
        <div style={{ width: sagaChapters.length * colW + 70, minWidth: "100%" }}>
          <div style={{ display: "flex", marginLeft: 70 }}>
            {sagaBooks.map((book: any) => { const bookChs = sagaChapters.filter((c: any) => c.bookId === book.id); if (bookChs.length === 0) return null; return <div key={book.id} style={{ width: bookChs.length * colW, background: book.color + "33", borderBottom: `2px solid ${book.color}`, textAlign: "center", padding: "3px 0", fontSize: 10.5, color: "var(--text)", fontWeight: 600, flexShrink: 0 }}>{book.title}</div>; })}
          </div>
          <div style={{ display: "flex", marginLeft: 70, marginTop: 4 }}>
            {sagaBooks.map((book: any) => sagaChapters.filter((c: any) => c.bookId === book.id).map((c: any, i: number) => (
              <div key={c.id} onClick={() => openAppearanceForm(c.id)} style={{ width: colW, flexShrink: 0, cursor: "pointer", padding: "4px 4px", borderLeft: "1px solid var(--border)", textAlign: "center" }} title={`${book.title} · ${c.title}`}>
                <div style={{ fontSize: 12, color: "var(--text)", fontFamily: "'JetBrains Mono', monospace" }}>#{i + 1}</div>
              </div>
            )))}
          </div>
          {cats.map((cat) => (
            <div key={cat} style={{ display: "flex", alignItems: "center", height: laneH, borderTop: "1px solid var(--border)" }}>
            <div style={{ width: 70, fontSize: 9.5, color: categories[cat].color, flexShrink: 0 }}>{categories[cat].label}</div>
              {sagaChapters.map((c: any) => {
                const apps = sagaAppearances.filter((a: any) => a.chapterId === c.id && a.category === cat);
                return (
                  <div key={c.id} style={{ width: colW, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
                    {apps.map((app: any) => {
                      const char = sagaChars.find((x: any) => x.id === app.characterId); if (!char) return null;
                      return (<div key={app.id} style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={{ width: 14, height: 14, borderRadius: 4, transform: "rotate(45deg)", background: char.photo ? `url(${char.photo}) center/cover` : "var(--bg3)", border: "1px solid var(--border)", flexShrink: 0 }} />                      <span style={{ fontSize: 10.5, color: "var(--text)", whiteSpace: "nowrap" }}>{char.name.split(" ")[0]}</span><button onClick={() => removeAppearance(app.id)} style={{ ...miniIconBtn, padding: 0 }} title="Eliminar aparición"><X size={10} /></button></div>);
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {showForm && (
        <Modal onClose={() => setShowForm(false)}>
          <div style={{ width: 390, maxWidth: "85vw" }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 19, marginBottom: 14 }}>Añadir primera aparición</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={fieldLabel}>Personaje
                <select value={appearanceDraft.characterId} onChange={(e) => setAppearanceDraft((d) => ({ ...d, characterId: e.target.value }))} style={selectInput}>
                  {sagaChars.map((char: any) => <option key={char.id} value={char.id}>{char.name}</option>)}
                </select>
              </label>
              <label style={fieldLabel}>Libro y capítulo
                <select value={appearanceDraft.chapterId} onChange={(e) => setAppearanceDraft((d) => ({ ...d, chapterId: e.target.value }))} style={selectInput}>
                  {sagaChapters.map((chapter: any) => <option key={chapter.id} value={chapter.id}>{sagaBooks.find((book: any) => book.id === chapter.bookId)?.title} · {chapter.title}</option>)}
                </select>
              </label>
              <label style={fieldLabel}>Categoría
                <select value={appearanceDraft.category} onChange={(e) => setAppearanceDraft((d) => ({ ...d, category: e.target.value }))} style={selectInput}>
                  {cats.map((cat) => <option key={cat} value={cat}>{categories[cat].label}</option>)}
                </select>
              </label>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
              <button onClick={() => setShowForm(false)} style={smallOutlineBtn}>Cancelar</button>
              <button onClick={addAppearance} style={primaryBtn}>Guardar aparición</button>
            </div>
          </div>
        </Modal>
      )}
      {showCategories && (
        <Modal onClose={() => setShowCategories(false)}>
          <div style={{ width: 470, maxWidth: "88vw" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 19 }}>Categorías de aparición</div>
              <button onClick={addCategory} style={smallOutlineBtn}><Plus size={13} /> Añadir categoría</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {cats.map((cat) => (
                <div key={cat} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input value={categories[cat].label} onChange={(e) => renameCategory(cat, e.target.value)} style={{ ...textInput, flex: 1 }} />
                  <input type="color" value={categories[cat].color} onChange={(e) => recolorCategory(cat, e.target.value)} style={{ width: 34, height: 30, padding: 2, background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 5 }} />
                  <button onClick={() => deleteCategory(cat)} style={{ ...miniIconBtn, color: "#C1594A" }} title="Eliminar categoría"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
            {cats.length === 0 && <div style={{ color: "var(--dim)", fontSize: 12 }}>Añade una categoría para empezar.</div>}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}><button onClick={() => setShowCategories(false)} style={primaryBtn}>Listo</button></div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export function StoryTimelineTab({ sagaId, books, setBooks, storyEvents, setStoryEvents, characters, eraConfig, setEraConfig }: any) {
  const sagaEvents = storyEvents.filter((e: any) => e.sagaId === sagaId).sort((a: any, b: any) => (a.yearOffset * 12 + a.month) - (b.yearOffset * 12 + b.month) || a.day - b.day);
  const era = eraConfig || { startYear: 0, suffix: "" };
  const [zoom, setZoom] = useState(1);
  function addEvent() {
    const title = prompt("¿Qué ocurre?"); if (!title) return;
    const yearOffset = Number(prompt("Años desde el inicio de la historia (puede ser 1, 2, 10...):", "0")) || 0;
    const month = Number(prompt("Mes (1-12):", "1")) || 1;
    const day = Number(prompt("Día:", "1")) || 1;
    const category = prompt(`Etiqueta (${Object.keys(EVENT_CATEGORIES).join(", ")}):`, "politica_interior") || "politica_interior";
    setStoryEvents((e: any[]) => [...e, { id: uid(), sagaId, order: sagaEvents.length, yearOffset, month, day, category: (EVENT_CATEGORIES as any)[category] ? category : "politica_interior", title, description: "", highlightFor: [] }]);
  }
  function updateEvent(id: string, patch: any) { setStoryEvents((e: any[]) => e.map((x) => (x.id === id ? { ...x, ...patch } : x))); }
  function toggleHighlight(id: string, charId: string) { const ev = storyEvents.find((e: any) => e.id === id); const has = (ev.highlightFor || []).includes(charId); updateEvent(id, { highlightFor: has ? ev.highlightFor.filter((x: string) => x !== charId) : [...(ev.highlightFor || []), charId] }); }
  function updateBook(id: string, patch: any) { setBooks((bs: any[]) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b))); }
  const booksWithSpan = books.filter((b: any) => b.narrativeStartYear != null && b.narrativeEndYear != null).map((b: any) => ({ ...b, startPos: dateToPos(b.narrativeStartYear, b.narrativeStartMonth, b.narrativeStartDay), endPos: dateToPos(b.narrativeEndYear, b.narrativeEndMonth, b.narrativeEndDay) }));
  const positions = [...sagaEvents.map((e: any) => e.yearOffset * 12 + e.month), ...booksWithSpan.map((b: any) => b.startPos), ...booksWithSpan.map((b: any) => b.endPos)];
  const minPos = positions.length ? Math.min(...positions) : 0; const maxPos = positions.length ? Math.max(...positions) : 24; const span = Math.max(maxPos - minPos, 12);
  const colWidth = 80 * zoom; const totalMonths = span + 6;
  function labelYear(yearOffset: number) { return `${era.startYear + yearOffset} ${era.suffix}`.trim(); }
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 10 }}>
        <div style={fieldLabel}>Cronología dentro de la historia (se adapta a cuántos años abarquen los eventos)</div>
        <div style={{ display: "flex", gap: 8 }}><button onClick={() => setZoom((z) => Math.max(0.4, z - 0.2))} style={iconBtn}><ZoomOut size={13} /></button><button onClick={() => setZoom((z) => Math.min(3, z + 0.2))} style={iconBtn}><ZoomIn size={13} /></button><button onClick={addEvent} style={smallOutlineBtn}>+ Añadir acontecimiento</button></div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
        <span style={fieldLabel}>Año de inicio de la historia</span>
        <input type="number" value={era.startYear} onChange={(e) => setEraConfig({ startYear: Number(e.target.value) || 0 })} style={{ ...textInput, width: 90 }} />
        <input value={era.suffix} onChange={(e) => setEraConfig({ suffix: e.target.value })} placeholder="Sufijo (ej. a.f.s)" style={{ ...textInput, width: 130 }} />
        <span style={{ fontSize: 11.5, color: "var(--dim)" }}>Ej: {era.startYear || 0} {era.suffix}</span>
      </div>
      <div style={{ overflowX: "auto", marginBottom: 24, border: "1px solid var(--border)", borderRadius: 10, padding: "20px 0", background: "var(--bg2)", width: "100%" }}>
        <div style={{ position: "relative", width: Math.max(totalMonths * colWidth, 700), minHeight: 340 }}>
          <div style={{ position: "absolute", top: 170, left: 0, right: 0, height: 2, background: "var(--border)" }} />
          {Array.from({ length: totalMonths }, (_, i) => {
            const absMonth = minPos - 3 + i; const yearOffset = Math.floor((absMonth - 1) / 12); const monthInYear = ((absMonth - 1) % 12 + 12) % 12; const isJan = monthInYear === 0;
            return (
              <div key={i} style={{ position: "absolute", left: i * colWidth, top: 160, width: colWidth, textAlign: "center" }}>
                <div style={{ width: 1, height: 18, background: "var(--border)", margin: "0 auto" }} />
                <div style={{ fontSize: 9.5, color: isJan ? "var(--accent)" : "var(--dim)", marginTop: 2, fontWeight: isJan ? 700 : 400 }}>{MONTHS[monthInYear]}</div>
                {isJan && <div style={{ fontSize: 9, color: "var(--accent)" }}>{labelYear(yearOffset)}</div>}
              </div>
            );
          })}
          {booksWithSpan.map((b: any, bi: number) => { const x1 = (b.startPos - (minPos - 3)) * colWidth, x2 = (b.endPos - (minPos - 3)) * colWidth; return <div key={b.id} style={{ position: "absolute", left: x1, top: 130 - bi * 24, width: Math.max(x2 - x1, 10), height: 18, background: b.color + "55", border: `1px solid ${b.color}`, borderRadius: 4, display: "flex", alignItems: "center", paddingLeft: 6, fontSize: 9.5, color: "var(--text)", overflow: "hidden", whiteSpace: "nowrap" }} title={`${b.title}`}>{b.title}</div>; })}
          {sagaEvents.map((e: any) => {
            const pos = e.yearOffset * 12 + e.month; const x = (pos - (minPos - 3)) * colWidth;
            const chars = (e.highlightFor || []).map((id: string) => characters.find((c: any) => c.id === id)).filter(Boolean);
            return (
              <div key={e.id} style={{ position: "absolute", left: x - 60, top: 190, width: 140 }}>
                <div style={{ width: 1, height: 16, background: (EVENT_CATEGORIES as any)[e.category].color, margin: "0 auto" }} />
                <div style={{ background: "var(--bg3)", border: `1px solid ${(EVENT_CATEGORIES as any)[e.category].color}55`, borderTop: `3px solid ${(EVENT_CATEGORIES as any)[e.category].color}`, borderRadius: 6, padding: "6px 8px", fontSize: 10, lineHeight: 1.35 }}>
                  <div style={{ color: "var(--text)", fontWeight: 600, marginBottom: 2 }}>{e.title}</div>
                  {e.description && <div style={{ color: "var(--dim)", fontSize: 9.5 }}>{e.description}</div>}
                  {chars.length > 0 && <div style={{ marginTop: 3, display: "flex", alignItems: "center", gap: 3, color: "var(--accent)" }}><Star size={9} /> {chars.map((c: any) => c.name).join(", ")}</div>}
                </div>
              </div>
            );
          })}
          {sagaEvents.length === 0 && <div style={{ color: "var(--dim)", fontSize: 12, position: "absolute", left: 20, top: 190 }}>Sin acontecimientos aún.</div>}
        </div>
      </div>
      <div style={fieldLabel}>Detalle de acontecimientos</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8, marginBottom: 20 }}>
        {sagaEvents.map((e: any) => (
          <div key={e.id} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, flexWrap: "wrap", gap: 6 }}>
              <span style={{ fontWeight: 600 }}>{e.title}</span>
              <select value={e.category} onChange={(ev) => updateEvent(e.id, { category: ev.target.value })} style={{ ...selectInput, color: (EVENT_CATEGORIES as any)[e.category].color }}>{Object.entries(EVENT_CATEGORIES).map(([k, v]: any) => <option key={k} value={k}>{v.label}</option>)}</select>
              <span style={{ fontSize: 10.5, color: "var(--dim)" }}>{labelYear(e.yearOffset)} · {MONTHS[e.month - 1]} {e.day}</span>
            </div>
            <textarea value={e.description} onChange={(ev) => updateEvent(e.id, { description: ev.target.value })} rows={2} placeholder="Descripción completa del acontecimiento..." style={{ ...textArea, fontSize: 12, marginBottom: 6 }} />
            <div style={{ fontSize: 10.5, color: "var(--dim)", marginBottom: 4 }}>Marcar como remarcable para:</div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{characters.map((c: any) => <button key={c.id} onClick={() => toggleHighlight(e.id, c.id)} style={{ ...toggleBtn, padding: "3px 8px", fontSize: 10.5, ...((e.highlightFor || []).includes(c.id) ? toggleBtnActive : {}) }}><Star size={9} /> {c.name}</button>)}</div>
          </div>
        ))}
      </div>
      <div style={fieldLabel}>Cuándo empieza y termina narrativamente cada libro (día, mes y año; dos libros pueden solaparse)</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
        {books.map((b: any) => (
          <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--bg2)", border: `1px solid ${b.color}55`, borderLeft: `3px solid ${b.color}`, borderRadius: 8, padding: "8px 10px", flexWrap: "wrap" }}>
            <span style={{ fontSize: 12.5, width: 130 }}>{b.title}</span>
            <span style={{ fontSize: 10, color: "var(--dim)" }}>Empieza — Año</span><input type="number" value={b.narrativeStartYear ?? ""} onChange={(e) => updateBook(b.id, { narrativeStartYear: e.target.value ? Number(e.target.value) : null })} style={{ ...textInput, width: 55 }} />
            <span style={{ fontSize: 10, color: "var(--dim)" }}>Mes</span><input type="number" min={1} max={12} value={b.narrativeStartMonth ?? ""} onChange={(e) => updateBook(b.id, { narrativeStartMonth: e.target.value ? Number(e.target.value) : null })} style={{ ...textInput, width: 45 }} />
            <span style={{ fontSize: 10, color: "var(--dim)" }}>Día</span><input type="number" min={1} max={31} value={b.narrativeStartDay ?? ""} onChange={(e) => updateBook(b.id, { narrativeStartDay: e.target.value ? Number(e.target.value) : null })} style={{ ...textInput, width: 45 }} />
            <span style={{ fontSize: 10, color: "var(--dim)" }}>Termina — Año</span><input type="number" value={b.narrativeEndYear ?? ""} onChange={(e) => updateBook(b.id, { narrativeEndYear: e.target.value ? Number(e.target.value) : null })} style={{ ...textInput, width: 55 }} />
            <span style={{ fontSize: 10, color: "var(--dim)" }}>Mes</span><input type="number" min={1} max={12} value={b.narrativeEndMonth ?? ""} onChange={(e) => updateBook(b.id, { narrativeEndMonth: e.target.value ? Number(e.target.value) : null })} style={{ ...textInput, width: 45 }} />
            <span style={{ fontSize: 10, color: "var(--dim)" }}>Día</span><input type="number" min={1} max={31} value={b.narrativeEndDay ?? ""} onChange={(e) => updateBook(b.id, { narrativeEndDay: e.target.value ? Number(e.target.value) : null })} style={{ ...textInput, width: 45 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function LocationTab({ sagaId, books, chapters, characters, universeEntries, setUniverseEntries, locations, setLocations, borders, setBorders }: any) {
  const places = universeEntries.filter((u: any) => u.sagaId === sagaId && u.category === "Lugares" && !u.markerType);
  const markers = universeEntries.filter((u: any) => u.sagaId === sagaId && u.category === "Lugares" && u.markerType);
  const sagaChapters = useMemo(() => chapters.filter((c: any) => books.some((b: any) => b.id === c.bookId)).sort((a: any, b: any) => { const ba = books.findIndex((x: any) => x.id === a.bookId), bb = books.findIndex((x: any) => x.id === b.bookId); return ba - bb || a.order - b.order; }), [chapters, books]);
  const [chapterId, setChapterId] = useState(sagaChapters[0]?.id || "");
  const [addPlaceId, setAddPlaceId] = useState(""); const [addCharId, setAddCharId] = useState("");
  const [editingBorderId, setEditingBorderId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [focusPlaceId, setFocusPlaceId] = useState<string | null>(null);
  const [drillId, setDrillId] = useState<string | null>(null);
  const [showMarkerMenu, setShowMarkerMenu] = useState(false);
  useEffect(() => { if (!sagaChapters.find((c: any) => c.id === chapterId)) setChapterId(sagaChapters[0]?.id || ""); }, [sagaChapters]); // eslint-disable-line

  useEffect(() => {
    if (!chapterId) return;
    const already = locations.some((l: any) => l.chapterId === chapterId && l.sagaId === sagaId);
    if (already) return;
    const idx = sagaChapters.findIndex((c: any) => c.id === chapterId);
    if (idx <= 0) return;
    const prevId = sagaChapters[idx - 1].id;
    const prevLocs = locations.filter((l: any) => l.chapterId === prevId && l.sagaId === sagaId);
    if (prevLocs.length > 0) setLocations((ls: any[]) => [...ls, ...prevLocs.map((l: any) => ({ id: uid(), sagaId, chapterId, characterId: l.characterId, placeId: l.placeId }))]);
  }, [chapterId]); // eslint-disable-line

  const chapterLocations = locations.filter((l: any) => l.chapterId === chapterId && l.sagaId === sagaId);
  function assign() { if (!addPlaceId || !addCharId) return; setLocations((ls: any[]) => [...ls.filter((l) => !(l.chapterId === chapterId && l.characterId === addCharId)), { id: uid(), sagaId, chapterId, characterId: addCharId, placeId: addPlaceId }]); setAddCharId(""); }
  function remove(id: string) { setLocations((ls: any[]) => ls.filter((l) => l.id !== id)); }
  function addSublevel(parentId: string | null) {
    const name = prompt(parentId ? "Nombre del sub-sitio/sala:" : "Nombre del lugar:"); if (!name) return;
    setUniverseEntries((u: any[]) => [...u, { id: uid(), sagaId, category: "Lugares", title: name, content: "", tags: [], parentId, localX: 30 + Math.random() * 40, localY: 30 + Math.random() * 40, posNS: 0, posEW: 0, isSupernatural: false, isCapital: false, isImportantCourt: false, isIsland: false, kingdomName: "" }]);
  }
  function addMarker(kind: "lago" | "volcan" | "campamento") {
    const labels = { lago: "Lago", volcan: "Volcán", campamento: "Campamento militar" };
    const name = prompt(`Nombre del ${labels[kind].toLowerCase()}:`); if (!name) return;
    setUniverseEntries((u: any[]) => [...u, { id: uid(), sagaId, category: "Lugares", title: name, content: "", tags: [], parentId: null, markerType: kind, posNS: 0, posEW: 0 }]);
    setShowMarkerMenu(false);
  }

  const drillPlace = drillId ? places.find((p: any) => p.id === drillId) : null;
  const levelPlaces = drillId ? places.filter((p: any) => p.parentId === drillId) : places.filter((p: any) => !p.parentId);
  const size = 640;
  const cx = size / 2, cy = size / 2, scale = 24;
  function topPos(p: any) { return { x: cx + (p.posEW || 0) / 2 * scale / 2, y: cy - (p.posNS || 0) / 2 * scale / 2 }; }
  function localPos(p: any) { return { x: (p.localX || 50) / 100 * size, y: (p.localY || 50) / 100 * size }; }
  const posFor = drillId ? localPos : topPos;

  function charsAtDisplay(place: any) {
    if (!drillId) return chapterLocations.filter((l: any) => rootPlaceId(l.placeId, places) === place.id).map((l: any) => characters.find((c: any) => c.id === l.characterId)).filter(Boolean);
    return chapterLocations.filter((l: any) => l.placeId === place.id).map((l: any) => characters.find((c: any) => c.id === l.characterId)).filter(Boolean);
  }
  const directHereChars = drillId ? chapterLocations.filter((l: any) => l.placeId === drillId).map((l: any) => characters.find((c: any) => c.id === l.characterId)).filter(Boolean) : [];

  function addFeature(kind: "reino" | "mar" | "rio" | "montana") {
    const labels = { reino: "esta frontera/reino", mar: "este mar u océano", rio: "este río", montana: "esta cordillera" };
    const name = prompt(`Nombre de ${labels[kind]}:`, kind === "reino" ? "Nuevo reino" : ""); if (!name) return;
    let color = RIVER_COLOR;
    let level: number | undefined;
    if (kind === "reino") color = COLOR_PRESETS[borders.filter((b: any) => (b.kind || "reino") === "reino").length % COLOR_PRESETS.length];
    if (kind === "mar") color = SEA_COLORS[borders.filter((b: any) => b.kind === "mar").length % SEA_COLORS.length];
    if (kind === "montana") { level = 2; color = MOUNTAIN_LEVELS[2].color; }
    const nb: any = { id: uid(), name, color, kind, points: [] };
    if (kind === "montana") nb.level = level;
    setBorders([...borders, nb]);
    setEditingBorderId(nb.id);
  }
  function handleCanvasClick(e: any) { if (!editingBorderId) return; const rect = e.currentTarget.getBoundingClientRect(); const x = ((e.clientX - rect.left) / rect.width) * 100; const y = ((e.clientY - rect.top) / rect.height) * 100; setBorders(borders.map((b: any) => (b.id === editingBorderId ? { ...b, points: [...b.points, [x, y]] } : b))); }
  function removeBorder(id: string) { setBorders(borders.filter((b: any) => b.id !== id)); if (editingBorderId === id) setEditingBorderId(null); }
  function setFeatureColor(id: string, color: string) { setBorders(borders.map((b: any) => (b.id === id ? { ...b, color } : b))); }
  function setFeatureLevel(id: string, level: number) { setBorders(borders.map((b: any) => (b.id === id ? { ...b, level, color: MOUNTAIN_LEVELS[level].color } : b))); }
  const editingBorder = borders.find((b: any) => b.id === editingBorderId);

  const focusPos = focusPlaceId ? posFor(places.find((p: any) => p.id === focusPlaceId) || {}) : null;
  const vbSize = size / zoom;
  const vbX = focusPos ? Math.max(0, Math.min(size - vbSize, focusPos.x - vbSize / 2)) : 0;
  const vbY = focusPos ? Math.max(0, Math.min(size - vbSize, focusPos.y - vbSize / 2)) : 0;

  const kingdoms = borders.filter((b: any) => (b.kind || "reino") === "reino");
  const seas = borders.filter((b: any) => b.kind === "mar");
  const rivers = borders.filter((b: any) => b.kind === "rio");
  const mountains = borders.filter((b: any) => b.kind === "montana");

  function scaled(points: [number, number][]) { return points.map(([px, py]) => [px / 100 * size, py / 100 * size] as [number, number]); }
  function centroid(points: [number, number][]) {
    const n = points.length || 1;
    const sx = points.reduce((s, p) => s + p[0], 0) / n;
    const sy = points.reduce((s, p) => s + p[1], 0) / n;
    return { x: sx, y: sy };
  }
  function mountainPeaks(pts: [number, number][], spacing = 24) {
    const samples: [number, number][] = [];
    let accum = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
      const segLen = Math.hypot(x2 - x1, y2 - y1);
      let d = spacing - accum;
      while (d < segLen) {
        const t = d / segLen;
        samples.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]);
        d += spacing;
      }
      accum = (accum + segLen) % spacing;
    }
    return samples;
  }

  const markerIcon: any = { lago: Waves, volcan: Flame, campamento: Tent };

  return (
    <div>
      <div style={fieldLabel}>Dónde está cada personaje, capítulo a capítulo</div>
      <div style={{ display: "flex", gap: 8, margin: "8px 0 10px", alignItems: "center", flexWrap: "wrap" }}>
        <select value={chapterId} onChange={(e) => setChapterId(e.target.value)} style={selectInput}>{sagaChapters.map((c: any, i: number) => <option key={c.id} value={c.id}>Cap. {i + 1}: {c.title}</option>)}</select>
        <span style={{ fontSize: 10.5, color: "var(--dim)" }}>(se copia automáticamente del capítulo anterior si está vacío)</span>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center", flexWrap: "wrap" }}>
        <button onClick={() => addFeature("reino")} style={smallOutlineBtn}>+ Reino / territorio</button>
        <button onClick={() => addFeature("mar")} style={smallOutlineBtn}>+ Mar u océano</button>
        <button onClick={() => addFeature("rio")} style={smallOutlineBtn}>+ Río</button>
        <button onClick={() => addFeature("montana")} style={smallOutlineBtn}>+ Cordillera</button>
        <div style={{ position: "relative" }}>
          <button onClick={() => setShowMarkerMenu((v) => !v)} style={smallOutlineBtn}>+ Marcador...</button>
          {showMarkerMenu && (
            <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 4, background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: 6, display: "flex", flexDirection: "column", gap: 4, zIndex: 10, minWidth: 160 }}>
              <button onClick={() => addMarker("lago")} style={{ ...smallOutlineBtn, justifyContent: "flex-start" }}><Waves size={12} /> Lago</button>
              <button onClick={() => addMarker("volcan")} style={{ ...smallOutlineBtn, justifyContent: "flex-start" }}><Flame size={12} /> Volcán</button>
              <button onClick={() => addMarker("campamento")} style={{ ...smallOutlineBtn, justifyContent: "flex-start" }}><Tent size={12} /> Campamento militar</button>
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: "auto" }}><button onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))} style={iconBtn}><ZoomOut size={13} /></button><span style={{ fontSize: 11, color: "var(--dim)", width: 34, textAlign: "center" }}>{Math.round(zoom * 100)}%</span><button onClick={() => setZoom((z) => Math.min(4, z + 0.25))} style={iconBtn}><ZoomIn size={13} /></button></div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 10, alignItems: "center", flexWrap: "wrap" }}>
        {borders.map((b: any) => {
          const kind = b.kind || "reino";
          return (
            <div key={b.id} style={{ display: "flex", flexDirection: "column", gap: 3, background: "var(--bg2)", border: `1px solid ${b.color}`, borderRadius: 6, padding: "3px 8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
                {kind === "montana" && <Mountain size={11} color={b.color} />}
                <span style={{ color: b.color }}>{b.name}</span>
                <span style={{ fontSize: 9, color: "var(--dim)" }}>({kind === "reino" ? "reino" : kind === "mar" ? "mar" : kind === "rio" ? "río" : "cordillera"})</span>
                <button onClick={() => setEditingBorderId(editingBorderId === b.id ? null : b.id)} style={miniIconBtn}><Pencil size={10} /></button>
                <button onClick={() => removeBorder(b.id)} style={miniIconBtn}><X size={10} /></button>
              </div>
              {kind === "mar" && (
                <div style={{ display: "flex", gap: 3 }}>{SEA_COLORS.map((c) => <button key={c} onClick={() => setFeatureColor(b.id, c)} style={{ width: 12, height: 12, borderRadius: "50%", background: c, border: b.color === c ? "2px solid #fff" : "1px solid var(--border)", cursor: "pointer" }} />)}</div>
              )}
              {kind === "montana" && (
                <div style={{ display: "flex", gap: 3 }}>{[1, 2, 3].map((lvl) => <button key={lvl} onClick={() => setFeatureLevel(b.id, lvl)} style={{ ...smallOutlineBtn, padding: "1px 6px", fontSize: 9.5, ...(b.level === lvl ? { borderColor: "var(--accent)", color: "var(--accent)" } : {}) }}>{MOUNTAIN_LEVELS[lvl].label}</button>)}</div>
              )}
            </div>
          );
        })}
      </div>
      {editingBorderId && <div style={{ fontSize: 11, color: "var(--accent)", marginBottom: 8 }}>Editando "{editingBorder?.name}": haz click en el mapa para añadir puntos, en orden. Pulsa el lápiz de nuevo para terminar.</div>}
      {drillId && <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><button onClick={() => setDrillId(null)} style={smallOutlineBtn}><ArrowLeft size={12} /> Volver al mapa general</button><span style={{ fontSize: 12, color: "var(--dim)" }}>Dentro de: <b style={{ color: "var(--text)" }}>{drillPlace?.title}</b></span></div>}

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <div style={{ overflow: "auto", maxWidth: "100%", maxHeight: 560, border: "1px solid var(--border)", borderRadius: 10 }}>
          <svg width={size} height={size} viewBox={`${vbX} ${vbY} ${vbSize} ${vbSize}`} onClick={handleCanvasClick} style={{ background: "var(--bg2)", cursor: editingBorderId ? "crosshair" : "default", display: "block", maxWidth: "100%" }}>
            {!drillId && kingdoms.map((b: any) => b.points.length >= 3 && <polygon key={b.id} points={scaled(b.points).map(([px, py]) => `${px},${py}`).join(" ")} fill={b.color} fillOpacity={0.06} stroke={b.color} strokeWidth={1.4} strokeDasharray="5 3" />)}
            {!drillId && seas.map((b: any) => b.points.length >= 3 && (
              <g key={b.id}>
                <polygon points={scaled(b.points).map(([px, py]) => `${px},${py}`).join(" ")} fill={b.color} fillOpacity={0.38} stroke={b.color} strokeWidth={1.6} />
                <text x={centroid(scaled(b.points)).x} y={centroid(scaled(b.points)).y} textAnchor="middle" fontSize={10} fill="#EAF4FF" style={{ pointerEvents: "none", fontStyle: "italic" }}>{b.name}</text>
              </g>
            ))}
            {!drillId && rivers.map((b: any) => b.points.length >= 2 && (
              <g key={b.id}>
                <polyline points={scaled(b.points).map(([px, py]) => `${px},${py}`).join(" ")} fill="none" stroke={RIVER_COLOR} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
                <text x={centroid(scaled(b.points)).x} y={centroid(scaled(b.points)).y - 6} textAnchor="middle" fontSize={9.5} fill={RIVER_COLOR} style={{ pointerEvents: "none" }}>{b.name}</text>
              </g>
            ))}
            {!drillId && mountains.map((b: any) => {
              if (b.points.length < 2) return null;
              const pts = scaled(b.points);
              const lvl = MOUNTAIN_LEVELS[b.level || 2];
              const peaks = mountainPeaks(pts, 20);
              return (
                <g key={b.id}>
                  <polyline points={pts.map(([px, py]) => `${px},${py}`).join(" ")} fill="none" stroke={lvl.color} strokeWidth={1.4} strokeDasharray="2 3" opacity={0.5} />
                  {peaks.map((p, i) => (
                    <g key={i}>
                      <polygon points={`${p[0] - 7},${p[1] + 6} ${p[0]},${p[1] - 9} ${p[0] + 7},${p[1] + 6}`} fill={lvl.peakColor} stroke={lvl.color} strokeWidth={1} />
                      {(b.level || 2) === 3 && <polygon points={`${p[0] - 3},${p[1] - 4} ${p[0]},${p[1] - 9} ${p[0] + 3},${p[1] - 4}`} fill="#FFFFFF" />}
                    </g>
                  ))}
                  <text x={centroid(pts).x} y={centroid(pts).y + 16} textAnchor="middle" fontSize={9.5} fill={lvl.color} style={{ pointerEvents: "none" }}>{b.name}</text>
                </g>
              );
            })}
            {!drillId && editingBorder && editingBorder.points.length > 0 && editingBorder.points.map(([px, py]: any, i: number) => <circle key={i} cx={px / 100 * size} cy={py / 100 * size} r={4} fill={editingBorder.color} />)}
            {!drillId && markers.map((m: any) => {
              const { x, y } = topPos(m);
              const Icon = markerIcon[m.markerType];
              return (
                <g key={m.id}>
                  <circle cx={x} cy={y} r={12} fill="var(--bg3)" stroke="var(--border)" strokeWidth={1.2} />
                  {Icon && <Icon x={x - 7} y={y - 7} width={14} height={14} color="var(--accent)" />}
                  <text x={x} y={y + 20} textAnchor="middle" fontSize={8} fill="var(--dim)" style={{ pointerEvents: "none" }}>{m.title}</text>
                </g>
              );
            })}
            {levelPlaces.map((p: any) => {
              const { x, y } = posFor(p);
              const outside = !drillId && kingdoms.length > 0 ? !kingdoms.some((b: any) => b.points.length >= 3 && pointInPolygon([x, y], scaled(b.points))) : false;
              const here = charsAtDisplay(p);
              const hasChildren = places.some((x2: any) => x2.parentId === p.id);
              const r = drillId ? 22 : 20;
              return (
                <g key={p.id}>
                  {p.isIsland && <circle cx={x} cy={y} r={r + 10} fill={`${SEA_COLORS[0]}55`} />}
                  <circle cx={x} cy={y} r={r} fill="var(--bg3)" stroke={outside ? "#C1594A" : "var(--accent)"} strokeWidth={1.8} onClick={(e) => { e.stopPropagation(); if (hasChildren) setDrillId(p.id); else setFocusPlaceId(p.id); }} style={{ cursor: hasChildren ? "zoom-in" : "pointer" }} />
                  <text x={x} y={y - 2} textAnchor="middle" fontSize={8.5} fill={outside ? "#C1594A" : "var(--text)"} style={{ pointerEvents: "none" }}>{p.title.length > 12 ? p.title.slice(0, 11) + "…" : p.title}<title>{p.title}</title></text>
                  {p.isCapital && <Landmark x={x - 6} y={y + 3} width={9} height={9} color="var(--accent)" style={{ pointerEvents: "none" } as any} />}
                  {p.isImportantCourt && <Crown x={x - 2} y={y + 3} width={9} height={9} color="#C9A24B" style={{ pointerEvents: "none" } as any} />}
                  {here.map((ch: any, i: number) => { const ang = (i / Math.max(here.length, 1)) * 2 * Math.PI; const ox = (r + 12) * Math.cos(ang), oy = (r + 12) * Math.sin(ang); return (<g key={ch.id}><circle cx={x + ox} cy={y + oy} r={7} fill={colorForReader(ch.name)} stroke="var(--bg)" strokeWidth={1.3} /><text x={x + ox} y={y + oy + 3} textAnchor="middle" fontSize={7.5} fill="#fff" style={{ pointerEvents: "none" }}>{ch.name.charAt(0)}</text></g>); })}
                </g>
              );
            })}
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          {drillId && directHereChars.length > 0 && <div style={{ fontSize: 11, color: "var(--accent)", marginBottom: 8 }}>Directamente en "{drillPlace.title}" (fuera de sus sub-sitios): {directHereChars.map((c: any) => c.name).join(", ")}</div>}
          <div style={fieldLabel}>Personajes en este capítulo</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
            {chapterLocations.length === 0 && <div style={{ color: "var(--dim)", fontSize: 12 }}>Nadie asignado todavía.</div>}
            {chapterLocations.map((l: any) => {
              const char = characters.find((c: any) => c.id === l.characterId), place = places.find((p: any) => p.id === l.placeId);
              return (<div key={l.id} style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px", fontSize: 12.5 }}><span style={{ color: colorForReader(char?.name), fontWeight: 600 }}>{char?.name}</span><span style={{ color: "var(--dim)" }}>→</span><span>{place?.title}</span><button onClick={() => remove(l.id)} style={{ ...miniIconBtn, marginLeft: "auto" }}><X size={11} /></button></div>);
            })}
          </div>
          <div style={fieldLabel}>Traer a un personaje a un lugar en este capítulo</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <select value={addCharId} onChange={(e) => setAddCharId(e.target.value)} style={selectInput}><option value="">Personaje...</option>{characters.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
            <select value={addPlaceId} onChange={(e) => setAddPlaceId(e.target.value)} style={selectInput}><option value="">Lugar...</option>{places.map((p: any) => <option key={p.id} value={p.id}>{p.parentId ? "— " : ""}{p.title}</option>)}</select>
            <button onClick={assign} style={smallOutlineBtn}>+ Ubicar aquí</button>
          </div>
          <div style={{ marginTop: 14 }}><button onClick={() => addSublevel(drillId)} style={smallOutlineBtn}>{drillId ? "+ Sub-sitio/sala aquí" : "+ Lugar"}</button></div>
          {places.length === 0 && markers.length === 0 && <div style={{ color: "var(--dim)", fontSize: 11.5, marginTop: 10 }}>Añade lugares en la pestaña Universo (o aquí mismo) para que aparezcan en el mapa.</div>}
        </div>
      </div>
    </div>
  );
}
export function UniverseTab({ sagaId, universeEntries, setUniverseEntries }: any) {
  const sagaEntries = universeEntries.filter((u: any) => u.sagaId === sagaId);
  const places = sagaEntries.filter((e: any) => e.category === "Lugares");
  function addEntry(category: string) {
    const title = prompt("Título:"); if (!title) return;
    const base: any = { id: uid(), sagaId, category, title, content: "", tags: [] };
    if (category === "Lugares") Object.assign(base, { parentId: null, localX: 50, localY: 50, posNS: 0, posEW: 0, nearRiver: false, nearSea: false, nearMountain: false, nearLake: false, nearVolcano: false, nearCamp: false, isSupernatural: false, isCapital: false, isImportantCourt: false, isIsland: false, kingdomName: "" });
    if (category === "Dioses") Object.assign(base, { domain: "", symbol: "", personality: "", image: null });
    if (category === "Objetos") Object.assign(base, { objectKind: "Normal", image: null });
    setUniverseEntries((u: any[]) => [...u, base]);
  }
  function updateEntry(id: string, patch: any) { setUniverseEntries((u: any[]) => u.map((e) => (e.id === id ? { ...e, ...patch } : e))); }
  function removeEntry(id: string) { setUniverseEntries((u: any[]) => u.filter((e) => e.id !== id)); }
  function addTag(id: string) { const tag = prompt("Nueva etiqueta:"); if (!tag) return; const e = sagaEntries.find((x: any) => x.id === id); updateEntry(id, { tags: [...(e.tags || []), tag] }); }
  function removeTag(id: string, tag: string) { const e = sagaEntries.find((x: any) => x.id === id); updateEntry(id, { tags: (e.tags || []).filter((t: string) => t !== tag) }); }
  function addSublevel(parentId: string) {
    const name = prompt("Nombre del sub-sitio/sala:"); if (!name) return;
    setUniverseEntries((u: any[]) => [...u, { id: uid(), sagaId, category: "Lugares", title: name, content: "", tags: [], parentId, localX: 30 + Math.random() * 40, localY: 30 + Math.random() * 40, posNS: 0, posEW: 0, nearRiver: false, nearSea: false, nearMountain: false, nearLake: false, nearVolcano: false, nearCamp: false, isSupernatural: false, isCapital: false, isImportantCourt: false, isIsland: false, kingdomName: "" }]);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {UNIVERSE_CATEGORIES.map((cat) => {
        const entries = cat === "Lugares" ? places.filter((e: any) => !e.parentId) : sagaEntries.filter((e: any) => e.category === cat);
        return (
          <div key={cat}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><div style={{ fontFamily: "'Fraunces', serif", fontSize: 15 }}>{cat}</div><button onClick={() => addEntry(cat)} style={smallOutlineBtn}>+ Añadir</button></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
              {entries.map((e: any) => <PlaceCard key={e.id} entry={e} cat={cat} allPlaces={places} updateEntry={updateEntry} removeEntry={removeEntry} addTag={addTag} removeTag={removeTag} addSublevel={addSublevel} />)}
              {entries.length === 0 && <div style={{ color: "var(--dim)", fontSize: 12, gridColumn: "1/-1" }}>Sin entradas todavía.</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PlaceCard({ entry: e, cat, allPlaces, updateEntry, removeEntry, addTag, removeTag, addSublevel }: any) {
  const children = allPlaces.filter((p: any) => p.parentId === e.id);
  return (
    <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
      {(cat === "Dioses" || cat === "Objetos") && <UniverseImage entry={e} onUpdate={(patch: any) => updateEntry(e.id, patch)} />}
      <div style={{ display: "flex", justifyContent: "space-between" }}><input value={e.title} onChange={(ev) => updateEntry(e.id, { title: ev.target.value })} style={{ ...textInput, fontFamily: "'Fraunces', serif", fontSize: 14, border: "none", padding: 0, background: "none" }} /><button onClick={() => removeEntry(e.id)} style={miniIconBtn}><X size={11} /></button></div>
      <textarea value={e.content} onChange={(ev) => updateEntry(e.id, { content: ev.target.value })} rows={3} style={{ ...textArea, marginTop: 8, fontSize: 12.5 }} placeholder="Detalles..." />
      {cat === "Objetos" && <select value={e.objectKind} onChange={(ev) => updateEntry(e.id, { objectKind: ev.target.value })} style={{ ...selectInput, marginTop: 6, width: "100%" }}>{OBJECT_KINDS.map((k) => <option key={k}>{k}</option>)}</select>}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 8 }}>{(e.tags || []).map((t: string) => <span key={t} style={{ fontSize: 9.5, background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 8, padding: "2px 6px", display: "flex", alignItems: "center", gap: 3 }}>{t}<X size={9} style={{ cursor: "pointer" }} onClick={() => removeTag(e.id, t)} /></span>)}<button onClick={() => addTag(e.id)} style={{ fontSize: 9.5, background: "none", border: "1px dashed var(--border)", borderRadius: 8, padding: "2px 6px", color: "var(--dim)", cursor: "pointer" }}>+ etiqueta</button></div>
      {cat === "Lugares" && (
        <div style={{ marginTop: 10, borderTop: "1px solid var(--border)", paddingTop: 8 }}>
          {!e.parentId && (
            <>
              <div style={{ fontSize: 10.5, color: "var(--dim)", marginBottom: 6 }}>Posición en el mapa (0 = centro del reino)</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <span style={{ fontSize: 10, width: 70, color: "var(--dim)" }}>{e.posNS >= 0 ? "Norte" : "Sur"}</span>
                <input type="range" min={-60} max={60} value={e.posNS ?? 0} onChange={(ev) => updateEntry(e.id, { posNS: Number(ev.target.value) })} style={{ flex: 1 }} />
                <span style={{ fontSize: 10, width: 24, color: "var(--accent)" }}>{Math.abs(e.posNS ?? 0)}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <span style={{ fontSize: 10, width: 70, color: "var(--dim)" }}>{e.posEW >= 0 ? "Este" : "Oeste"}</span>
                <input type="range" min={-60} max={60} value={e.posEW ?? 0} onChange={(ev) => updateEntry(e.id, { posEW: Number(ev.target.value) })} style={{ flex: 1 }} />
                <span style={{ fontSize: 10, width: 24, color: "var(--accent)" }}>{Math.abs(e.posEW ?? 0)}</span>
              </div>
              <input value={e.kingdomName} onChange={(ev) => updateEntry(e.id, { kingdomName: ev.target.value })} placeholder="Si está fuera: ¿otro reino? ¿cuál?" style={{ ...textInput, marginTop: 4, marginBottom: 6, fontSize: 11, ...(e.kingdomName ? { borderColor: "#C1594A" } : {}) }} />
            </>
          )}
          {e.parentId && (
            <div style={{ marginBottom: 6 }}>
              <div style={{ fontSize: 10.5, color: "var(--dim)", marginBottom: 4 }}>Posición dentro de "{allPlaces.find((p: any) => p.id === e.parentId)?.title}"</div>
              {["localX", "localY"].map((axis) => (<div key={axis} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}><span style={{ fontSize: 10, width: 20, color: "var(--dim)" }}>{axis === "localX" ? "X" : "Y"}</span><input type="range" min={0} max={100} value={e[axis] ?? 50} onChange={(ev) => updateEntry(e.id, { [axis]: Number(ev.target.value) })} style={{ flex: 1 }} /></div>))}
            </div>
          )}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{[["isIsland","Isla"],["isSupernatural","Sobrenatural"],["isCapital","Capital"],["isImportantCourt","Corte importante"]].map(([key, label]) => (<label key={key} style={{ fontSize: 10, display: "flex", alignItems: "center", gap: 3 }}><input type="checkbox" checked={!!e[key]} onChange={(ev) => updateEntry(e.id, { [key]: ev.target.checked })} /> {label}</label>))}</div>          <button onClick={() => addSublevel(e.id)} style={{ ...smallOutlineBtn, marginTop: 8, fontSize: 10.5 }}><DoorOpen size={11} /> + Sub-sitio / sala aquí</button>
          {children.length > 0 && <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6, borderLeft: "2px solid var(--border)", paddingLeft: 8 }}>{children.map((ch: any) => <PlaceCard key={ch.id} entry={ch} cat={cat} allPlaces={allPlaces} updateEntry={updateEntry} removeEntry={removeEntry} addTag={addTag} removeTag={removeTag} addSublevel={addSublevel} />)}</div>}
        </div>
      )}
      {cat === "Dioses" && (<div style={{ marginTop: 10, borderTop: "1px solid var(--border)", paddingTop: 8, display: "flex", flexDirection: "column", gap: 6 }}><input value={e.domain} onChange={(ev) => updateEntry(e.id, { domain: ev.target.value })} placeholder="Ámbito / dominio (ej. guerra, amor...)" style={{ ...textInput, fontSize: 11 }} /><input value={e.symbol} onChange={(ev) => updateEntry(e.id, { symbol: ev.target.value })} placeholder="Símbolo" style={{ ...textInput, fontSize: 11 }} /><input value={e.personality} onChange={(ev) => updateEntry(e.id, { personality: ev.target.value })} placeholder="Personalidad" style={{ ...textInput, fontSize: 11 }} /></div>)}
    </div>
  );
}

function UniverseImage({ entry, onUpdate }: any) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div onClick={() => ref.current?.click()} style={{ width: "100%", height: 90, borderRadius: 6, marginBottom: 8, background: entry.image ? `url(${entry.image}) center/cover` : "var(--bg3)", border: "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {!entry.image && <ImageIcon size={18} color="var(--dim)" />}
      <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => e.target.files && e.target.files[0] && fileToDataUrl(e.target.files[0], (url) => onUpdate({ image: url }))} />
    </div>
  );
}
export function LoreTab({ sagaId, loreEntries, setLoreEntries, bestiary, setBestiary }: any) {
  const entries = loreEntries.filter((l: any) => l.sagaId === sagaId); const creatures = bestiary.filter((b: any) => b.sagaId === sagaId);
  function addLore() { const title = prompt("Nombre del elemento:"); if (!title) return; const kind = prompt(`Tipo (${LORE_TYPES.join(", ")}):`, LORE_TYPES[0]) || LORE_TYPES[0]; setLoreEntries((l: any[]) => [...l, { id: uid(), sagaId, title, kind: LORE_TYPES.includes(kind) ? kind : LORE_TYPES[0], description: "", fn: "", inventor: "", materials: "", era: "" }]); }
  function updateLore(id: string, patch: any) { setLoreEntries((l: any[]) => l.map((e) => (e.id === id ? { ...e, ...patch } : e))); }
  function removeLore(id: string) { setLoreEntries((l: any[]) => l.filter((e) => e.id !== id)); }
  function addCreature() { const name = prompt("Nombre de la criatura:"); if (!name) return; setBestiary((b: any[]) => [...b, { id: uid(), sagaId, name, species: "", danger: "Bajo", image: null, description: "" }]); }
  function updateCreature(id: string, patch: any) { setBestiary((b: any[]) => b.map((e) => (e.id === id ? { ...e, ...patch } : e))); }
  function removeCreature(id: string) { setBestiary((b: any[]) => b.filter((e) => e.id !== id)); }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, display: "flex", alignItems: "center", gap: 6 }}><ScrollText size={16} color="var(--accent)" /> Elementos de lore</div>
          <button onClick={addLore} style={smallOutlineBtn}>+ Añadir elemento</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
          {entries.map((e: any) => (
            <div key={e.id} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><input value={e.title} onChange={(ev) => updateLore(e.id, { title: ev.target.value })} style={{ ...textInput, fontFamily: "'Fraunces', serif", fontSize: 14, border: "none", padding: 0, background: "none" }} /><button onClick={() => removeLore(e.id)} style={miniIconBtn}><X size={11} /></button></div>
              <select value={e.kind} onChange={(ev) => updateLore(e.id, { kind: ev.target.value })} style={{ ...selectInput, marginTop: 6, width: "100%" }}>{LORE_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
              <textarea value={e.description} onChange={(ev) => updateLore(e.id, { description: ev.target.value })} rows={2} placeholder="Descripción del elemento en el mundo..." style={{ ...textArea, marginTop: 8, fontSize: 12 }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 6 }}>
                <input value={e.fn} onChange={(ev) => updateLore(e.id, { fn: ev.target.value })} placeholder="Función" style={{ ...textInput, fontSize: 11 }} />
                <input value={e.inventor} onChange={(ev) => updateLore(e.id, { inventor: ev.target.value })} placeholder="Inventor/origen" style={{ ...textInput, fontSize: 11 }} />
                <input value={e.materials} onChange={(ev) => updateLore(e.id, { materials: ev.target.value })} placeholder="Materiales" style={{ ...textInput, fontSize: 11 }} />
                <input value={e.era} onChange={(ev) => updateLore(e.id, { era: ev.target.value })} placeholder="Era / época" style={{ ...textInput, fontSize: 11 }} />
              </div>
            </div>
          ))}
          {entries.length === 0 && <div style={{ color: "var(--dim)", fontSize: 12 }}>Sin elementos de lore todavía.</div>}
        </div>
      </div>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, display: "flex", alignItems: "center", gap: 6 }}><PawPrint size={16} color="var(--accent)" /> Bestiario</div>
          <button onClick={addCreature} style={smallOutlineBtn}>+ Añadir criatura</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
          {creatures.map((c: any) => (
            <div key={c.id} style={{ background: "var(--bg2)", border: `1px solid ${(BESTIARY_DANGER_COLOR as any)[c.danger]}55`, borderTop: `3px solid ${(BESTIARY_DANGER_COLOR as any)[c.danger]}`, borderRadius: 8, padding: 12 }}>
              <div style={{ display: "flex", gap: 10 }}>
                <BestiaryImage creature={c} onUpdate={(patch: any) => updateCreature(c.id, patch)} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><input value={c.name} onChange={(ev) => updateCreature(c.id, { name: ev.target.value })} style={{ ...textInput, fontFamily: "'Fraunces', serif", fontSize: 13, border: "none", padding: 0, background: "none" }} /><button onClick={() => removeCreature(c.id)} style={miniIconBtn}><X size={11} /></button></div>
                  <input value={c.species} onChange={(ev) => updateCreature(c.id, { species: ev.target.value })} placeholder="Tipo / especie (dragón, demonio, hada...)" style={{ ...textInput, fontSize: 11, marginTop: 6 }} />
                  <select value={c.danger} onChange={(ev) => updateCreature(c.id, { danger: ev.target.value })} style={{ ...selectInput, marginTop: 6, color: (BESTIARY_DANGER_COLOR as any)[c.danger] }}>{BESTIARY_DANGER.map((d) => <option key={d}>{d}</option>)}</select>
                </div>
              </div>
              <textarea value={c.description} onChange={(ev) => updateCreature(c.id, { description: ev.target.value })} rows={2} placeholder="Habilidades, comportamiento..." style={{ ...textArea, marginTop: 8, fontSize: 12 }} />
            </div>
          ))}
          {creatures.length === 0 && <div style={{ color: "var(--dim)", fontSize: 12 }}>Sin criaturas todavía.</div>}
        </div>
      </div>
    </div>
  );
}

function BestiaryImage({ creature, onUpdate }: any) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div onClick={() => ref.current?.click()} style={{ width: 48, height: 48, borderRadius: 8, flexShrink: 0, background: creature.image ? `url(${creature.image}) center/cover` : "var(--bg3)", border: "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {!creature.image && <ImageIcon size={14} color="var(--dim)" />}
      <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => e.target.files && e.target.files[0] && fileToDataUrl(e.target.files[0], (url) => onUpdate({ image: url }))} />
    </div>
  );
}

export function CorkboardTab({ bookId, corkNotes, setCorkNotes }: any) {
  const notes = corkNotes[bookId] || [];
  const boardConfig = corkNotes[`${bookId}:config`] || { width: 1000, height: 620 };
  const dragRef = useRef<any>(null);
  const [zoom, setZoom] = useState(1);
  const maxZ = useRef(notes.reduce((m: number, n: any) => Math.max(m, n.z || 1), 1));
  function addNote() { const color = CORK_COLORS[hash(uid()) % CORK_COLORS.length]; maxZ.current += 1; setCorkNotes((c: any) => ({ ...c, [bookId]: [...(c[bookId] || []), { id: uid(), text: "", color, x: 20 + ((c[bookId]?.length || 0) * 24) % 300, y: 20 + ((c[bookId]?.length || 0) * 18) % 200, shape: "rect", size: "M", z: maxZ.current }] })); }
  function updateNote(id: string, patch: any) { setCorkNotes((c: any) => ({ ...c, [bookId]: (c[bookId] || []).map((n: any) => (n.id === id ? { ...n, ...patch } : n)) })); }
  function removeNote(id: string) { setCorkNotes((c: any) => ({ ...c, [bookId]: (c[bookId] || []).filter((n: any) => n.id !== id) })); }
  function updateBoardConfig(patch: any) { setCorkNotes((c: any) => ({ ...c, [`${bookId}:config`]: { ...boardConfig, ...patch } })); }
  function bringToFront(id: string) { maxZ.current += 1; updateNote(id, { z: maxZ.current }); }
  function onPointerDown(e: any, id: string) { bringToFront(id); const note = notes.find((n: any) => n.id === id); dragRef.current = { id, startX: e.clientX, startY: e.clientY, origX: note.x, origY: note.y }; window.addEventListener("pointermove", onPointerMove); window.addEventListener("pointerup", onPointerUp); }
  function onPointerMove(e: any) { if (!dragRef.current) return; const { id, startX, startY, origX, origY } = dragRef.current; updateNote(id, { x: Math.max(0, origX + (e.clientX - startX) / zoom), y: Math.max(0, origY + (e.clientY - startY) / zoom) }); }
  function onPointerUp() { dragRef.current = null; window.removeEventListener("pointermove", onPointerMove); window.removeEventListener("pointerup", onPointerUp); }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={fieldLabel}>Pizarra de notas — arrastra los post-it por el corcho</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><label style={{ fontSize: 10.5, color: "var(--dim)" }}>Pizarra <input type="number" min={500} value={boardConfig.width} onChange={(e) => updateBoardConfig({ width: Math.max(500, Number(e.target.value)) })} style={{ width: 62 }} /> x <input type="number" min={420} value={boardConfig.height} onChange={(e) => updateBoardConfig({ height: Math.max(420, Number(e.target.value)) })} style={{ width: 62 }} /></label><button onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))} style={iconBtn}><ZoomOut size={13} /></button><button onClick={() => setZoom((z) => Math.min(2, z + 0.2))} style={iconBtn}><ZoomIn size={13} /></button><button onClick={addNote} style={primaryBtn}><PlusSquare size={13} /> Nueva nota</button></div>
      </div>
      <div style={{ overflow: "auto", maxHeight: 560, border: "1px solid var(--border)", borderRadius: 10 }}>
        <div style={{ position: "relative", width: boardConfig.width, height: boardConfig.height, transform: `scale(${zoom})`, transformOrigin: "top left", background: "repeating-linear-gradient(45deg, var(--bg3), var(--bg3) 10px, var(--bg2) 10px, var(--bg2) 20px)" }}>
          {notes.map((n: any) => {
            const sz = (CORK_SIZES as any)[n.size] || CORK_SIZES.M;
            return (
              <div key={n.id} onPointerDown={(e) => onPointerDown(e, n.id)} style={{ position: "absolute", left: n.x, top: n.y, width: sz, minHeight: n.shape === "circle" ? sz : sz * 0.75, background: n.color, borderRadius: n.shape === "circle" ? "50%" : n.shape === "cloud" ? "40% 60% 55% 45% / 55% 45% 60% 40%" : 4, padding: n.shape === "circle" ? sz * 0.18 : 10, boxShadow: "2px 3px 8px rgba(0,0,0,0.3)", cursor: "grab", transform: `rotate(${(hash(n.id) % 7) - 3}deg)`, zIndex: n.z || 1, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}><button onClick={() => removeNote(n.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#2B2A25" }}><X size={12} /></button></div>
                <textarea value={n.text} onChange={(e) => updateNote(n.id, { text: e.target.value })} onPointerDown={(e) => e.stopPropagation()} rows={4} placeholder="Escribe aquí..." style={{ width: "100%", flex: 1, background: "none", border: "none", outline: "none", resize: "none", color: "#2B2A25", fontSize: 12, fontFamily: "'Inter', sans-serif", textAlign: n.shape === "circle" ? "center" : "left" }} />
                <div style={{ display: "flex", gap: 3, marginTop: 4, flexWrap: "wrap" }}>{CORK_COLORS.map((c) => <button key={c} onPointerDown={(e) => e.stopPropagation()} onClick={() => updateNote(n.id, { color: c })} style={{ width: 10, height: 10, borderRadius: "50%", background: c, border: n.color === c ? "1.5px solid #2B2A25" : "1px solid rgba(0,0,0,0.2)", cursor: "pointer" }} />)}</div>
                <div style={{ display: "flex", gap: 3, marginTop: 3 }}>
                  {CORK_SHAPES.map((s) => <button key={s} onPointerDown={(e) => e.stopPropagation()} onClick={() => updateNote(n.id, { shape: s })} style={{ fontSize: 8.5, padding: "1px 4px", borderRadius: 3, border: n.shape === s ? "1px solid #2B2A25" : "1px solid rgba(0,0,0,0.2)", background: "rgba(255,255,255,0.4)", cursor: "pointer" }}>{s === "rect" ? "▭" : s === "circle" ? "●" : "☁"}</button>)}
                  {Object.keys(CORK_SIZES).map((s) => <button key={s} onPointerDown={(e) => e.stopPropagation()} onClick={() => updateNote(n.id, { size: s })} style={{ fontSize: 8.5, padding: "1px 4px", borderRadius: 3, border: n.size === s ? "1px solid #2B2A25" : "1px solid rgba(0,0,0,0.2)", background: "rgba(255,255,255,0.4)", cursor: "pointer" }}>{s}</button>)}
                </div>
              </div>
            );
          })}
          {notes.length === 0 && <div style={{ color: "var(--dim)", fontSize: 12.5, padding: 20 }}>Añade tu primera nota.</div>}
        </div>
      </div>
    </div>
  );
}

export function ExportTab({ book, chapters, characters, universeEntries, bookActs }: any) {
  const [selected, setSelected] = useState(chapters.map((c: any) => c.id));
  const [format, setFormat] = useState("word");
  const [done, setDone] = useState(""); const [doneWorld, setDoneWorld] = useState("");
  const [busy, setBusy] = useState(false);
  const toggle = (id: string) => setSelected((s: string[]) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  async function handleExportSelection() {
    const chosen = chapters.filter((c: any) => selected.includes(c.id));
    if (chosen.length === 0) { setDone("Selecciona al menos un capítulo."); return; }
    setBusy(true);
    try {
      if (format === "word") await exportChaptersToWord(book?.title || "Libro", chosen);
      else exportChaptersToPdf(book?.title || "Libro", chosen);
      setDone(`${chosen.length} capítulo(s) exportados a ${format === "word" ? "Word" : "PDF"}.`);
    } catch (err) {
      console.error(err);
      setDone("Ha ocurrido un error al exportar.");
    }
    setBusy(false);
  }

  async function handleExportFullBook() {
    setBusy(true);
    try {
      await exportChaptersToWord(book?.title || "Libro", chapters);
      setDone(`Libro completo exportado a Word.`);
    } catch (err) {
      console.error(err);
      setDone("Ha ocurrido un error al exportar.");
    }
    setBusy(false);
  }

  async function handleExportWorldbuilding() {
    setBusy(true);
    try {
      await exportWorldbuilding(book?.title || "Libro", characters, bookActs, universeEntries);
      setDoneWorld(`Documento de construcción de mundo exportado (${characters.length} personajes, ${bookActs.length} actos, ${universeEntries.length} entradas de universo).`);
    } catch (err) {
      console.error(err);
      setDoneWorld("Ha ocurrido un error al exportar.");
    }
    setBusy(false);
  }

  return (
    <div style={{ maxWidth: 500 }}>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 17, marginBottom: 8 }}>Exportar "{book?.title}"</div>
      <div style={fieldLabel}>Capítulos a exportar</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 14 }}>{chapters.map((c: any) => <label key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}><input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggle(c.id)} /> {c.title}</label>)}</div>
      <div style={fieldLabel}>Formato</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}><button onClick={() => setFormat("word")} style={{ ...toggleBtn, ...(format === "word" ? toggleBtnActive : {}) }}>Word (.docx)</button><button onClick={() => setFormat("pdf")} style={{ ...toggleBtn, ...(format === "pdf" ? toggleBtnActive : {}) }}>PDF</button></div>
      <button onClick={handleExportSelection} disabled={busy} style={primaryBtn}><Download size={13} /> {busy ? "Exportando..." : "Exportar selección"}</button>
      <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)" }}><div style={fieldLabel}>Libro completo</div><button onClick={handleExportFullBook} disabled={busy} style={smallOutlineBtn}><Download size={12} /> Exportar libro completo a Word</button></div>
      {done && <div style={{ marginTop: 14, fontSize: 12.5, color: "#5FA98C" }}>{done}</div>}
      <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
        <div style={fieldLabel}>Construcción de mundo (worldbuilding)</div>
        <div style={{ fontSize: 12, color: "var(--dim)", marginBottom: 8 }}>Recopila personajes ({characters.length}), estructura/actos ({bookActs.length}) y entradas de universo ({universeEntries.length}) en un solo documento de referencia.</div>
        <button onClick={handleExportWorldbuilding} disabled={busy} style={smallOutlineBtn}><Download size={12} /> Exportar bloque narrativo completo</button>
        {doneWorld && <div style={{ marginTop: 10, fontSize: 12.5, color: "#5FA98C" }}>{doneWorld}</div>}
      </div>
    </div>
  );
}

const BETA_DISCLAIMER = "Este enlace es de un solo uso, una vez se cierre no se podrá volver a abrir y tus comentarios serán enviados. Solo puedes leer y comentar: no se puede editar, copiar ni seleccionar el contenido para evitar plagios. Espero que disfrutes la lectura ¡comenta todo lo que quieras! <3";

export function BetaReaderTab({ bookId, userId, chapters, setChapters, surveys, setSurveys }: any) {
  const [linkChapter, setLinkChapter] = useState(chapters[0]?.id || "");
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const activeChapter = chapters.find((c: any) => c.id === linkChapter);
  const chapterSurveys = surveys.filter((s: any) => s.chapterId === linkChapter);

  async function generateLink() {
    if (!activeChapter) return;
    setGenerating(true);
    setGeneratedUrl(null);
    const { data, error } = await supabase.from("beta_links").insert({
      owner_id: userId,
      book_id: bookId,
      chapter_id: activeChapter.id,
      chapter_title: activeChapter.title,
      chapter_content: activeChapter.content,
      chapter_font: activeChapter.font,
      chapter_justify: activeChapter.justify,
    }).select("id").single();
    setGenerating(false);
    if (error || !data) { alert("No se pudo generar el enlace. Inténtalo de nuevo."); return; }
    setGeneratedUrl(`${window.location.origin}/leer/${data.id}`);
  }

  function copyLink() {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  async function removeComment(commentId: string) {
    const { error } = await supabase.from("beta_comments").delete().eq("id", commentId).eq("owner_id", userId);
    if (error) {
      console.error("Error eliminando comentario beta:", error);
      alert("No se pudo eliminar el comentario. Comprueba tu conexión.");
      return;
    }
    setChapters((cs: any[]) => cs.map((c) => c.id === linkChapter ? { ...c, betaComments: (c.betaComments || []).filter((bc: any) => bc.id !== commentId) } : c));
  }

  const avgImportance = chapterSurveys.length ? chapterSurveys.reduce((s: number, x: any) => s + (x.importance || 0), 0) / chapterSurveys.filter((x: any) => x.importance).length : 0;
  const avgImpact = chapterSurveys.length ? chapterSurveys.reduce((s: number, x: any) => s + (x.impact || 0), 0) / chapterSurveys.filter((x: any) => x.impact).length : 0;

  return (
    <div style={{ maxWidth: 620 }}>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 17, marginBottom: 8 }}>Enviar capítulo a un beta lector</div>
      <div style={{ color: "var(--text)", fontSize: 13.5, marginBottom: 16 }}>Genera un enlace real de un solo uso. Envíaselo a quien quieras — no necesita cuenta. Podrá leer, comentar sobre fragmentos seleccionados y, al terminar, rellenar una encuesta opcional. En cuanto comente, te llegará aquí al instante.</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <select value={linkChapter} onChange={(e) => { setLinkChapter(e.target.value); setGeneratedUrl(null); }} style={selectInput}>{chapters.map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}</select>
        <button onClick={generateLink} disabled={generating} style={primaryBtn}>{generating ? "Generando..." : "Generar enlace"}</button>
      </div>
      {generatedUrl && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--accent)", wordBreak: "break-all" }}>{generatedUrl}</div>
          <button onClick={copyLink} style={smallOutlineBtn}>{copied ? "¡Copiado!" : "Copiar enlace"}</button>
        </div>
      )}
      <div style={fieldLabel}>Comentarios recibidos en "{activeChapter?.title}"</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, margin: "8px 0 14px" }}>
        {(activeChapter?.betaComments || []).map((c: any) => (
          <div key={c.id} style={{ background: "var(--bg2)", border: `1px solid ${colorForReader(c.reader)}55`, borderLeft: `3px solid ${colorForReader(c.reader)}`, borderRadius: 8, padding: 10, fontSize: 12.5 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: colorForReader(c.reader), fontWeight: 600 }}>{c.reader} ha comentado:</span>
              <button onClick={() => removeComment(c.id)} style={miniIconBtn}><X size={11} /></button>
            </div>
            {c.excerpt && <div style={{ color: "var(--dim)", fontStyle: "italic", margin: "3px 0" }}>"{c.excerpt}"</div>}
            <span style={{ color: "var(--text)" }}>{c.comment}</span>
          </div>
        ))}
        {(activeChapter?.betaComments || []).length === 0 && <div style={{ color: "var(--dim)", fontSize: 12 }}>Aún no hay comentarios.</div>}
      </div>
      {chapterSurveys.length > 0 && (
        <>
          <div style={fieldLabel}>Resumen de encuestas ({chapterSurveys.length})</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, margin: "8px 0 12px" }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--dim)", marginBottom: 3 }}>Importancia media: {avgImportance.toFixed(1)}/5</div>
              <div style={{ background: "var(--bg3)", borderRadius: 4, height: 8 }}><div style={{ width: `${(avgImportance / 5) * 100}%`, background: "var(--accent)", height: 8, borderRadius: 4 }} /></div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--dim)", marginBottom: 3 }}>Impacto medio: {avgImpact.toFixed(1)}/5</div>
              <div style={{ background: "var(--bg3)", borderRadius: 4, height: 8 }}><div style={{ width: `${(avgImpact / 5) * 100}%`, background: "#6E93C9", height: 8, borderRadius: 4 }} /></div>
            </div>
          </div>
          <div style={fieldLabel}>Opiniones</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "8px 0 14px" }}>
            {chapterSurveys.map((s: any) => (
              <div key={s.id} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: 10, fontSize: 12 }}>
                <b>{s.reader}</b> — Importancia: {s.importance || "-"}/5 · Impacto: {s.impact || "-"}/5
                {s.opinion && <div style={{ color: "var(--dim)", marginTop: 4 }}>{s.opinion}</div>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}