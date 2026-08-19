import {
  Bold, Italic, Underline, AlignJustify, Minus, Highlighter, Undo2, EyeOff,
  StickyNote, Check, X, Trash2,
} from "lucide-react";
const iconBtn: React.CSSProperties = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "5px 7px", border: "1px solid var(--border)", borderRadius: 6, background: "var(--bg2)", color: "var(--text)", cursor: "pointer" };
const toggleBtn: React.CSSProperties = { ...iconBtn, padding: "5px 8px" };
const toggleBtnActive: React.CSSProperties = { borderColor: "var(--accent)", color: "var(--accent)" };
const titleInput: React.CSSProperties = { border: 0, borderBottom: "1px solid var(--border)", background: "transparent", color: "var(--text)", fontSize: 18, fontWeight: 600, outline: "none" };
const textInput: React.CSSProperties = { border: "1px solid var(--border)", borderRadius: 6, padding: "6px 8px", background: "var(--bg2)", color: "var(--text)", outline: "none" };
const textArea: React.CSSProperties = { ...textInput, resize: "vertical", width: "100%", boxSizing: "border-box" };
const selectInput: React.CSSProperties = { ...textInput, cursor: "pointer" };
const smallOutlineBtn: React.CSSProperties = { ...iconBtn, fontSize: 11 };
const primaryBtn: React.CSSProperties = { ...smallOutlineBtn, background: "var(--accent)", color: "white", borderColor: "var(--accent)" };
const miniIconBtn: React.CSSProperties = { ...iconBtn, padding: 3, border: 0 };

const HIGHLIGHTER_COLORS = ["#F6D365", "#A8E6CF", "#AEDFF7", "#F7B2D8"];
const NOTE_THEMES = ["General", "Personaje", "Trama", "Estilo", "Investigación"];
const colorForReader = (reader: string) => `hsl(${Math.abs([...String(reader)].reduce((n, c) => n + c.charCodeAt(0), 0)) % 360} 55% 55%)`;
const pageCount = (words: number) => Math.max(1, Math.ceil(words / 250));

