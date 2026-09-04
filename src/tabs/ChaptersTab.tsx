import { useState, useRef, useEffect, useMemo } from "react";
import { Plus, BookMarked, Pencil, X } from "lucide-react";
import { Modal } from "../modals";
import { BookEditor } from "../components/BookEditor";
import { EditorErrorBoundary } from "../components/EditorErrorBoundary";
import { primaryBtn, smallOutlineBtn, iconBtn } from "../styles";
import { uid, hash, wordCount, actForOrder } from "../utils";
import { NOTE_COLORS } from "../constants";

// Clave de la copia de seguridad TEMPORAL de un capítulo en localStorage.
// Solo existe mientras hay cambios que aún no se han confirmado como
// guardados en Supabase; en cuanto App.tsx confirma el guardado en la nube,
// se borra automáticamente (ver el listener de "atelier:cloud-saved" abajo).
const DRAFT_PREFIX = "atelier:draft:";
function draftKey(bookId: string, chapterId: string) {
  return `${DRAFT_PREFIX}${bookId}:${chapterId}`;
}
function readDraft(bookId: string, chapterId: string) {
  try {
    return localStorage.getItem(draftKey(bookId, chapterId));
  } catch {
    return null;
  }
}
function writeDraft(bookId: string, chapterId: string, html: string) {
  try {
    localStorage.setItem(draftKey(bookId, chapterId), html);
  } catch {
    // Si localStorage no está disponible (modo privado, cuota llena, etc.)
    // simplemente no hay red de seguridad extra, pero la app sigue
    // funcionando con normalidad.
  }
}
function clearDraft(bookId: string, chapterId: string) {
  try {
    localStorage.removeItem(draftKey(bookId, chapterId));
  } catch {}
}

