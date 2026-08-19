import { useState } from "react";
import { PenLine, Globe2, Lock, Library, Trash2 } from "lucide-react";
import { BookCover, AddCoverCard, BookInfoModal } from "./Book";
import { miniIconBtn, smallOutlineBtn } from "../styles";
import { COLOR_PRESETS } from "../constants";
import { fileToDataUrl } from "../utils";

function DeleteCascadeModal({ kind, name, hasChildren, onClose, onConfirm }: any) {
  const itemLabel = kind === "saga" ? "la saga" : "el universo";
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "rgba(0,0,0,.45)" }}>
      <div style={{ width: "min(100%, 420px)", padding: 24, borderRadius: 14, background: "var(--bg)", border: "1px solid var(--border)", boxShadow: "0 12px 40px rgba(0,0,0,.25)" }}>
        <h3 style={{ margin: "0 0 12px", fontFamily: "'Fraunces', serif" }}>Eliminar {itemLabel}</h3>
        <p style={{ margin: "0 0 20px", color: "var(--dim)" }}>
          ¿Seguro que quieres eliminar <strong>{name}</strong>?
          {hasChildren ? " También puedes eliminar todo su contenido." : ""}
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, flexWrap: "wrap" }}>
          <button onClick={onClose} style={smallOutlineBtn}>Cancelar</button>
          {hasChildren && <button onClick={() => { onConfirm(true); onClose(); }} style={smallOutlineBtn}>Eliminar todo</button>}
          <button onClick={() => { onConfirm(false); onClose(); }} style={{ ...smallOutlineBtn, color: "var(--accent)" }}>Eliminar</button>
        </div>
      </div>
    </div>
  );
}

export function LibraryScreen({
  universes, sagas, setSagas, books, setBooks, openBook, addUniverse, addSaga,
  addBook, deleteSagaCascade, deleteUniverseCascade, authorName, onOpenShelf, headerControls,
  isMobile, lastEditedBookId,
}: any) {
  const looseSagas = sagas.filter((s: any) => !s.universeId);
  const [infoBookId, setInfoBookId] = useState<string | null>(null);
  const infoBook = books.find((b: any) => b.id === infoBookId);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  function setBookCover(id: string, file: File) {
    fileToDataUrl(file, (url: string) => setBooks((b: any[]) => b.map((bk) => (bk.id === id ? { ...bk, cover: url } : bk))));
  }
  const sortedBooks = (list: any[]) => [...list].sort((a, b) => (a.numberInSaga ?? 999) - (b.numberInSaga ?? 999));
  function setSagaColor(sagaId: string, color: string | null) {
    setSagas((s: any[]) => s.map((x) => (x.id === sagaId ? { ...x, color } : x)));
  }

  function renderSaga(saga: any) {
    const sagaBooks = sortedBooks(books.filter((b: any) => b.sagaId === saga.id));
    return (
      <div key={saga.id} style={{ marginBottom: 24, borderLeft: saga.color ? `3px solid ${saga.color}` : "3px solid transparent", paddingLeft: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16 }}>{saga.name}</div>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => setSagaColor(saga.id, null)} title="Sin color propio" style={{ width: 14, height: 14, borderRadius: "50%", border: !saga.color ? "2px solid var(--accent)" : "1px solid var(--border)", background: "repeating-conic-gradient(var(--bg3) 0% 25%, var(--bg2) 0% 50%)", cursor: "pointer" }} />
            {COLOR_PRESETS.slice(0, 10).map((c: string) => <button key={c} onClick={() => setSagaColor(saga.id, c)} style={{ width: 14, height: 14, borderRadius: "50%", background: c, border: saga.color === c ? "2px solid var(--text)" : "1px solid var(--border)", cursor: "pointer" }} />)}
          </div>
          <button onClick={() => setDeleteTarget({ kind: "saga", id: saga.id, name: saga.name, hasChildren: sagaBooks.length > 0 })} style={miniIconBtn} title="Eliminar saga"><Trash2 size={13} /></button>
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {sagaBooks.map((b: any) => <BookCover key={b.id} book={b} onClick={() => openBook(b.id)} onCover={(f: File) => setBookCover(b.id, f)} onInfo={() => setInfoBookId(b.id)} isLast={b.id === lastEditedBookId} />)}
          <AddCoverCard label="Nuevo libro" onClick={() => addBook(saga.id)} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: isMobile ? "18px 16px" : "28px 32px", overflowY: "auto", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}><PenLine size={20} color="var(--accent)" /><span style={{ fontFamily: "'Fraunces', serif", fontSize: isMobile ? 19 : 24, fontWeight: 600 }}>Tu biblioteca, {authorName}</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}><button onClick={onOpenShelf} style={smallOutlineBtn}><Library size={13} /> Ver estantería</button>{headerControls}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--dim)", marginBottom: 26 }}><Lock size={12} /> Solo visible para ti — sesión local</div>
      {universes.map((u: any) => {
        const uSagas = sagas.filter((s: any) => s.universeId === u.id);
        if (uSagas.length === 0) return null;
        return (
          <div key={u.id} style={{ border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px", marginBottom: 26 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, color: "var(--accent)" }}>
              <Globe2 size={14} /><span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 0.6, flex: 1 }}>Universo: {u.name}</span>
              <button onClick={() => setDeleteTarget({ kind: "universo", id: u.id, name: u.name, hasChildren: uSagas.length > 0 })} style={miniIconBtn} title="Eliminar universo"><Trash2 size={13} /></button>
            </div>
            {uSagas.map(renderSaga)}
            <button onClick={() => addSaga(u.id)} style={smallOutlineBtn}>+ Saga en este universo</button>
          </div>
        );
      })}
      {looseSagas.map(renderSaga)}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, marginBottom: 12 }}>Sueltos</div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {books.filter((b: any) => !b.sagaId).map((b: any) => <BookCover key={b.id} book={b} onClick={() => openBook(b.id)} onCover={(f: File) => setBookCover(b.id, f)} onInfo={() => setInfoBookId(b.id)} isLast={b.id === lastEditedBookId} />)}
          <AddCoverCard label="Nuevo libro" onClick={() => addBook(null)} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}><button onClick={() => addSaga(null)} style={smallOutlineBtn}>+ Nueva saga</button><button onClick={addUniverse} style={smallOutlineBtn}>+ Nuevo universo</button></div>
      {infoBook && <BookInfoModal book={infoBook} onClose={() => setInfoBookId(null)} onUpdate={(patch: any) => setBooks((bs: any[]) => bs.map((b) => (b.id === infoBook.id ? { ...b, ...patch } : b)))} />}
      {deleteTarget && <DeleteCascadeModal kind={deleteTarget.kind} name={deleteTarget.name} hasChildren={deleteTarget.hasChildren} onClose={() => setDeleteTarget(null)} onConfirm={(deleteEverything: boolean) => (deleteTarget.kind === "saga" ? deleteSagaCascade(deleteTarget.id, deleteEverything) : deleteUniverseCascade(deleteTarget.id, deleteEverything))} />}
    </div>
  );
}