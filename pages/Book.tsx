import { useRef, useState, useMemo } from "react";
import { ArrowLeft, ImageIcon, Info, Star, X, Plus } from "lucide-react";
import { Modal } from "../modals";
import { Row2, Field, FieldArea } from "../ui";
import { iconBtn, titleInput, fieldLabel, selectInput } from "../styles";
import { STATUS, GENRES, NARRATIVE_PERSON, COLOR_PRESETS, COLOR_NAMES } from "../constants";
import { activityWithDates, DATE_FMT } from "../utils";

export function BookCover({ book, onClick, onCover, onInfo, isLast }: any) {
  const fileRef = useRef<HTMLInputElement>(null);
  const status = STATUS[book.status] || STATUS.sin_empezar;
  const isLightColor = ["#F5F3EB", "#E8C547"].includes(book.color);
  return (
    <div style={{ width: 136 }}>
      <div onClick={onClick} style={{ width: 136, height: 184, borderRadius: 8, cursor: "pointer", position: "relative", overflow: "hidden", background: book.cover ? `url(${book.cover}) center/cover` : book.color, border: "1px solid var(--border)", display: "flex", alignItems: "flex-end" }}>
        {!book.cover && <div style={{ padding: 10, fontFamily: "'Fraunces', serif", fontSize: 13, color: isLightColor ? "#2B2A25" : "#15161d", fontWeight: 600 }}>{book.title}</div>}
        <span title={status.label} style={{ position: "absolute", top: 7, left: 7, width: 9, height: 9, borderRadius: "50%", background: status.color, border: "1px solid rgba(0,0,0,0.3)" }} />
        {isLast && <Star size={13} color="#FFD65A" fill="#FFD65A" style={{ position: "absolute", top: 6, right: 32 }} />}
        <button onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }} style={{ position: "absolute", top: 6, right: 6, background: "rgba(10,10,14,0.55)", border: "none", borderRadius: 5, width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} title="Cambiar portada"><ImageIcon size={11} color="#EDE9DD" /></button>
        <button onClick={(e) => { e.stopPropagation(); onInfo(); }} style={{ position: "absolute", bottom: 6, right: 6, background: "rgba(10,10,14,0.55)", border: "none", borderRadius: 5, width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} title="Ver datos del libro"><Info size={11} color="#EDE9DD" /></button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => e.target.files && e.target.files[0] && onCover(e.target.files[0])} />
      </div>
      <div style={{ fontSize: 12, marginTop: 6, color: "var(--text)" }}>{book.title}{book.numberInSaga ? ` · Libro ${book.numberInSaga}` : ""}</div>
    </div>
  );
}

export function AddCoverCard({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ width: 136, height: 184, borderRadius: 8, border: "1px dashed var(--border)", background: "none", color: "var(--dim)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12.5 }}>
      <Plus size={18} /> {label}
    </button>
  );
}

export function BookInfoModal({ book, onClose, onUpdate }: any) {
  const activity = useMemo(() => activityWithDates(book.id), [book.id]);
  const [hoverDay, setHoverDay] = useState<any>(null);
  const levelColor = (lvl: number) => ["var(--bg3)", "#2c4a3a", "#3b6b4f", "#4f9a6c", "#5FA98C"][lvl] || "var(--bg3)";
  const set = (f: string) => (e: any) => onUpdate({ [f]: e.target.value });
  return (
    <Modal onClose={onClose}>
      <div style={{ width: 560, maxWidth: "90vw", maxHeight: "78vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          <input value={book.title} onChange={set("title")} style={{ ...titleInput, fontSize: 20 }} />
          <button onClick={onClose} style={iconBtn}><X size={14} /></button>
        </div>
        <Row2>
          <Field label="Número en la saga (también ordena el estante)" value={book.numberInSaga || ""} onChange={(v: string) => onUpdate({ numberInSaga: v ? Number(v) : null })} type="number" />
          <Field label="Estado" custom={<select value={book.status} onChange={set("status")} style={selectInput}>{Object.entries(STATUS).map(([k, v]: any) => <option key={k} value={k}>{v.label}</option>)}</select>} />
        </Row2>
        <Row2>
          <Field label="Género" custom={<select value={book.genre} onChange={set("genre")} style={selectInput}><option value="">-</option>{GENRES.map((g) => <option key={g}>{g}</option>)}</select>} />
          <Field label="Subgénero" value={book.subgenre} onChange={(v: string) => onUpdate({ subgenre: v })} />
        </Row2>
        <Row2>
          <Field label="Fecha de creación" value={book.dateCreated} onChange={(v: string) => onUpdate({ dateCreated: v })} type="date" />
          <Field label="Fecha de finalización" value={book.dateFinished} onChange={(v: string) => onUpdate({ dateFinished: v })} type="date" />
        </Row2>
        <Field label="Narrador/es" value={book.narrators} onChange={(v: string) => onUpdate({ narrators: v })} />
        <div style={{ marginBottom: 10 }}>
          <div style={fieldLabel}>Persona narrativa</div>
          <select value={book.narrativePerson} onChange={set("narrativePerson")} style={selectInput}><option value="">-</option>{NARRATIVE_PERSON.map((p) => <option key={p}>{p}</option>)}</select>
        </div>
        <FieldArea label="Sinopsis" value={book.sinopsis} onChange={(v: string) => onUpdate({ sinopsis: v })} />
        <div style={fieldLabel}>Color del libro</div>
        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          {COLOR_PRESETS.map((c) => <button key={c} title={COLOR_NAMES[c] || ""} onClick={() => onUpdate({ color: c })} style={{ width: 22, height: 22, borderRadius: "50%", background: c, border: book.color === c ? "2px solid var(--accent)" : "1px solid var(--border)", cursor: "pointer" }} />)}
        </div>
        <div style={fieldLabel}>Actividad de escritura (último año) — pasa el ratón por un día</div>
        <div style={{ display: "grid", gridTemplateRows: "repeat(7, 8px)", gridAutoFlow: "column", gap: 2, marginTop: 6, overflowX: "auto" }}>
          {activity.map((cell, i) => <div key={i} onMouseEnter={() => setHoverDay(cell)} onMouseLeave={() => setHoverDay(null)} style={{ width: 8, height: 8, borderRadius: 2, background: levelColor(cell.level) }} />)}
        </div>
        <div style={{ fontSize: 11.5, color: "var(--dim)", marginTop: 6, height: 16 }}>{hoverDay ? DATE_FMT.format(hoverDay.date) : "\u00A0"}</div>
      </div>
    </Modal>
  );
}

export function BookTopBar({ book, onBack, headerControls }: any) {
  return (
    <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <button onClick={onBack} style={iconBtn} title="Volver a la biblioteca"><ArrowLeft size={15} /></button>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 19, fontWeight: 600, flex: 1, minWidth: 100 }}>{book?.title}</div>
      {headerControls}
    </div>
  );
}