import { useRef, useMemo, useState, useEffect } from "react";
import { ArrowLeft, Star } from "lucide-react";
import { iconBtn, smallOutlineBtn } from "../styles";
import { DECOR_ICONS } from "../constants";
import { uid, hash } from "../utils";

const SHELVES = 3;
const BOOK_GAP = 14;
const EDGE_PADDING = 24;
const DECOR_SIZE = 48;
const CLICK_THRESHOLD = 6; // px de movimiento máximo para considerarlo "clic" y no "arrastre"

export function ShelfLibrary({ books, sagas, onBack, onOpenBook, isMobile, layout, setLayout, decor, setDecor, lastEditedBookId }: any) {
  const shelfH = isMobile ? 150 : 200;
  const containerH = shelfH * SHELVES + 40;

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(900);
  useEffect(() => {
    function measure() {
      if (containerRef.current) setContainerWidth(containerRef.current.clientWidth);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const dragRef = useRef<any>(null);

  const sagaSize = (sagaId: string) => {
    const variants = [{ w: 40, h: 130 }, { w: 46, h: 152 }, { w: 36, h: 112 }];
    return variants[hash(sagaId + "sz") % variants.length];
  };

  function sizeFor(b: any) {
    if (b.sagaId) {
      const base = sagaSize(b.sagaId);
      // pequeña variación de ancho para que no se vean idénticos, pero misma altura
      const wVariation = (hash(b.id + "wv") % 8) - 4;
      return { w: base.w + wVariation, h: base.h };
    }
    return { w: 34 + (hash(b.id + "w") % 16), h: 100 + (hash(b.id + "h") % 40) };
  }

  // Orden base: agrupa libros de la misma saga de forma consecutiva
  const groupedOrder = useMemo(() => {
    const seen = new Set<string>();
    const order: string[] = [];
    books.forEach((b: any) => {
      if (seen.has(b.id)) return;
      if (b.sagaId) {
        const sagaBooks = books
          .filter((x: any) => x.sagaId === b.sagaId)
          .sort((a: any, c: any) => (a.order ?? 0) - (c.order ?? 0));
        sagaBooks.forEach((sb: any) => {
          if (!seen.has(sb.id)) { order.push(sb.id); seen.add(sb.id); }
        });
      } else {
        order.push(b.id); seen.add(b.id);
      }
    });
    return order;
  }, [books]);

  // Si hay un orden manual guardado (por arrastres previos) y sigue siendo válido, se usa ese
  const manualOrder: string[] | undefined = layout?.__order;
  const baseOrder = manualOrder && manualOrder.length === books.length && manualOrder.every((id) => books.some((b: any) => b.id === id))
    ? manualOrder
    : groupedOrder;

  const orderedBooks = useMemo(
    () => baseOrder.map((id) => books.find((b: any) => b.id === id)).filter(Boolean),
    [baseOrder, books]
  );

  // Calcula posiciones sin solapes, en fila, pasando de balda cuando no cabe
  const positions = useMemo(() => {
    const pos: Record<string, { shelf: number; x: number; w: number; h: number }> = {};
    let shelfIdx = 0;
    let currentX = EDGE_PADDING;
    orderedBooks.forEach((b: any) => {
      const { w, h } = sizeFor(b);
      if (currentX + w + EDGE_PADDING > containerWidth && shelfIdx < SHELVES - 1) {
        shelfIdx++;
        currentX = EDGE_PADDING;
      }
      pos[b.id] = { shelf: shelfIdx, x: currentX, w, h };
      currentX += w + BOOK_GAP;
    });
    return pos;
  }, [orderedBooks, containerWidth]);

  function reorderTo(fromId: string, toId: string) {
    if (fromId === toId) return;
    const order = [...baseOrder];
    const i1 = order.indexOf(fromId);
    const i2 = order.indexOf(toId);
    if (i1 === -1 || i2 === -1) return;
    [order[i1], order[i2]] = [order[i2], order[i1]];
    setLayout((l: any) => ({ ...l, __order: order }));
  }

  function startBookDrag(e: any, id: string) {
    dragRef.current = { kind: "book", id, startX: e.clientX, startY: e.clientY, moved: false };
    window.addEventListener("pointermove", onBookMove);
    window.addEventListener("pointerup", onBookUp);
  }
  function onBookMove(e: any) {
    const d = dragRef.current;
    if (!d || d.kind !== "book") return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (Math.abs(dx) > CLICK_THRESHOLD || Math.abs(dy) > CLICK_THRESHOLD) d.moved = true;
    if (!d.moved || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top + containerRef.current.scrollTop;
    const hoveredShelf = Math.min(SHELVES - 1, Math.max(0, Math.floor(relY / shelfH)));

    const target = orderedBooks.find((b: any) => {
      const p = positions[b.id];
      return p && p.shelf === hoveredShelf && relX >= p.x && relX <= p.x + p.w && b.id !== d.id;
    });
    if (target) reorderTo(d.id, target.id);
  }
  function onBookUp() {
    const d = dragRef.current;
    window.removeEventListener("pointermove", onBookMove);
    window.removeEventListener("pointerup", onBookUp);
    dragRef.current = null;
    if (d && !d.moved) onOpenBook(d.id); // fue un clic real, no un arrastre
  }

  function startDecorDrag(e: any, id: string) {
    const item = decor.find((d: any) => d.id === id);
    dragRef.current = { kind: "decor", id, startX: e.clientX, startY: e.clientY, origX: item.x, origY: item.y };
    window.addEventListener("pointermove", onDecorMove);
    window.addEventListener("pointerup", onDecorUp);
  }
  function onDecorMove(e: any) {
    const d = dragRef.current;
    if (!d || d.kind !== "decor") return;
    const nx = Math.max(0, d.origX + (e.clientX - d.startX));
    const ny = Math.max(0, d.origY + (e.clientY - d.startY));
    setDecor((arr: any[]) => arr.map((it) => (it.id === d.id ? { ...it, x: nx, y: ny } : it)));
  }
  function onDecorUp() {
    window.removeEventListener("pointermove", onDecorMove);
    window.removeEventListener("pointerup", onDecorUp);
    dragRef.current = null;
  }

  function addDecor(kind: string) { setDecor((d: any[]) => [...d, { id: uid(), kind, x: 60 + d.length * 30, y: 60 }]); }
  function removeDecor(id: string) { setDecor((d: any[]) => d.filter((x) => x.id !== id)); }

  return (
    <div style={{ padding: isMobile ? "18px 16px" : "24px 32px", height: "100%", overflow: "hidden", display: "flex", flexDirection: "column", background: "linear-gradient(180deg, var(--bg) 0%, var(--bg3) 100%)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexShrink: 0, flexWrap: "wrap", gap: 10 }}>
        <button onClick={onBack} style={iconBtn} title="Volver a la biblioteca"><ArrowLeft size={15} /></button>
        <span style={{ fontFamily: "'Fraunces', serif", fontSize: isMobile ? 18 : 24, fontWeight: 600, letterSpacing: 0.5 }}>Biblioteca de Alejandría II</span>
        <div style={{ display: "flex", gap: 6 }}>{Object.entries(DECOR_ICONS).map(([kind, icon]) => <button key={kind} onClick={() => addDecor(kind)} style={smallOutlineBtn}>{icon} +</button>)}</div>
      </div>
      <div ref={containerRef} style={{ flex: 1, overflow: "auto", position: "relative" }}>
        <div style={{ position: "relative", width: "100%", minHeight: containerH }}>
          {Array.from({ length: SHELVES }, (_, i) => (
            <div key={i} style={{ position: "absolute", left: 0, right: 0, top: (i + 1) * shelfH - 12, height: 12, background: "#5a4326", boxShadow: "0 4px 6px rgba(0,0,0,0.25)" }} />
          ))}
          {orderedBooks.map((b: any) => {
            const pos = positions[b.id];
            if (!pos) return null;
            const { w, h } = pos;
            const isLightColor = ["#F5F3EB", "#E8C547"].includes(b.color);
            const saga = sagas.find((s: any) => s.id === b.sagaId);
            const fontSize = Math.max(7.5, Math.min(11, (h - 14) / Math.max(b.title.length, 6) * 1.6));
            return (
              <div key={b.id} onPointerDown={(e) => startBookDrag(e, b.id)} title={b.title} style={{ position: "absolute", left: pos.x, top: (pos.shelf + 1) * shelfH - 12 - h, cursor: "grab", width: w, height: h, background: b.color, borderRadius: "2px 4px 4px 2px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", boxShadow: "1px 0 3px rgba(0,0,0,0.35)", paddingTop: 4, touchAction: "none" }}>
                <span style={{ writingMode: "vertical-rl", fontSize, lineHeight: 1.15, fontFamily: "'Fraunces', serif", fontWeight: 600, color: isLightColor ? "#2B2A25" : "#241d12", whiteSpace: "nowrap", padding: "2px 0" }}>{b.title}</span>
                {saga?.color && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 9, background: saga.color }} />}
                {b.id === lastEditedBookId && <Star size={11} color="#FFD65A" fill="#FFD65A" style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)" }} />}
              </div>
            );
          })}
          {decor.map((d: any) => (
            <div key={d.id} onPointerDown={(e) => startDecorDrag(e, d.id)} style={{ position: "absolute", left: d.x, top: d.y, fontSize: DECOR_SIZE, cursor: "grab", touchAction: "none", filter: d.kind === "luna"  ? "drop-shadow(0 0 6px #F6E27A)" : "none" }}>
              {DECOR_ICONS[d.kind]}
              <button onClick={(e) => { e.stopPropagation(); removeDecor(d.id); }} style={{ position: "absolute", top: -8, right: -8, background: "rgba(10,10,14,0.6)", border: "none", borderRadius: "50%", width: 14, height: 14, color: "#fff", fontSize: 9, cursor: "pointer", lineHeight: "14px" }}>×</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}