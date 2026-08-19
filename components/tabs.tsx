import { useState, useRef, useMemo, useEffect } from "react";
import { Link2, GitBranch, Users, Ruler, Quote, Search, Plus, GripVertical, Skull, X, Trash2, ZoomOut, ZoomIn, ImageIcon, Crown, Pencil, Star, ArrowLeft, Landmark, DoorOpen, ScrollText, PawPrint, PlusSquare, Download, Mail, Ban,} from "lucide-react";
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
    const nc = { id: uid(), sagaId, order: allSagaChars.length, name, nickname: "", customFamilyTag: "", photo: null, emblem: null, importance: "Secundario", lineageGroup: "", powerLevel: 3, natureType: "Humano", natureSubtype: "", natureSubtypeOther: "", natureEffect: "", isMilitary: false, militaryRank: "", isNoble: false, nobleTitle: "", isDead: false, deathBookId: "", deathNote: "", age: "", birthday: "", birthplace: "", civilStatus: "", title: "", occupation: "", physicalHeight: "", physicalDesc: "", role: "", motivation: "", virtues: "", defects: "", weakness: "", personality: "", itemsCarried: "", importantItems: "", hobbies: "", trivia: "", statusByBook: {}, roleByBook: {}, relationships: [] };
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

function FamilyTree({ characters, onSelect, highlight }: any) {
  const byId = Object.fromEntries(characters.map((c: any) => [c.id, c]));
  const parentsOf: any = {}, childrenOf: any = {};
  characters.forEach((c: any) => (c.relationships || []).forEach((r: any) => { if (r.type === "padre") (parentsOf[c.id] = parentsOf[c.id] || []).push(r.targetId); if (r.type === "hijo") (childrenOf[c.id] = childrenOf[c.id] || []).push(r.targetId); }));
  const siblingsOf: any = {};
  characters.forEach((c: any) => (c.relationships || []).forEach((r: any) => { if (r.type === "hermano") (siblingsOf[c.id] = siblingsOf[c.id] || new Set()).add(r.targetId); }));

  const units: any = {};
  Object.entries(childrenOf).forEach(([parentId, kids]: any) => kids.forEach((kid: string) => {
    const parents = (parentsOf[kid] || []).length ? parentsOf[kid] : [parentId];
    const key = [...parents].sort().join("+");
    if (!units[key]) units[key] = { parents, children: new Set() };
    units[key].children.add(kid);
  }));
  const allChildIds = new Set(Object.values(units).flatMap((u: any) => [...u.children]));
  const allParentIdsInUnits = new Set(Object.values(units).flatMap((u: any) => u.parents));
  const familyIds = new Set();
  characters.forEach((c: any) => (c.relationships || []).forEach((r: any) => { if (FAMILY_REL_KEYS.includes(r.type)) { familyIds.add(c.id); familyIds.add(r.targetId); } }));
  if (familyIds.size === 0) return <div style={{ color: "var(--dim)", fontSize: 12.5 }}>Marca relaciones de "Es su padre/madre", "Es su hijo/a" o "Es su hermano/a" en las fichas para ver el árbol familiar.</div>;

  const rootUnits: any[] = Object.values(units).filter((u: any) => !u.parents.some((p: string) => allChildIds.has(p)));
  const orphanFamily = [...familyIds].filter((id) => !allChildIds.has(id) && !allParentIdsInUnits.has(id));

  function PersonBox({ id }: any) {
    const c = byId[id]; if (!c) return null;
    return (
      <button onClick={() => onSelect(id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "var(--bg2)", border: `1px solid ${c.importance === "Principal" ? highlight : "var(--border)"}`, borderRadius: 10, padding: "8px 12px", cursor: "pointer", color: "var(--text)" }}>
        <span style={{ width: 30, height: 30, borderRadius: "50%", background: c.photo ? `url(${c.photo}) center/cover` : "var(--bg3)", display: "inline-block" }} />
        <span style={{ fontSize: 11.5 }}>{c.name}</span>
      </button>
    );
  }

  function renderUnit(unit: any, seen: Set<string>): any {
    const key = unit.parents.join("+");
    if (seen.has(key)) return null; seen.add(key);
    const kids = [...unit.children];
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>{unit.parents.map((p: string, i: number) => (<div key={p} style={{ display: "flex", alignItems: "center", gap: 6 }}>{i > 0 && <span style={{ color: "var(--dim)", fontSize: 16 }}>+</span>}<PersonBox id={p} /></div>))}</div>
        {kids.length > 0 && (
          <>
            <div style={{ width: 1, height: 16, background: "var(--border)" }} />
            <div style={{ display: "flex", gap: 22, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
              {kids.map((kid: string) => {
                const ownUnit: any = Object.values(units).find((u: any) => u.parents.includes(kid));
                return (<div key={kid} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>{ownUnit ? renderUnit(ownUnit, seen) : <PersonBox id={kid} />}</div>);
              })}
            </div>
          </>
        )}
      </div>
    );
  }
  const seen = new Set<string>();
  return (
    <div>
      <div style={{ display: "flex", gap: 40, flexWrap: "wrap", alignItems: "flex-start" }}>{rootUnits.map((u, i) => <div key={i}>{renderUnit(u, seen)}</div>)}</div>
      {orphanFamily.length > 0 && (<div style={{ marginTop: 24 }}><div style={fieldLabel}>Hermanos sin hijos registrados</div><div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 8 }}>{orphanFamily.map((id) => <PersonBox key={id as string} id={id} />)}</div></div>)}
    </div>
  );
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
  function onMove(e: any) { if (!dragRef.current) return; const { id, startX, startY, orig } = dragRef.current; setPositions({ ...positions, [id]: { x: orig.x + (e.clientX - startX) / zoom, y: orig.y + (e.clientY - startY) / zoom } }); }
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
        <Row2><Field label="Edad" value={character.age} onChange={(v: string) => onUpdate({ age: v })} /><Field label="Cumpleaños (MM-DD)" value={character.birthday} onChange={(v: string) => onUpdate({ birthday: v })} /></Row2>
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