export function ChaptersTab({ bookId, chapters, setChapters, bookActs, setBookActs, isMobile }: any) {
  const bookChapters = useMemo(() => chapters.filter((c: any) => c.bookId === bookId).sort((a: any, b: any) => a.order - b.order), [chapters, bookId]);
  const [activeId, setActiveId] = useState(bookChapters[0]?.id ?? null);
  const [showNotes, setShowNotes] = useState(!isMobile);
  const [dirty, setDirty] = useState(false);
  const [pendingSwitch, setPendingSwitch] = useState<string | null>(null);
  const [showManuscript, setShowManuscript] = useState(false);
  const [wc, setWc] = useState(0);
  const [showNoteForm, setShowNoteForm] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState({ theme: "Continuidad", excerpt: "", comment: "", markId: null as string | null });
  const [savedFlash, setSavedFlash] = useState(false);
  const [editorInstance, setEditorInstance] = useState(0); // fuerza remount tras un crash
  const editorRef = useRef<HTMLDivElement>(null);
  const autosaveTimer = useRef<any>(null);
  const draftTimer = useRef<any>(null);
  const history = useRef<string[]>([]);

  useEffect(() => { if (!bookChapters.find((c: any) => c.id === activeId)) setActiveId(bookChapters[0]?.id ?? null); }, [bookId]); // eslint-disable-line
  const active = bookChapters.find((c: any) => c.id === activeId);

  // Al cambiar de capítulo: comprobamos si hay una copia de seguridad local
  // más reciente que lo que hay guardado (por ejemplo, tras un cierre
  // inesperado antes de que el autoguardado en la nube se confirmara).
  useEffect(() => {
    if (editorRef.current && active) {
      const backup = readDraft(bookId, active.id);
      if (backup && backup !== active.content) {
        const recover = window.confirm(
          "Se ha encontrado una versión de este capítulo escrita pero no confirmada como guardada (probablemente por un cierre inesperado). ¿Quieres recuperarla?"
        );
        if (recover) {
          editorRef.current.innerHTML = backup;
          setChapters((cs: any[]) => cs.map((c) => (c.id === active.id ? { ...c, content: backup } : c)));
        } else {
          editorRef.current.innerHTML = active.content;
          clearDraft(bookId, active.id);
        }
      } else {
        editorRef.current.innerHTML = active.content;
      }
      setWc(wordCount(editorRef.current.innerHTML));
    }
    setDirty(false); history.current = [];
  }, [activeId]); // eslint-disable-line

  // En cuanto App.tsx confirma que ha guardado correctamente en Supabase,
  // borramos las copias locales de este libro: ya no hacen falta.
  useEffect(() => {
    function handleCloudSaved() {
      bookChapters.forEach((c: any) => clearDraft(bookId, c.id));
    }
    window.addEventListener("atelier:cloud-saved", handleCloudSaved);
    return () => window.removeEventListener("atelier:cloud-saved", handleCloudSaved);
  }, [bookChapters, bookId]);

  const povColor = (pov: string) => ["#6E93C9", "#C9A24B", "#C06E97", "#5FA98C", "#C1594A", "#7A5EA8"][hash(pov) % 6];

  function addChapter() {
    const title = prompt("Título del capítulo:") || `Capítulo ${bookChapters.length + 1}`;
    const nc = { id: uid(), bookId, title, pov: "", brief: "", tension: 2, order: bookChapters.length, content: "", dropCap: true, justify: true, indent: true, font: "Fraunces", readOnly: false, notes: [], betaComments: [] };
    setChapters((cs: any[]) => [...cs, nc]);
    requestSwitch(nc.id, true);
  }
  function deleteChapter() {
    if (!active) return;
    if (!confirm(`¿Eliminar el capítulo "${active.title}"? Esta acción no se puede deshacer.`)) return;
    clearDraft(bookId, active.id);
    setChapters((cs: any[]) => cs.filter((c) => c.id !== active.id));
    setActiveId(bookChapters.find((c: any) => c.id !== active.id)?.id ?? null);
  }
  function updateActive(patch: any) { setChapters((cs: any[]) => cs.map((c) => (c.id === activeId ? { ...c, ...patch } : c))); }
  function pushHistory() { if (editorRef.current) history.current = [editorRef.current.innerHTML, ...history.current].slice(0, 3); }
  function undo() {
    if (history.current.length === 0) return;
    const [prev, ...rest] = history.current;
    if (editorRef.current) editorRef.current.innerHTML = prev;
    history.current = rest;
    handleInput(false);
  }
  function saveContent() {
    if (editorRef.current) updateActive({ content: editorRef.current.innerHTML });
    setDirty(false); setSavedFlash(true);
    clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => setSavedFlash(false), 1400);
  }
  function requestSwitch(id: string, skip?: boolean) {
    if (dirty && !skip) { setPendingSwitch(id); return; }
    saveContent(); setActiveId(id);
  }
  function confirmSave() { saveContent(); setActiveId(pendingSwitch); setPendingSwitch(null); }
  function confirmDiscard() { setActiveId(pendingSwitch); setPendingSwitch(null); }
  function move(dir: number) {
    const idx = bookChapters.findIndex((c: any) => c.id === activeId);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= bookChapters.length) return;
    const a = bookChapters[idx], b = bookChapters[swapIdx];
    setChapters((cs: any[]) => cs.map((c) => c.id === a.id ? { ...c, order: b.order } : c.id === b.id ? { ...c, order: a.order } : c));
  }
  function exec(cmd: string, val?: string) { pushHistory(); document.execCommand(cmd, false, val); editorRef.current?.focus(); handleInput(false); }
  function handleInput(recordHistory = true) {
    if (recordHistory) pushHistory();
    setDirty(true);
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setWc(wordCount(html));
      // Copia de seguridad temporal: barata, casi instantánea, y se borra
      // en cuanto se confirma el guardado real en Supabase.
      clearTimeout(draftTimer.current);
      draftTimer.current = setTimeout(() => writeDraft(bookId, activeId!, html), 300);
    }
    clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => saveContent(), 900);
  }

  function openNoteForm() {
    const sel = window.getSelection();
    const text = sel && sel.toString();
    if (!text || !text.trim()) { alert("Primero selecciona el fragmento de texto sobre el que quieres dejar la nota."); return; }
    const markId = uid();
    document.execCommand("insertHTML", false, `<mark data-note="${markId}" style="background:${NOTE_COLORS["Continuidad"]}33;border-bottom:2px solid ${NOTE_COLORS["Continuidad"]};color:inherit;border-radius:2px;padding:0 1px">${text}</mark>`);
    handleInput(true); saveContent();
    setNoteDraft({ theme: "Continuidad", excerpt: text, comment: "", markId });
    setShowNoteForm("new");
  }
  function openEditNote(n: any) { setNoteDraft({ theme: n.theme, excerpt: n.excerpt, comment: n.comment, markId: n.markId }); setShowNoteForm(n.id); }
  function submitNote() {
    if (!noteDraft.comment.trim()) return;
    const color = (NOTE_COLORS as any)[noteDraft.theme] || "#888";
    if (noteDraft.markId && editorRef.current) {
      editorRef.current.innerHTML = editorRef.current.innerHTML.replace(new RegExp(`(<mark data-note="${noteDraft.markId}"[^>]*>)`), `<mark data-note="${noteDraft.markId}" style="background:${color}33;border-bottom:2px solid ${color};color:inherit;border-radius:2px;padding:0 1px">`);
      saveContent();
    }
    if (showNoteForm === "new") updateActive({ notes: [...(active.notes || []), { id: uid(), theme: noteDraft.theme, color, excerpt: noteDraft.excerpt, comment: noteDraft.comment, markId: noteDraft.markId }] });
    else updateActive({ notes: active.notes.map((n: any) => (n.id === showNoteForm ? { ...n, theme: noteDraft.theme, color, comment: noteDraft.comment } : n)) });
    setShowNoteForm(null);
  }
  function removeNote(id: string) {
    const note = active.notes.find((n: any) => n.id === id);
    if (note?.markId && editorRef.current) {
      editorRef.current.innerHTML = editorRef.current.innerHTML.replace(new RegExp(`<mark data-note="${note.markId}"[^>]*>(.*?)</mark>`), "$1");
      saveContent();
    }
    updateActive({ notes: active.notes.filter((n: any) => n.id !== id) });
  }
  function renameAct(actId: string) {
    const act = bookActs.find((a: any) => a.id === actId);
    const name = prompt("Nuevo nombre del acto:", act?.name);
    if (!name) return;
    setBookActs((all: any) => ({ ...all, [bookId]: (all[bookId] || []).map((a: any) => (a.id === actId ? { ...a, name } : a)) }));
  }

  const combinedMarks = active ? [
    ...(active.notes || []).map((n: any) => ({ ...n, kind: "note", pos: n.excerpt && active.content ? active.content.indexOf(n.excerpt) : -1 })),
    ...(active.betaComments || []).map((c: any) => ({ ...c, kind: "beta", pos: c.excerpt && active.content ? active.content.indexOf(c.excerpt) : -1 })),
  ].sort((a, b) => (a.pos === -1 ? 1e9 : a.pos) - (b.pos === -1 ? 1e9 : b.pos)) : [];

  return (
    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 20, height: "100%" }}>
      <div style={{ width: isMobile ? "100%" : 220, flexShrink: 0, display: "flex", flexDirection: "column" }}>
        <button onClick={addChapter} style={primaryBtn}><Plus size={13} /> Nuevo capítulo</button>
        <button onClick={() => setShowManuscript(true)} style={{ ...smallOutlineBtn, width: "100%", justifyContent: "center", marginTop: 8 }}><BookMarked size={12} /> Ver manuscrito completo</button>
        <div style={{ marginTop: 10, display: "flex", flexDirection: isMobile ? "row" : "column", gap: 3, overflowX: isMobile ? "auto" : "visible", overflowY: isMobile ? "visible" : "auto", maxHeight: isMobile ? "none" : 480, paddingRight: 4 }}>
          {bookChapters.map((c: any, i: number) => {
            const act = actForOrder(c.order, bookActs);
            return (
              <button key={c.id} onClick={() => requestSwitch(c.id)} style={{ flexShrink: 0, minWidth: isMobile ? 140 : "auto", textAlign: "left", background: c.id === activeId ? "var(--bg2)" : "none", border: "none", borderLeft: `3px solid ${act?.color || "transparent"}`, borderRadius: 4, padding: "8px 8px", cursor: "pointer", color: c.id === activeId ? "var(--text)" : "var(--dim)", fontSize: 13 }}>
                <div><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--dim)", marginRight: 6 }}>{String(i + 1).padStart(2, "0")}</span>{c.title}</div>
                {c.pov && <div style={{ fontSize: 10, marginTop: 2, color: povColor(c.pov) }}>● POV: {c.pov}</div>}
                {act && <div onClick={(e) => { e.stopPropagation(); renameAct(act.id); }} style={{ fontSize: 9.5, marginTop: 2, color: act.color, cursor: "pointer" }} title="Renombrar acto">{act.name} <Pencil size={9} style={{ display: "inline", verticalAlign: "middle" }} /></div>}
              </button>
            );
          })}
        </div>
      </div>
      {active ? (
        <EditorErrorBoundary key={`${activeId}-${editorInstance}`} onRetry={() => setEditorInstance((n) => n + 1)}>
          <BookEditor
            active={active} bookChapters={bookChapters} activeId={activeId} isMobile={isMobile} editorRef={editorRef}
            dirty={dirty} savedFlash={savedFlash} wc={wc} showNotes={showNotes} setShowNotes={setShowNotes}
            updateActive={updateActive} move={move} deleteChapter={deleteChapter} exec={exec} handleInput={handleInput}
            pushHistory={pushHistory} undo={undo} saveContent={saveContent} showNoteForm={showNoteForm} setShowNoteForm={setShowNoteForm}
            noteDraft={noteDraft} setNoteDraft={setNoteDraft} openNoteForm={openNoteForm} submitNote={submitNote}
            removeNote={removeNote} openEditNote={openEditNote} combinedMarks={combinedMarks}
          />
        </EditorErrorBoundary>
      ) : (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--dim)" }}>Crea un capítulo para empezar.</div>
      )}
      {pendingSwitch && (
        <Modal onClose={confirmDiscard}>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 17, marginBottom: 10 }}>¿Guardar los cambios?</div>
          <div style={{ color: "var(--text)", fontSize: 13.5, marginBottom: 16 }}>Has editado este capítulo y no lo has guardado. Si sales sin guardar, se perderán los cambios.</div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={confirmDiscard} style={smallOutlineBtn}>Salir sin guardar</button>
            <button onClick={confirmSave} style={primaryBtn}>Guardar y salir</button>
          </div>
        </Modal>
      )}
      {showManuscript && (
        <Modal onClose={() => setShowManuscript(false)}>
          <div style={{ width: 620, maxWidth: "90vw", maxHeight: "78vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 19 }}>Manuscrito completo (solo lectura)</div>
              <button onClick={() => setShowManuscript(false)} style={iconBtn}><X size={14} /></button>
            </div>
            {bookChapters.map((c: any, i: number) => (
              <div key={c.id} style={{ marginBottom: 26 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--dim)" }}>Capítulo {i + 1}{c.pov ? ` · POV: ${c.pov}` : ""}</div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, marginBottom: 8 }}>{c.title}</div>
                <div dangerouslySetInnerHTML={{ __html: c.content }} style={{ fontFamily: `'${c.font}', serif`, fontSize: 15, lineHeight: 1.8, textAlign: c.justify ? "justify" : "left" }} />
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}