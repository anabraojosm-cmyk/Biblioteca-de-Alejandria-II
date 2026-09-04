import { useState } from "react";
import { PenLine, Orbit, Lock, Library, Trash2, ChevronUp, ChevronDown, ChevronRight, ChevronDown as ChevronDownIcon } from "lucide-react";
import { BookCover, AddCoverCard, BookInfoModal } from "./Book";
import { miniIconBtn, smallOutlineBtn } from "../styles";
import { COLOR_PRESETS } from "../constants";
import { fileToDataUrl } from "../utils";

function DeleteCascadeModal({ kind, name, hasChildren, onClose, onConfirm }: any) {
  const itemLabel = kind === "saga" ? "la saga" : kind === "book" ? "el libro" : "el universo";
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
  universes, sagas, setSagas, books, setBooks, setUniverses, openBook, addUniverse, addSaga,
  addBook, deleteSagaCascade, deleteUniverseCascade, deleteBook, authorName, onOpenShelf, onOpenVault, headerControls,
  isMobile, lastEditedBookId,
}: any) {
  const looseSagas = sagas.filter((s: any) => !s.universeId);
  const [infoBookId, setInfoBookId] = useState<string | null>(null);
  const infoBook = books.find((b: any) => b.id === infoBookId);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [collapsedSagas, setCollapsedSagas] = useState<Record<string, boolean>>({});
  const [statusFilter, setStatusFilter] = useState("all");
  const visibleBooks = statusFilter === "all" ? books : books.filter((book: any) => book.status === statusFilter);
  const filteredSagas = (list: any[]) => statusFilter === "all"
    ? list
    : list.filter((saga) => visibleBooks.some((book: any) => book.sagaId === saga.id));

  function setBookCover(id: string, file: File) {
    fileToDataUrl(file, (url: string) => setBooks((b: any[]) => b.map((bk) => (bk.id === id ? { ...bk, cover: url } : bk))));
  }
  const sortedBooks = (list: any[]) => [...list].sort((a, b) => (a.numberInSaga ?? 999) - (b.numberInSaga ?? 999));
  function setSagaColor(sagaId: string, color: string | null) {
    setSagas((s: any[]) => s.map((x) => (x.id === sagaId ? { ...x, color } : x)));
  }
  function moveSaga(sagaId: string, delta: number) {
    setSagas((items: any[]) => {
      const index = items.findIndex((item) => item.id === sagaId);
      const target = index + delta;
      if (index < 0 || target < 0 || target >= items.length) return items;
      const next = [...items];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }
  function setSagaUniverse(sagaId: string, universeId: string) {
    setSagas((items: any[]) => items.map((item) => item.id === sagaId ? { ...item, universeId: universeId || null } : item));
  }
  function renameSaga(saga: any) {
    const name = prompt("Nombre de la saga:", saga.name);
    if (name?.trim()) setSagas((items: any[]) => items.map((item) => item.id === saga.id ? { ...item, name: name.trim() } : item));
  }
  function renameUniverse(universe: any) {
    const name = prompt("Nombre del universo:", universe.name);
    if (name?.trim()) setUniverses((items: any[]) => items.map((item) => item.id === universe.id ? { ...item, name: name.trim() } : item));
  }

  function renderSaga(saga: any) {
    const sagaBooks = sortedBooks(visibleBooks.filter((b: any) => b.sagaId === saga.id));
    return (
      <div key={saga.id} style={{ marginBottom: 24, borderLeft: saga.color ? `3px solid ${saga.color}` : "3px solid transparent", paddingLeft: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <button onClick={() => setCollapsedSagas((items) => ({ ...items, [saga.id]: !items[saga.id] }))} style={{ ...miniIconBtn, padding: 2 }} title={collapsedSagas[saga.id] ? "Mostrar libros" : "Minimizar saga"}>{collapsedSagas[saga.id] ? <ChevronRight size={15} /> : <ChevronDownIcon size={15} />}</button>
          <button onClick={() => renameSaga(saga)} style={{ border: 0, background: "none", color: "var(--text)", fontFamily: "'Fraunces', serif", fontSize: 16, cursor: "pointer", padding: 0 }} title="Cambiar nombre">{saga.name}</button>
          <select value={saga.universeId || ""} onChange={(e) => setSagaUniverse(saga.id, e.target.value)} style={{ ...smallOutlineBtn, padding: "3px 6px" }} title="Asignar saga a un universo">
            <option value="">Sin universo</option>{universes.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => setSagaColor(saga.id, null)} title="Sin color propio" style={{ width: 14, height: 14, borderRadius: "50%", border: !saga.color ? "2px solid var(--accent)" : "1px solid var(--border)", background: "repeating-conic-gradient(var(--bg3) 0% 25%, var(--bg2) 0% 50%)", cursor: "pointer" }} />
            <input type="color" value={saga.color || "#C9A24B"} onChange={(e) => setSagaColor(saga.id, e.target.value)} title="Elegir color de saga" style={{ width: 24, height: 20, padding: 0, border: "none", background: "transparent", cursor: "pointer" }} />
            {COLOR_PRESETS.slice(0, 10).map((c: string) => <button key={c} onClick={() => setSagaColor(saga.id, c)} style={{ width: 14, height: 14, borderRadius: "50%", background: c, border: saga.color === c ? "2px solid var(--text)" : "1px solid var(--border)", cursor: "pointer" }} />)}
          </div>
          <button onClick={() => moveSaga(saga.id, -1)} style={miniIconBtn} title="Subir saga"><ChevronUp size={13} /></button>
          <button onClick={() => moveSaga(saga.id, 1)} style={miniIconBtn} title="Bajar saga"><ChevronDown size={13} /></button>
          <button onClick={() => setDeleteTarget({ kind: "saga", id: saga.id, name: saga.name, hasChildren: sagaBooks.length > 0 })} style={miniIconBtn} title="Eliminar saga"><Trash2 size={13} /></button>
        </div>
        {!collapsedSagas[saga.id] && <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {sagaBooks.map((b: any) => <BookCover key={b.id} book={b} onClick={() => openBook(b.id)} onCover={(f: File) => setBookCover(b.id, f)} onInfo={() => setInfoBookId(b.id)} isLast={b.id === lastEditedBookId} />)}
          {statusFilter === "all" && <AddCoverCard label="Nuevo libro" onClick={() => addBook(saga.id)} />}
        </div>}
      </div>
    );
  }

  return (
    <div style={{ padding: isMobile ? "18px 16px" : "28px 32px", overflowY: "auto", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}><PenLine size={20} color="var(--accent)" /><span style={{ fontFamily: "'Fraunces', serif", fontSize: isMobile ? 19 : 24, fontWeight: 600 }}>Tu biblioteca, {authorName}</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <button type="button" onClick={onOpenVault} title="Abrir los sótanos mágicos" style={smallOutlineBtn}>
            ✦ Bajar a los sótanos
          </button>
          <button onClick={onOpenShelf} style={smallOutlineBtn}><Library size={13} /> Ver estantería</button>
          {headerControls}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--dim)", marginBottom: 26 }}><Lock size={12} /> Solo visible para ti — sesión local</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 22, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: "var(--dim)" }}>Filtrar libros:</span>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={smallOutlineBtn}>
          <option value="all">Sin filtro</option><option value="sin_empezar">Sin empezar</option><option value="en_proceso">Recién empezados</option><option value="borrador">Borrador</option><option value="finalizado">Finalizado</option>
        </select>
      </div>
      {universes.map((u: any) => {
        const uSagas = filteredSagas(sagas.filter((s: any) => s.universeId === u.id));
        if (uSagas.length === 0) return null;
        return (
          <div key={u.id} style={{ border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px", marginBottom: 26 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, color: "var(--accent)" }}>
              <Orbit size={14} /><button onClick={() => renameUniverse(u)} style={{ border: 0, background: "none", color: "inherit", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.6, flex: 1, textAlign: "left", cursor: "pointer" }} title="Cambiar nombre">Universo: {u.name}</button>
              <button onClick={() => setDeleteTarget({ kind: "universo", id: u.id, name: u.name, hasChildren: uSagas.length > 0 })} style={miniIconBtn} title="Eliminar universo"><Trash2 size={13} /></button>
            </div>
            {uSagas.map(renderSaga)}
            <button onClick={() => addSaga(u.id)} style={smallOutlineBtn}>+ Saga en este universo</button>
          </div>
        );
      })}
      {filteredSagas(looseSagas).map(renderSaga)}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, marginBottom: 12 }}>Sueltos</div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {visibleBooks.filter((b: any) => !b.sagaId).map((b: any) => <BookCover key={b.id} book={b} onClick={() => openBook(b.id)} onCover={(f: File) => setBookCover(b.id, f)} onInfo={() => setInfoBookId(b.id)} isLast={b.id === lastEditedBookId} />)}
          {statusFilter === "all" && <AddCoverCard label="Nuevo libro" onClick={() => addBook(null)} />}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}><button onClick={() => addSaga(null)} style={smallOutlineBtn}>+ Nueva saga</button><button onClick={addUniverse} style={smallOutlineBtn}>+ Nuevo universo</button></div>
      {infoBook && <BookInfoModal book={infoBook} sagas={sagas} onClose={() => setInfoBookId(null)} onUpdate={(patch: any) => setBooks((bs: any[]) => bs.map((b) => (b.id === infoBook.id ? { ...b, ...patch } : b)))} onDelete={() => setDeleteTarget({ kind: "book", id: infoBook.id, name: infoBook.title, hasChildren: false })} />}
      {deleteTarget && <DeleteCascadeModal kind={deleteTarget.kind} name={deleteTarget.name} hasChildren={deleteTarget.hasChildren} onClose={() => setDeleteTarget(null)} onConfirm={(deleteEverything: boolean) => {
        if (deleteTarget.kind === "book") deleteBook(deleteTarget.id);
        else if (deleteTarget.kind === "saga") deleteSagaCascade(deleteTarget.id, deleteEverything);
        else deleteUniverseCascade(deleteTarget.id, deleteEverything);
      }} />}
    </div>
  );
}