export function AppearanceTab({ sagaId, books, chapters, characters, appearances, setAppearances }: any) {
  const sagaChapters = useMemo(() => chapters.filter((c: any) => books.some((b: any) => b.id === c.bookId)).sort((a: any, b: any) => { const ba = books.findIndex((x: any) => x.id === a.bookId), bb = books.findIndex((x: any) => x.id === b.bookId); return ba - bb || a.order - b.order; }), [chapters, books]);
  const sagaChars = characters.filter((c: any) => c.sagaId === sagaId);
  const sagaAppearances = appearances.filter((a: any) => a.sagaId === sagaId);
  function addAppearance(chapterId: string) {
    const name = prompt(`¿Qué personaje aparece por primera vez aquí?\n${sagaChars.map((c: any) => c.name).join(", ")}`);
    const character = sagaChars.find((c: any) => c.name === name); if (!character) return;
    const category = prompt(`Categoría (${Object.keys(APPEARANCE_CATEGORIES).join(", ")}):`, "cultura") || "cultura";
    setAppearances((a: any[]) => [...a, { id: uid(), sagaId, characterId: character.id, chapterId, category: (APPEARANCE_CATEGORIES as any)[category] ? category : "cultura" }]);
  }
  const colW = 90; const cats = Object.keys(APPEARANCE_CATEGORIES); const laneH = 58;
  return (
    <div>
      <div style={fieldLabel}>Primera aparición de personajes — la numeración se reinicia en cada libro; pueden aparecer varios en la misma casilla (desplaza a la derecha)</div>
      <div style={{ overflowX: "auto", marginTop: 10 }}>
        <div style={{ width: sagaChapters.length * colW + 70, minWidth: "100%" }}>
          <div style={{ display: "flex", marginLeft: 70 }}>
            {books.map((book: any) => { const bookChs = sagaChapters.filter((c: any) => c.bookId === book.id); if (bookChs.length === 0) return null; return <div key={book.id} style={{ width: bookChs.length * colW, background: book.color + "33", borderBottom: `2px solid ${book.color}`, textAlign: "center", padding: "3px 0", fontSize: 10.5, color: "var(--text)", fontWeight: 600, flexShrink: 0 }}>{book.title}</div>; })}
          </div>
          <div style={{ display: "flex", marginLeft: 70, marginTop: 4 }}>
            {books.map((book: any) => sagaChapters.filter((c: any) => c.bookId === book.id).map((c: any, i: number) => (
              <div key={c.id} onClick={() => addAppearance(c.id)} style={{ width: colW, flexShrink: 0, cursor: "pointer", padding: "4px 4px", borderLeft: "1px solid var(--border)", textAlign: "center" }} title={`${book.title} · ${c.title}`}>
                <div style={{ fontSize: 12, color: "var(--text)", fontFamily: "'JetBrains Mono', monospace" }}>#{i + 1}</div>
              </div>
            )))}
          </div>
          {cats.map((cat) => (
            <div key={cat} style={{ display: "flex", alignItems: "center", height: laneH, borderTop: "1px solid var(--border)" }}>
              <div style={{ width: 70, fontSize: 9.5, color: (APPEARANCE_CATEGORIES as any)[cat].color, flexShrink: 0 }}>{(APPEARANCE_CATEGORIES as any)[cat].label}</div>
              {sagaChapters.map((c: any) => {
                const apps = sagaAppearances.filter((a: any) => a.chapterId === c.id && a.category === cat);
                return (
                  <div key={c.id} style={{ width: colW, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
                    {apps.map((app: any) => {
                      const char = sagaChars.find((x: any) => x.id === app.characterId); if (!char) return null;
                      return (<div key={app.id} style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={{ width: 14, height: 14, borderRadius: 4, transform: "rotate(45deg)", background: char.photo ? `url(${char.photo}) center/cover` : "var(--bg3)", border: "1px solid var(--border)", flexShrink: 0 }} /><span style={{ fontSize: 9.5, color: "var(--text)", whiteSpace: "nowrap" }}>{char.name.split(" ")[0]}</span></div>);
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
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
  const places = universeEntries.filter((u: any) => u.sagaId === sagaId && u.category === "Lugares");
  const sagaChapters = useMemo(() => chapters.filter((c: any) => books.some((b: any) => b.id === c.bookId)).sort((a: any, b: any) => { const ba = books.findIndex((x: any) => x.id === a.bookId), bb = books.findIndex((x: any) => x.id === b.bookId); return ba - bb || a.order - b.order; }), [chapters, books]);
  const [chapterId, setChapterId] = useState(sagaChapters[0]?.id || "");
  const [addPlaceId, setAddPlaceId] = useState(""); const [addCharId, setAddCharId] = useState("");
  const [editingBorderId, setEditingBorderId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [focusPlaceId, setFocusPlaceId] = useState<string | null>(null);
  const [drillId, setDrillId] = useState<string | null>(null);
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
    setUniverseEntries((u: any[]) => [...u, { id: uid(), sagaId, category: "Lugares", title: name, content: "", tags: [], parentId, localX: 30 + Math.random() * 40, localY: 30 + Math.random() * 40, posNS: 0, posEW: 0, nearRiver: false, nearSea: false, nearMountain: false, nearLake: false, nearVolcano: false, nearCamp: false, isSupernatural: false, isCapital: false, isImportantCourt: false, isIsland: false, kingdomName: "" }]);
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

  function addBorder() { const name = prompt("Nombre de esta frontera/reino:", "Nuevo reino"); if (!name) return; const color = COLOR_PRESETS[borders.length % COLOR_PRESETS.length]; const nb = { id: uid(), name, color, points: [] }; setBorders([...borders, nb]); setEditingBorderId(nb.id); }
  function handleCanvasClick(e: any) { if (!editingBorderId) return; const rect = e.currentTarget.getBoundingClientRect(); const x = ((e.clientX - rect.left) / rect.width) * 100; const y = ((e.clientY - rect.top) / rect.height) * 100; setBorders(borders.map((b: any) => (b.id === editingBorderId ? { ...b, points: [...b.points, [x, y]] } : b))); }
  function removeBorder(id: string) { setBorders(borders.filter((b: any) => b.id !== id)); if (editingBorderId === id) setEditingBorderId(null); }
  const editingBorder = borders.find((b: any) => b.id === editingBorderId);

  const focusPos = focusPlaceId ? posFor(places.find((p: any) => p.id === focusPlaceId) || {}) : null;
  const vbSize = size / zoom;
  const vbX = focusPos ? Math.max(0, Math.min(size - vbSize, focusPos.x - vbSize / 2)) : 0;
  const vbY = focusPos ? Math.max(0, Math.min(size - vbSize, focusPos.y - vbSize / 2)) : 0;

  return (
    <div>
      <div style={fieldLabel}>Dónde está cada personaje, capítulo a capítulo</div>
      <div style={{ display: "flex", gap: 8, margin: "8px 0 10px", alignItems: "center", flexWrap: "wrap" }}>
        <select value={chapterId} onChange={(e) => setChapterId(e.target.value)} style={selectInput}>{sagaChapters.map((c: any, i: number) => <option key={c.id} value={c.id}>Cap. {i + 1}: {c.title}</option>)}</select>
        <span style={{ fontSize: 10.5, color: "var(--dim)" }}>(se copia automáticamente del capítulo anterior si está vacío)</span>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center", flexWrap: "wrap" }}>
        {borders.map((b: any) => (
          <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 4, background: "var(--bg2)", border: `1px solid ${b.color}`, borderRadius: 6, padding: "3px 8px", fontSize: 11 }}>
            <span style={{ color: b.color }}>{b.name}</span>
            <button onClick={() => setEditingBorderId(editingBorderId === b.id ? null : b.id)} style={miniIconBtn}><Pencil size={10} /></button>
            <button onClick={() => removeBorder(b.id)} style={miniIconBtn}><X size={10} /></button>
          </div>
        ))}
        <button onClick={addBorder} style={smallOutlineBtn}>+ Nueva frontera</button>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: "auto" }}><button onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))} style={iconBtn}><ZoomOut size={13} /></button><span style={{ fontSize: 11, color: "var(--dim)", width: 34, textAlign: "center" }}>{Math.round(zoom * 100)}%</span><button onClick={() => setZoom((z) => Math.min(4, z + 0.25))} style={iconBtn}><ZoomIn size={13} /></button></div>
      </div>
      {editingBorderId && <div style={{ fontSize: 11, color: "var(--accent)", marginBottom: 8 }}>Editando "{editingBorder?.name}": haz click en el mapa para añadir puntos de esta frontera, en orden.</div>}
      {drillId && <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><button onClick={() => setDrillId(null)} style={smallOutlineBtn}><ArrowLeft size={12} /> Volver al mapa general</button><span style={{ fontSize: 12, color: "var(--dim)" }}>Dentro de: <b style={{ color: "var(--text)" }}>{drillPlace?.title}</b></span></div>}

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <div style={{ overflow: "auto", maxWidth: "100%", maxHeight: 560, border: "1px solid var(--border)", borderRadius: 10 }}>
          <svg width={size * zoom} height={size * zoom} viewBox={focusPlaceId ? `${vbX} ${vbY} ${vbSize} ${vbSize}` : `0 0 ${size} ${size}`} onClick={handleCanvasClick} style={{ background: "var(--bg2)", cursor: editingBorderId ? "crosshair" : "default", display: "block" }}>
            {!drillId && borders.map((b: any) => b.points.length >= 3 && <polygon key={b.id} points={b.points.map(([px, py]: any) => `${px / 100 * size},${py / 100 * size}`).join(" ")} fill={b.color} fillOpacity={0.06} stroke={b.color} strokeWidth={1.4} strokeDasharray="5 3" />)}
            {!drillId && editingBorder && editingBorder.points.length > 0 && editingBorder.points.length < 3 && editingBorder.points.map(([px, py]: any, i: number) => <circle key={i} cx={px / 100 * size} cy={py / 100 * size} r={4} fill={editingBorder.color} />)}
            {levelPlaces.map((p: any) => {
              const { x, y } = posFor(p);
              const outside = !drillId && borders.length > 0 ? !borders.some((b: any) => b.points.length >= 3 && pointInPolygon([x, y], b.points.map(([px, py]: any) => [px / 100 * size, py / 100 * size]))) : false;
              const here = charsAtDisplay(p);
              const hasChildren = places.some((x2: any) => x2.parentId === p.id);
              const r = drillId ? 22 : 20;
              return (
                <g key={p.id}>
                  {p.isIsland && <circle cx={x} cy={y} r={r + 10} fill="#4FB8C955" />}
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
          {places.length === 0 && <div style={{ color: "var(--dim)", fontSize: 11.5, marginTop: 10 }}>Añade lugares en la pestaña Universo (o aquí mismo) para que aparezcan en el mapa.</div>}
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
                <input type="range" min={-20} max={20} value={e.posNS ?? 0} onChange={(ev) => updateEntry(e.id, { posNS: Number(ev.target.value) })} style={{ flex: 1 }} />
                <span style={{ fontSize: 10, width: 24, color: "var(--accent)" }}>{Math.abs(e.posNS ?? 0)}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <span style={{ fontSize: 10, width: 70, color: "var(--dim)" }}>{e.posEW >= 0 ? "Este" : "Oeste"}</span>
                <input type="range" min={-20} max={20} value={e.posEW ?? 0} onChange={(ev) => updateEntry(e.id, { posEW: Number(ev.target.value) })} style={{ flex: 1 }} />
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
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{[["nearRiver","Río"],["nearSea","Mar"],["nearMountain","Montaña"],["nearLake","Lago"],["nearVolcano","Volcán"],["nearCamp","Campamento militar"],["isIsland","Isla"],["isSupernatural","Sobrenatural"],["isCapital","Capital"],["isImportantCourt","Corte importante"]].map(([key, label]) => (<label key={key} style={{ fontSize: 10, display: "flex", alignItems: "center", gap: 3 }}><input type="checkbox" checked={!!e[key]} onChange={(ev) => updateEntry(e.id, { [key]: ev.target.checked })} /> {label}</label>))}</div>
          <button onClick={() => addSublevel(e.id)} style={{ ...smallOutlineBtn, marginTop: 8, fontSize: 10.5 }}><DoorOpen size={11} /> + Sub-sitio / sala aquí</button>
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
  const dragRef = useRef<any>(null);
  const [zoom, setZoom] = useState(1);
  const maxZ = useRef(notes.reduce((m: number, n: any) => Math.max(m, n.z || 1), 1));
  function addNote() { const color = CORK_COLORS[hash(uid()) % CORK_COLORS.length]; maxZ.current += 1; setCorkNotes((c: any) => ({ ...c, [bookId]: [...(c[bookId] || []), { id: uid(), text: "", color, x: 20 + ((c[bookId]?.length || 0) * 24) % 300, y: 20 + ((c[bookId]?.length || 0) * 18) % 200, shape: "rect", size: "M", z: maxZ.current }] })); }
  function updateNote(id: string, patch: any) { setCorkNotes((c: any) => ({ ...c, [bookId]: (c[bookId] || []).map((n: any) => (n.id === id ? { ...n, ...patch } : n)) })); }
  function removeNote(id: string) { setCorkNotes((c: any) => ({ ...c, [bookId]: (c[bookId] || []).filter((n: any) => n.id !== id) })); }
  function bringToFront(id: string) { maxZ.current += 1; updateNote(id, { z: maxZ.current }); }
  function onPointerDown(e: any, id: string) { bringToFront(id); const note = notes.find((n: any) => n.id === id); dragRef.current = { id, startX: e.clientX, startY: e.clientY, origX: note.x, origY: note.y }; window.addEventListener("pointermove", onPointerMove); window.addEventListener("pointerup", onPointerUp); }
  function onPointerMove(e: any) { if (!dragRef.current) return; const { id, startX, startY, origX, origY } = dragRef.current; updateNote(id, { x: Math.max(0, origX + (e.clientX - startX) / zoom), y: Math.max(0, origY + (e.clientY - startY) / zoom) }); }
  function onPointerUp() { dragRef.current = null; window.removeEventListener("pointermove", onPointerMove); window.removeEventListener("pointerup", onPointerUp); }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={fieldLabel}>Pizarra de notas — arrastra los post-it por el corcho</div>
        <div style={{ display: "flex", gap: 8 }}><button onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))} style={iconBtn}><ZoomOut size={13} /></button><button onClick={() => setZoom((z) => Math.min(2, z + 0.2))} style={iconBtn}><ZoomIn size={13} /></button><button onClick={addNote} style={primaryBtn}><PlusSquare size={13} /> Nueva nota</button></div>
      </div>
      <div style={{ overflow: "auto", maxHeight: 560, border: "1px solid var(--border)", borderRadius: 10 }}>
        <div style={{ position: "relative", minHeight: 420, width: `${100 / zoom}%`, transform: `scale(${zoom})`, transformOrigin: "top left", background: "repeating-linear-gradient(45deg, var(--bg3), var(--bg3) 10px, var(--bg2) 10px, var(--bg2) 20px)" }}>
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
  const toggle = (id: string) => setSelected((s: string[]) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  return (
    <div style={{ maxWidth: 500 }}>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 17, marginBottom: 8 }}>Exportar "{book?.title}"</div>
      <div style={fieldLabel}>Capítulos a exportar</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 14 }}>{chapters.map((c: any) => <label key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}><input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggle(c.id)} /> {c.title}</label>)}</div>
      <div style={fieldLabel}>Formato</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}><button onClick={() => setFormat("word")} style={{ ...toggleBtn, ...(format === "word" ? toggleBtnActive : {}) }}>Word (.docx)</button><button onClick={() => setFormat("pdf")} style={{ ...toggleBtn, ...(format === "pdf" ? toggleBtnActive : {}) }}>PDF</button></div>
      <button onClick={() => setDone(`${selected.length} capítulo(s) exportados a ${format === "word" ? "Word" : "PDF"}.`)} style={primaryBtn}><Download size={13} /> Exportar selección</button>
      <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)" }}><div style={fieldLabel}>Libro completo</div><button onClick={() => setDone(`Libro completo exportado a EPUB.`)} style={smallOutlineBtn}><Download size={12} /> Exportar todo a EPUB</button></div>
      {done && <div style={{ marginTop: 14, fontSize: 12.5, color: "#5FA98C" }}>{done} — simulado en este prototipo, en la app real descargaría el archivo.</div>}
      <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
        <div style={fieldLabel}>Construcción de mundo (worldbuilding)</div>
        <div style={{ fontSize: 12, color: "var(--dim)", marginBottom: 8 }}>Recopila personajes ({characters.length}), estructura/actos ({bookActs.length}) y entradas de universo ({universeEntries.length}) en un solo documento de referencia.</div>
        <button onClick={() => setDoneWorld(`Documento de construcción de mundo exportado (${characters.length} personajes, ${bookActs.length} actos, ${universeEntries.length} entradas de universo).`)} style={smallOutlineBtn}><Download size={12} /> Exportar bloque narrativo completo</button>
        {doneWorld && <div style={{ marginTop: 10, fontSize: 12.5, color: "#5FA98C" }}>{doneWorld} — simulado en este prototipo.</div>}
      </div>
    </div>
  );
}

const BETA_DISCLAIMER = "Este enlace es de un solo uso, una vez se cierre no se podrá volver a abrir y tus comentarios serán enviados. Solo puedes leer y comentar: no se puede editar, copiar ni seleccionar el contenido para evitar plagios. Espero que disfrutes la lectura ¡comenta todo lo que quieras! <3";

export function BetaReaderTab({ chapters, setChapters, surveys, setSurveys }: any) {
  const [linkChapter, setLinkChapter] = useState(chapters[0]?.id || "");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [simComment, setSimComment] = useState(""); const [simExcerpt, setSimExcerpt] = useState("");
  const [readerProfile, setReaderProfile] = useState<any>(null);
  const [showRegister, setShowRegister] = useState(false); const [showDisclaimer, setShowDisclaimer] = useState(false); const [showSurvey, setShowSurvey] = useState(false);
  const [regDraft, setRegDraft] = useState({ name: "", email: "", color: READER_COLORS[0] });
  const [surveyDraft, setSurveyDraft] = useState({ importance: 0, impact: 0, opinion: "" });
  function generate() { setGeneratedLink(`https://atelier.app/leer/${uid()}`); }
  function openReaderLink() { setShowDisclaimer(true); }
  function beginReading() { setShowDisclaimer(false); if (!readerProfile) setShowRegister(true); }
  function completeRegister() { if (!regDraft.name || !regDraft.email) return; setReaderProfile(regDraft); setShowRegister(false); }
  function addSimComment() { if (!simComment || !simExcerpt.trim() || !readerProfile) return; setChapters((cs: any[]) => cs.map((c) => c.id === linkChapter ? { ...c, betaComments: [...(c.betaComments || []), { id: uid(), reader: readerProfile.name, comment: simComment, excerpt: simExcerpt, notified: false }] } : c)); setSimComment(""); setSimExcerpt(""); }
  function submitSurvey() { setSurveys((s: any[]) => [...s, { id: uid(), chapterId: linkChapter, reader: readerProfile?.name || "Anónimo", ...surveyDraft }]); setSurveyDraft({ importance: 0, impact: 0, opinion: "" }); setShowSurvey(false); }
  const activeChapter = chapters.find((c: any) => c.id === linkChapter);
  const chapterSurveys = surveys.filter((s: any) => s.chapterId === linkChapter);

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 17, marginBottom: 8 }}>Enviar capítulo a un beta lector</div>
      <div style={{ color: "var(--text)", fontSize: 13.5, marginBottom: 16 }}>Genera un enlace de un solo uso. El lector se registra con su correo, elige un color para sus comentarios la primera vez, y solo puede leer y comentar — no puede editar ni copiar el texto. Cada comentario debe indicar el fragmento exacto al que se refiere. Al final puede rellenar, si quiere, un cuestionario opcional.</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}><select value={linkChapter} onChange={(e) => setLinkChapter(e.target.value)} style={selectInput}>{chapters.map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}</select><button onClick={generate} style={primaryBtn}>Generar enlace</button></div>
      {generatedLink && (<div style={{ marginBottom: 16 }}><div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--accent)" }}>{generatedLink} <span style={{ color: "var(--dim)" }}>(un solo uso — simulado)</span></div><button onClick={openReaderLink} style={{ ...smallOutlineBtn, marginTop: 8 }}><Mail size={12} /> Simular apertura del enlace (vista del lector)</button></div>)}
      <div style={fieldLabel}>Comentarios recibidos en "{activeChapter?.title}"</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, margin: "8px 0 14px" }}>
        {(activeChapter?.betaComments || []).map((c: any) => <div key={c.id} style={{ background: "var(--bg2)", border: `1px solid ${colorForReader(c.reader)}55`, borderLeft: `3px solid ${colorForReader(c.reader)}`, borderRadius: 8, padding: 10, fontSize: 12.5 }}><span style={{ color: colorForReader(c.reader), fontWeight: 600 }}>{c.reader} ha comentado:</span>{c.excerpt && <div style={{ color: "var(--dim)", fontStyle: "italic", margin: "3px 0" }}>"{c.excerpt}"</div>} <span style={{ color: "var(--text)" }}>{c.comment}</span></div>)}
        {(activeChapter?.betaComments || []).length === 0 && <div style={{ color: "var(--dim)", fontSize: 12 }}>Aún no hay comentarios.</div>}
      </div>
      {chapterSurveys.length > 0 && (
        <>
          <div style={fieldLabel}>Cuestionarios recibidos</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "8px 0 14px" }}>{chapterSurveys.map((s: any) => <div key={s.id} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: 10, fontSize: 12 }}><b>{s.reader}</b> — Importancia: {s.importance || "-"}/5 · Impacto: {s.impact || "-"}/5{s.opinion && <div style={{ color: "var(--dim)", marginTop: 4 }}>{s.opinion}</div>}</div>)}</div>
        </>
      )}
      {readerProfile && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "var(--dim)" }}>Comentando como <span style={{ color: readerProfile.color, fontWeight: 600 }}>{readerProfile.name}</span>:</span>
          <input value={simExcerpt} onChange={(e) => setSimExcerpt(e.target.value)} placeholder="Fragmento exacto al que te refieres (obligatorio)" style={{ ...textInput, width: 220 }} />
          <input value={simComment} onChange={(e) => setSimComment(e.target.value)} placeholder="Comentario..." style={{ ...textInput, flex: 1, minWidth: 140 }} />
          <button onClick={addSimComment} style={smallOutlineBtn}>Enviar</button>
          <button onClick={() => setShowSurvey(true)} style={smallOutlineBtn}>Rellenar cuestionario (opcional)</button>
        </div>
      )}
      {showDisclaimer && (<Modal onClose={() => setShowDisclaimer(false)}><div style={{ width: 340, textAlign: "center" }}><Ban size={26} color="var(--accent)" style={{ marginBottom: 10 }} /><div style={{ fontFamily: "'Fraunces', serif", fontSize: 17, marginBottom: 10 }}>Antes de empezar a leer</div><div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6, marginBottom: 18 }}>{BETA_DISCLAIMER}</div><button onClick={beginReading} style={primaryBtn}>Entendido, empezar a leer</button></div></Modal>)}
      {showRegister && (
        <Modal onClose={() => setShowRegister(false)}>
          <div style={{ width: 320 }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 17, marginBottom: 10 }}>Regístrate para comentar</div>
            <Field label="Tu nombre" value={regDraft.name} onChange={(v: string) => setRegDraft((d) => ({ ...d, name: v }))} />
            <Field label="Correo electrónico" value={regDraft.email} onChange={(v: string) => setRegDraft((d) => ({ ...d, email: v }))} />
            <div style={fieldLabel}>Color para tus comentarios</div>
            <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>{READER_COLORS.map((c) => <button key={c} onClick={() => setRegDraft((d) => ({ ...d, color: c }))} style={{ width: 22, height: 22, borderRadius: "50%", background: c, border: regDraft.color === c ? "2px solid var(--text)" : "1px solid var(--border)", cursor: "pointer" }} />)}</div>
            <button onClick={completeRegister} style={primaryBtn}>Empezar a leer y comentar</button>
          </div>
        </Modal>
      )}
      {showSurvey && (
        <Modal onClose={() => setShowSurvey(false)}>
          <div style={{ width: 340 }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 17, marginBottom: 6 }}>Cuestionario del capítulo</div>
            <div style={{ fontSize: 11.5, color: "var(--dim)", marginBottom: 14 }}>Totalmente opcional — solo si te apetece.</div>
            <div style={{ marginBottom: 12 }}><div style={fieldLabel}>¿Cuánto importa este capítulo en la historia? (1-5)</div><div style={{ display: "flex", gap: 6 }}>{[1, 2, 3, 4, 5].map((n) => <button key={n} onClick={() => setSurveyDraft((d) => ({ ...d, importance: n }))} style={{ ...toggleBtn, ...(surveyDraft.importance === n ? toggleBtnActive : {}) }}>{n}</button>)}</div></div>
            <div style={{ marginBottom: 12 }}><div style={fieldLabel}>Nivel de impacto (1-5)</div><div style={{ display: "flex", gap: 6 }}>{[1, 2, 3, 4, 5].map((n) => <button key={n} onClick={() => setSurveyDraft((d) => ({ ...d, impact: n }))} style={{ ...toggleBtn, ...(surveyDraft.impact === n ? toggleBtnActive : {}) }}>{n}</button>)}</div></div>
            <textarea value={surveyDraft.opinion} onChange={(e) => setSurveyDraft((d) => ({ ...d, opinion: e.target.value }))} rows={3} placeholder="Desarrolla tu opinión (opcional)" style={textArea} />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}><button onClick={() => setShowSurvey(false)} style={smallOutlineBtn}>Omitir</button><button onClick={submitSurvey} style={primaryBtn}>Enviar</button></div>
          </div>
        </Modal>
      )}
      {readerProfile && activeChapter && (
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
          <div style={fieldLabel}>Vista previa del lector (puedes seleccionar texto para comentar, pero no copiarlo)</div>
          <div onCopy={(e) => e.preventDefault()} onContextMenu={(e) => e.preventDefault()} dangerouslySetInnerHTML={{ __html: activeChapter.content }} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: 16, fontFamily: `'${activeChapter.font}', serif`, fontSize: 14.5, lineHeight: 1.7, marginTop: 8 }} />
        </div>
      )}
    </div>
  );
}