export function BookEditor({
  active, bookChapters, activeId, isMobile, editorRef, dirty, savedFlash, wc,
  showNotes, setShowNotes, updateActive, move, deleteChapter, exec, handleInput,
  pushHistory, undo, saveContent, showNoteForm, setShowNoteForm, noteDraft, setNoteDraft,
  openNoteForm, submitNote, removeNote, openEditNote, combinedMarks,
}: any) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: isMobile ? "column" : "row", gap: 16, minWidth: 0 }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--dim)" }}>Cap. {bookChapters.findIndex((c: { id: any }) => c.id === activeId) + 1}</span>
          <input value={active.title} onChange={(e) => { updateActive({ title: e.target.value }); }} style={{ ...titleInput, flex: 1, minWidth: 120 }} />
          <input value={active.pov} onChange={(e) => updateActive({ pov: e.target.value })} placeholder="POV / narrador" style={{ ...textInput, width: 120 }} />
          <button onClick={() => move(-1)} style={iconBtn}>↑</button><button onClick={() => move(1)} style={iconBtn}>↓</button>
          <button onClick={deleteChapter} style={{ ...iconBtn, color: "#C1594A" }} title="Eliminar capítulo"><Trash2 size={13} /></button>
        </div>
        <input value={active.brief} onChange={(e) => updateActive({ brief: e.target.value })} placeholder="Breve descripción de qué trata este capítulo..." style={{ ...textInput, marginBottom: 8, fontStyle: "italic" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
          <select value={active.font} onChange={(e) => updateActive({ font: e.target.value })} style={selectInput}>
            <option value="Fraunces">Fraunces</option><option value="Playfair Display">Playfair Display</option><option value="Merriweather">Merriweather</option><option value="Inter">Inter (sans)</option>
          </select>
          <button onClick={() => exec("bold")} style={iconBtn}><Bold size={13} /></button>
          <button onClick={() => exec("italic")} style={iconBtn}><Italic size={13} /></button>
          <button onClick={() => exec("underline")} style={iconBtn}><Underline size={13} /></button>
          <button onClick={() => updateActive({ justify: !active.justify })} style={{ ...iconBtn, ...(active.justify ? toggleBtnActive : {}) }}><AlignJustify size={13} /></button>
          <button onClick={() => updateActive({ indent: !active.indent })} style={{ ...toggleBtn, ...(active.indent ? toggleBtnActive : {}) }}>Sangría</button>
          <button onClick={() => updateActive({ dropCap: !active.dropCap })} style={{ ...toggleBtn, ...(active.dropCap ? toggleBtnActive : {}) }}>Letra capital</button>
          <button onClick={() => exec("insertHorizontalRule")} style={iconBtn}><Minus size={13} /></button>
          <div style={{ display: "flex", alignItems: "center", gap: 2, background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 6, padding: "3px 5px" }} title="Subrayador (semitransparente para leerse bien en cualquier tema)">
            <Highlighter size={13} color="var(--dim)" />
            {HIGHLIGHTER_COLORS.map((c) => <button key={c} onClick={() => exec("hiliteColor", c)} style={{ width: 13, height: 13, borderRadius: 3, background: c, border: "1px solid rgba(120,120,120,0.4)", cursor: "pointer" }} />)}
            <button onClick={() => exec("hiliteColor", "transparent")} style={{ ...miniIconBtn, marginLeft: 2 }} title="Quitar subrayado"><X size={11} /></button>
          </div>
          <button onClick={undo} style={iconBtn} title="Deshacer (hasta 3 pasos)"><Undo2 size={13} /></button>
          <button onClick={() => updateActive({ readOnly: !active.readOnly })} style={{ ...toggleBtn, ...(active.readOnly ? toggleBtnActive : {}) }}><EyeOff size={12} /> Solo lectura</button>
          <button onClick={() => setShowNotes((v: boolean) => !v)} style={{ ...toggleBtn, ...(showNotes ? toggleBtnActive : {}) }}><StickyNote size={13} /></button>
          <button onClick={saveContent} style={{ ...toggleBtn, ...(dirty ? { borderColor: "var(--accent)", color: "var(--accent)" } : {}) }}>{savedFlash ? <><Check size={12} /> Guardado</> : dirty ? "Guardar" : "Guardado"}</button>
          <span style={{ fontSize: 11, color: "var(--dim)", marginLeft: "auto", fontFamily: "'JetBrains Mono', monospace" }}>{wc} palabras · {pageCount(wc)} hoja{pageCount(wc) === 1 ? "" : "s"}</span>
        </div>
        <div
          key={activeId}
          ref={editorRef}
          contentEditable={!active.readOnly}
          suppressContentEditableWarning
          onInput={() => handleInput(true)}
          onBeforeInput={pushHistory}
          className={active.dropCap ? "dropcap-editor" : ""}
          style={{ flex: 1, minHeight: 200, background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: 22, color: "var(--text)", fontFamily: `'${active.font}', serif`, fontSize: 16.5, lineHeight: 1.8, outline: "none", textAlign: active.justify ? "justify" : "left", overflowY: "auto", textIndent: active.indent ? "2em" : 0, opacity: active.readOnly ? 0.75 : 1 }}
        />
        <style>{`.dropcap-editor::first-letter{font-size:2.6em;float:left;line-height:0.75;padding-right:6px;margin-top:2px;font-family:'${active.font}',serif;color:var(--accent)}`}</style>
        <div style={{ fontSize: 10.5, color: "var(--dim)", marginTop: 6 }}>Para comentar un fragmento: selecciónalo con el ratón y luego pulsa "+ Nota".</div>
      </div>
      {showNotes && (
        <div style={{ width: isMobile ? "100%" : 240, flexShrink: 0 }}>
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--dim)", marginBottom: 8 }}>Notas y comentarios (en orden del texto)</div>
          <button onClick={openNoteForm} style={smallOutlineBtn}>+ Nota (sobre selección)</button>
          {showNoteForm && (
            <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: 10, marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              <select value={noteDraft.theme} onChange={(e) => setNoteDraft((d: any) => ({ ...d, theme: e.target.value }))} style={selectInput}>{NOTE_THEMES.map((t: string) => <option key={t}>{t}</option>)}</select>
              <div style={{ fontSize: 11, color: "var(--dim)", fontStyle: "italic" }}>"{noteDraft.excerpt}"</div>
              <textarea value={noteDraft.comment} onChange={(e) => setNoteDraft((d: any) => ({ ...d, comment: e.target.value }))} placeholder="Escribe la nota..." rows={2} style={textArea} />
              <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                <button onClick={() => setShowNoteForm(null)} style={smallOutlineBtn}>Cancelar</button>
                <button onClick={submitNote} style={primaryBtn}>Guardar nota</button>
              </div>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            {combinedMarks.map((n: any) => n.kind === "note" ? (
              <div key={n.id} onClick={() => openEditNote(n)} style={{ background: "var(--bg2)", border: `1px solid ${n.color}55`, borderLeft: `3px solid ${n.color}`, borderRadius: 6, padding: 10, fontSize: 12.5, cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ color: n.color, fontSize: 10.5, textTransform: "uppercase" }}>{n.theme}</span>
                  <button onClick={(e) => { e.stopPropagation(); removeNote(n.id); }} style={miniIconBtn}><X size={11} /></button>
                </div>
                {n.excerpt && <div style={{ color: "var(--dim)", fontStyle: "italic", marginBottom: 4 }}>"{n.excerpt}"</div>}
                <div style={{ color: "var(--text)" }}>{n.comment}</div>
              </div>
            ) : (
              <div key={n.id} style={{ background: "var(--bg2)", border: `1px solid ${colorForReader(n.reader)}55`, borderLeft: `3px solid ${colorForReader(n.reader)}`, borderRadius: 6, padding: 10, fontSize: 12.5 }}>
                <span style={{ color: colorForReader(n.reader), fontWeight: 600 }}>{n.reader} ha comentado:</span>
                {n.excerpt && <div style={{ color: "var(--dim)", fontStyle: "italic", margin: "2px 0" }}>"{n.excerpt}"</div>}
                <span style={{ color: "var(--text)" }}>{n.comment}</span>
              </div>
            ))}
            {combinedMarks.length === 0 && !showNoteForm && <div style={{ color: "var(--dim)", fontSize: 11.5 }}>Sin notas todavía.</div>}
          </div>
        </div>
      )}
    </div>
  );
}