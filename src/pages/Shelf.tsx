import { useRef, useMemo, useState, useEffect } from "react";
import { ArrowLeft, Star, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { iconBtn, smallOutlineBtn } from "../styles";
import { DECOR_ICONS } from "../constants";
import { uid, hash } from "../utils";

const SHELVES = 5;
const BOOK_GAP = 10;
const EDGE_PADDING = 24;
const DECOR_SIZE = 64;
const CLICK_THRESHOLD = 8; // px de movimiento máximo para considerarlo "toque" y no "arrastre"
const CLICK_TIME_MS = 400; // ms máximos para que cuente como toque rápido

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
  const [showDecorMenu, setShowDecorMenu] = useState(false);

  const sagaSize = (sagaId: string) => {
    const variants = [{ w: 40, h: 150 }, { w: 46, h: 152 }, { w: 36, h: 150 }];
    return variants[hash(sagaId + "sz") % variants.length];
  };

  function baseSizeFor(b: any) {
    if (b.sagaId) return sagaSize(b.sagaId);
    return { w: 34 + (hash(b.id + "w") % 16), h: 150 + (hash(b.id + "h") % 40) };
  }
  function sizeFor(b: any) {
    const base = baseSizeFor(b);
    return { w: Math.max(35, Math.min(90, b.spineWidth || base.w)), h: Math.max(150, b.spineHeight || base.h) };
  }
  function fontSizeFor(b: any, h: number) {
    return b.spineFontSize ? Math.max(8, b.spineFontSize) : Math.max(8, Math.min(11, ((h - 14) / Math.max(b.title.length, 6)) * 1.6));
  }
  function genreFont(b: any) {
    const fonts: Record<string, string> = {
      Fantasía: "'Cinzel', 'Fraunces', serif",
      Romance: "'Cormorant Garamond', 'Fraunces', serif",
      "Ciencia ficción": "'Orbitron', Arial, sans-serif",
      Misterio: "'Bodoni Moda', Georgia, serif",
      Thriller: "'Oswald', Arial, sans-serif",
      Terror: "'UnifrakturCook', 'Fraunces', serif",
      Histórica: "'IM Fell English', Georgia, serif",
      Drama: "'Libre Baskerville', Georgia, serif",
      Aventura: "'Bree Serif', 'Fraunces', serif",
    };
    return fonts[b.genre] || "'Fraunces', serif";
  }

  // Orden base agrupando libros de la misma saga, para el reparto inicial (solo la primera vez)
  const groupedOrder = useMemo(() => {
    const seen = new Set<string>();
    const order: any[] = [];
    books.forEach((b: any) => {
      if (seen.has(b.id)) return;
      if (b.sagaId) {
        const sagaBooks = books
          .filter((x: any) => x.sagaId === b.sagaId)
          .sort((a: any, c: any) => (a.order ?? 0) - (c.order ?? 0));
        sagaBooks.forEach((sb: any) => { if (!seen.has(sb.id)) { order.push(sb); seen.add(sb.id); } });
      } else {
        order.push(b); seen.add(b.id);
      }
    });
    return order;
  }, [books]);

  // Completa con posiciones por defecto los libros que aún no tienen una guardada
  useEffect(() => {
    const missing = groupedOrder.filter((b: any) => !layout[b.id]);
    if (missing.length === 0) return;
    let shelfIdx = 0;
    let currentX = EDGE_PADDING;
    const additions: Record<string, { shelf: number; x: number }> = {};
    const placedGroups = new Set<string>();
    missing.forEach((b: any) => {
      const groupKey = b.sagaId || b.id;
      if (placedGroups.has(groupKey)) return;
      placedGroups.add(groupKey);
      const groupBooks = b.sagaId
        ? missing.filter((book: any) => book.sagaId === b.sagaId)
        : [b];
      const groupWidth = groupBooks.reduce((total: number, book: any) => total + sizeFor(book).w, 0)
        + Math.max(0, groupBooks.length - 1) * BOOK_GAP;
      if (currentX + groupWidth + EDGE_PADDING > containerWidth && shelfIdx < SHELVES - 1) {
        shelfIdx++;
        currentX = EDGE_PADDING;
      }
      let groupX = currentX;
      groupBooks.forEach((book: any) => {
        additions[book.id] = { shelf: shelfIdx, x: groupX };
        groupX += sizeFor(book).w + BOOK_GAP;
      });
      currentX += groupWidth + BOOK_GAP;
    });
    setLayout((l: any) => ({ ...l, ...additions }));
  }, [groupedOrder, containerWidth]); // eslint-disable-line

  useEffect(() => {
    const corrections: Record<string, { shelf: number; x: number }> = {};
    const groups = new Map<string, any[]>();
    books.forEach((book: any) => {
      if (!book.sagaId || !layout[book.id]) return;
      const group = groups.get(book.sagaId) || [];
      group.push(book);
      groups.set(book.sagaId, group);
    });
    groups.forEach((group) => {
      const shelf = layout[group[0].id].shelf;
      const sorted = [...group].sort((a, b) => (a.numberInSaga ?? 999) - (b.numberInSaga ?? 999));
      const positions = sorted.map((book) => layout[book.id]);
      const overlaps = sorted.some((book, index) => index > 0 && positions[index].x < positions[index - 1].x + sizeFor(sorted[index - 1]).w + BOOK_GAP);
      if (!overlaps || !sorted.every((book) => layout[book.id].shelf === shelf)) return;
      let x = Math.max(EDGE_PADDING, Math.min(...positions.map((position) => position.x)));
      sorted.forEach((book) => {
        corrections[book.id] = { shelf, x };
        x += sizeFor(book).w + BOOK_GAP;
      });
    });
    if (Object.keys(corrections).length > 0) {
      setLayout((current: any) => {
        const changed = Object.keys(corrections).some((id) => current[id]?.shelf !== corrections[id].shelf || current[id]?.x !== corrections[id].x);
        return changed ? { ...current, ...corrections } : current;
      });
    }
  }, [books, containerWidth, layout]); // eslint-disable-line

  function obstaclesOnShelf(shelf: number, excludeIds: Set<string>) {
    return books
      .filter((b: any) => layout[b.id] && layout[b.id].shelf === shelf && !excludeIds.has(b.id))
      .map((b: any) => {
        const pos = layout[b.id];
        const { w } = sizeFor(b);
        return { x: pos.x, w };
      });
  }

  function clampDelta(desiredDelta: number, groupMinX: number, groupMaxX: number, obstacles: { x: number; w: number }[]) {
    let maxRight = containerWidth - EDGE_PADDING - groupMaxX;
    let maxLeft = groupMinX - EDGE_PADDING;
    obstacles.forEach((o) => {
      if (o.x >= groupMaxX) maxRight = Math.min(maxRight, o.x - groupMaxX);
      if (o.x + o.w <= groupMinX) maxLeft = Math.min(maxLeft, groupMinX - (o.x + o.w));
    });
    return Math.max(-maxLeft, Math.min(maxRight, desiredDelta));
  }

  function resolveOverlap(shelf: number, id: string, x: number, w: number) {
    const obstacles = obstaclesOnShelf(shelf, new Set([id]));
    const overlaps = (testX: number) => obstacles.some((o) => testX < o.x + o.w && testX + w > o.x);
    if (!overlaps(x)) return Math.max(EDGE_PADDING, Math.min(containerWidth - EDGE_PADDING - w, x));
    for (let step = 0; step < containerWidth; step += 4) {
      const right = x + step;
      if (right + w <= containerWidth - EDGE_PADDING && !overlaps(right)) return right;
      const left = x - step;
      if (left >= EDGE_PADDING && !overlaps(left)) return left;
    }
    return EDGE_PADDING;
  }

  function startBookDrag(e: any, book: any) {
    const groupIds = book.sagaId ? books.filter((b: any) => b.sagaId === book.sagaId).map((b: any) => b.id) : [book.id];
    const startPositions: Record<string, { shelf: number; x: number }> = {};
    groupIds.forEach((id: string) => { startPositions[id] = layout[id] || { shelf: 0, x: EDGE_PADDING }; });
    dragRef.current = {
      kind: "book", mainId: book.id, groupIds, startPositions,
      startX: e.clientX, startY: e.clientY, startTime: Date.now(), moved: false,
      isGroup: groupIds.length > 1,
    };
    window.addEventListener("pointermove", onBookMove);
    window.addEventListener("pointerup", onBookUp);
  }

  function onBookMove(e: any) {
    const d = dragRef.current;
    if (!d || d.kind !== "book" || !containerRef.current) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (Math.abs(dx) > CLICK_THRESHOLD || Math.abs(dy) > CLICK_THRESHOLD) d.moved = true;
    if (!d.moved) return;

    const rect = containerRef.current.getBoundingClientRect();
    const relY = e.clientY - rect.top + containerRef.current.scrollTop;
    const startShelf = d.startPositions[d.mainId].shelf;

    if (d.isGroup) {
      // La saga se mueve como un bloque y puede cambiar de balda.
      const ids = new Set<string>(d.groupIds);
      let groupMinX = Infinity, groupMaxX = -Infinity;
      d.groupIds.forEach((id: string) => {
        const p = d.startPositions[id];
        const b = books.find((bk: any) => bk.id === id);
        const { w } = sizeFor(b);
        groupMinX = Math.min(groupMinX, p.x);
        groupMaxX = Math.max(groupMaxX, p.x + w);
      });
      const hoveredShelf = Math.min(SHELVES - 1, Math.max(0, Math.floor(relY / shelfH)));
      const obstacles = obstaclesOnShelf(hoveredShelf, ids);
      const delta = clampDelta(dx, groupMinX, groupMaxX, obstacles);
      const updates: any = {};
      d.groupIds.forEach((id: string) => { updates[id] = { shelf: hoveredShelf, x: d.startPositions[id].x + delta }; });
      setLayout((l: any) => ({ ...l, ...updates }));
    } else {
      const hoveredShelf = Math.min(SHELVES - 1, Math.max(0, Math.floor(relY / shelfH)));
      const b = books.find((bk: any) => bk.id === d.mainId);
      const { w } = sizeFor(b);
      let x = d.startPositions[d.mainId].x + dx;
      x = Math.max(EDGE_PADDING, Math.min(containerWidth - EDGE_PADDING - w, x));
      if (hoveredShelf === startShelf) {
        const obstacles = obstaclesOnShelf(startShelf, new Set([d.mainId]));
        const delta = clampDelta(dx, d.startPositions[d.mainId].x, d.startPositions[d.mainId].x + w, obstacles);
        x = d.startPositions[d.mainId].x + delta;
      }
      setLayout((l: any) => ({ ...l, [d.mainId]: { shelf: hoveredShelf, x } }));
    }
  }

  function onBookUp() {
    const d = dragRef.current;
    window.removeEventListener("pointermove", onBookMove);
    window.removeEventListener("pointerup", onBookUp);
    dragRef.current = null;
    if (!d) return;
    if (!d.moved && Date.now() - d.startTime < CLICK_TIME_MS) {
      onOpenBook(d.mainId);
      return;
    }
    // Al soltar, si ha quedado solapado con algún otro libro, lo reubica al hueco libre más cercano
    if (!d.isGroup) {
      const b = books.find((bk: any) => bk.id === d.mainId);
      const { w } = sizeFor(b);
      setLayout((l: any) => {
        const pos = l[d.mainId];
        if (!pos) return l;
        const fixedX = resolveOverlap(pos.shelf, d.mainId, pos.x, w);
        return { ...l, [d.mainId]: { shelf: pos.shelf, x: fixedX } };
      });
    }
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
        <button onClick={() => setShowDecorMenu((v) => !v)} style={smallOutlineBtn}>
          <Sparkles size={13} /> Decoración {showDecorMenu ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>
      {showDecorMenu && (
        <div style={{ display: "flex", gap: 6, marginBottom: 12, flexShrink: 0, flexWrap: "wrap" }}>
          {Object.entries(DECOR_ICONS).map(([kind, icon]) => <button key={kind} onClick={() => addDecor(kind)} style={smallOutlineBtn}>{icon} +</button>)}
        </div>
      )}
      <div ref={containerRef} style={{ flex: 1, overflow: "auto", position: "relative" }}>
        <div style={{ position: "relative", width: "100%", minHeight: containerH }}>
          {Array.from({ length: SHELVES }, (_, i) => (
            <div key={i} style={{ position: "absolute", left: 0, right: 0, top: (i + 1) * shelfH - 12, height: 12, background: "#5a4326", boxShadow: "0 4px 6px rgba(0,0,0,0.25)" }} />
          ))}
          {books.map((b: any) => {
            const pos = layout[b.id];
            if (!pos) return null;
            const { w, h } = sizeFor(b);
            const fontSize = fontSizeFor(b, h);
            const saga = sagas.find((s: any) => s.id === b.sagaId);
            const colors = b.colors?.length ? b.colors : [b.color];
            const background = colors.length > 1 ? `linear-gradient(180deg, ${colors.join(", ")})` : colors[0];
            return (
              <div key={b.id} onPointerDown={(e) => startBookDrag(e, b)} title={b.title} style={{ position: "absolute", left: pos.x, top: (pos.shelf + 1) * shelfH - 12 - h, cursor: "grab", width: w, height: h, background, borderRadius: "2px 4px 4px 2px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "1px 0 3px rgba(0,0,0,0.35)", paddingTop: 4, touchAction: "none" }}>
                <span style={{ width: "calc(100% - 6px)", height: "calc(100% - 12px)", overflow: "hidden", fontSize, lineHeight: 1.15, fontFamily: genreFont(b), fontWeight: 600, color: "#000", textAlign: "center", writingMode: "vertical-rl", textOrientation: "mixed", whiteSpace: "normal", wordBreak: "break-word", padding: "2px 0", textTransform: "uppercase" }}>{b.title}</span>
                {saga?.color && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 9, background: saga.color }} />}
                {b.id === lastEditedBookId && <Star size={11} color="#FFD65A" fill="#FFD65A" style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)" }} />}
              </div>
            );
          })}
          {decor.map((d: any) => (
            <div key={d.id} onPointerDown={(e) => startDecorDrag(e, d.id)} style={{ position: "absolute", left: d.x, top: d.y, fontSize: DECOR_SIZE, cursor: "grab", touchAction: "none", filter: d.kind === "luna" ? "drop-shadow(0 0 6px #F6E27A)" : "none" }}>
              <span style={{ display: "inline-block", transform: "scale(1.25)", transformOrigin: "top left" }}>{DECOR_ICONS[d.kind]}</span>
              <button onClick={(e) => { e.stopPropagation(); removeDecor(d.id); }} style={{ position: "absolute", top: -8, right: -8, background: showDecorMenu ? "rgba(10,10,14,0.6)" : "transparent", border: "none", borderRadius: "50%", width: 14, height: 14, color: showDecorMenu ? "#fff" : "transparent", fontSize: 9, cursor: showDecorMenu ? "pointer" : "default", lineHeight: "14px", transition: "opacity .2s" }}>×</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}