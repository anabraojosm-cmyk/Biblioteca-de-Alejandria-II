import { useState, useRef, useEffect, useMemo } from "react";
import { MessageSquare } from "lucide-react";
import { Modal } from "./modals";
import { SaveControl, VerticalTabs } from "./components/layout";
import { LibraryScreen } from "./pages/Library";
import { ShelfLibrary } from "./pages/Shelf";
import { BookTopBar } from "./pages/Book";
import { ChaptersTab } from "./tabs/ChaptersTab";
import {
  CharactersTab, StructureTab, CalendarTab, AppearanceTab, StoryTimelineTab,
  LocationTab, UniverseTab, LoreTab, CorkboardTab, ExportTab, BetaReaderTab,
} from "./components/tabs";
import { useLibraryActions } from "./state/actions";
import { primaryBtn } from "./styles";
import { colorForReader } from "./utils";
import { DARK, LIGHT } from "./constants";
import {
  seedUniverses, seedSagas, seedBooks, seedBookActs, seedChapters, seedCharacters,
  seedUniverseEntries, seedEvents, seedAppearances, seedStoryEvents, seedLocations,
  seedEraConfig, seedBorders, seedLore, seedBestiary, seedCork, seedIdeas, seedSurveys,
} from "./data/seeds";

function useInjectedFont() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `.no-select{-webkit-user-select:none;user-select:none;}`;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
}

function useIsMobile() {
  const [mobile, setMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 860 : false);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 860);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
}

function protagColor(light: boolean) { return light ? "#D4A017" : "#FF3FA4"; }

export default function AtelierNarrativo() {
  useInjectedFont();
  const isMobile = useIsMobile();
  const [light, setLight] = useState(false);
  const T = light ? LIGHT : DARK;
  const authorName = "Ana Bramell";

  const [universes, setUniverses] = useState(seedUniverses);
  const [sagas, setSagas] = useState(seedSagas);
  const [books, setBooks] = useState(seedBooks);
  const [bookActs, setBookActs] = useState(seedBookActs);
  const [chapters, setChapters] = useState(seedChapters);
  const [characters, setCharacters] = useState(seedCharacters);
  const [universeEntries, setUniverseEntries] = useState(seedUniverseEntries);
  const [events, setEvents] = useState(seedEvents);
  const [appearances, setAppearances] = useState(seedAppearances);
  const [storyEvents, setStoryEvents] = useState(seedStoryEvents);
  const [locations, setLocations] = useState(seedLocations);
  const [eraConfig, setEraConfig] = useState<Record<string, any>>(seedEraConfig as Record<string, any>);
  const [borders, setBorders] = useState<Record<string, any[]>>(seedBorders as Record<string, any[]>);
  const [loreEntries, setLoreEntries] = useState(seedLore);
  const [bestiary, setBestiary] = useState(seedBestiary);
  const [corkNotes, setCorkNotes] = useState(seedCork);
  const [ideas, setIdeas] = useState(seedIdeas);
  const [surveys, setSurveys] = useState(seedSurveys);
  const [relPositions, setRelPositions] = useState<any>({});
  const [shelfLayout, setShelfLayout] = useState<any>({});
  const [shelfDecor, setShelfDecor] = useState<any[]>([]);
  const [lastEditedBookId, setLastEditedBookId] = useState<string | null>(null);

  const [view, setView] = useState("library");
  const [currentBookId, setCurrentBookId] = useState<string | null>(null);
  const [tab, setTab] = useState("capitulos");

  const currentBook = books.find((b: any) => b.id === currentBookId);
  const bookSagaId = currentBook?.sagaId ?? null;
  const scopeId = bookSagaId || currentBookId;
  const scopeBooks = bookSagaId ? books.filter((b: any) => b.sagaId === bookSagaId) : books.filter((b: any) => b.id === currentBookId);

  const { openBook, addUniverse, addSaga, addBook, deleteSagaCascade, deleteUniverseCascade } = useLibraryActions({
    sagas, setSagas, books, setBooks, setBookActs, setUniverses,
    setChapters, setCharacters, setUniverseEntries, setEvents,
    setAppearances, setStoryEvents, setLocations, setLoreEntries,
    setBestiary, setIdeas, setCurrentBookId, setTab, setView, setLastEditedBookId,
  });

  const snapshotRef = useRef("");
  const lastSavedAtRef = useRef(Date.now());
  const [dirty, setDirty] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const allState = { universes, sagas, books, bookActs, chapters, characters, universeEntries, events, appearances, storyEvents, locations, eraConfig, borders, loreEntries, bestiary, corkNotes, ideas, surveys };

  useEffect(() => {
    const snap = JSON.stringify(allState);
    if (snapshotRef.current === "") snapshotRef.current = snap;
    else if (snap !== snapshotRef.current) setDirty(true);
  });

  useEffect(() => {
    const timer = setInterval(() => {
      if (dirty && Date.now() - lastSavedAtRef.current > 15 * 60 * 1000) saveNow();
    }, 30000);
    return () => clearInterval(timer);
  }, [dirty]); // eslint-disable-line

  function saveNow() {
    snapshotRef.current = JSON.stringify(allState);
    lastSavedAtRef.current = Date.now();
    setDirty(false);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2500);
  }

  const pendingBeta = useMemo(() => {
    const list: any[] = [];
    chapters.forEach((c: any) => (c.betaComments || []).forEach((bc: any) => {
      if (!bc.notified) {
        const book = books.find((b: any) => b.id === c.bookId);
        list.push({ reader: bc.reader, chapter: c.title, book: book?.title || "" });
      }
    }));
    return list;
  }, []); // eslint-disable-line

  const [showBetaNotice, setShowBetaNotice] = useState(pendingBeta.length > 0);
  function dismissBetaNotice() {
    setChapters((cs: any[]) => cs.map((c) => ({ ...c, betaComments: (c.betaComments || []).map((bc: any) => ({ ...bc, notified: true })) })));
    setShowBetaNotice(false);
  }

  const headerControls = <SaveControl dirty={dirty} savedFlash={savedFlash} onSave={saveNow} light={light} setLight={setLight} />;

  return (
    <div style={{ "--bg": T.bg, "--bg2": T.bg2, "--bg3": T.bg3, "--border": T.border, "--text": T.text, "--dim": T.dim, "--accent": T.accent, "--accentText": T.accentText, "--protag": protagColor(light), fontFamily: "'Inter', sans-serif", background: "var(--bg)", color: "var(--text)", minHeight: "640px", borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)" } as any}>
      {showBetaNotice && (
        <Modal onClose={dismissBetaNotice}>
          <div style={{ width: 340, maxWidth: "90vw" }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 17, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
              <MessageSquare size={16} color="var(--accent)" /> Nuevos comentarios de beta lectores
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {pendingBeta.map((p, i) => (
                <div key={i} style={{ fontSize: 13, color: "var(--text)", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: 10 }}>
                  <b style={{ color: colorForReader(p.reader) }}>{p.reader}</b> ha comentado en <b>{p.chapter}</b>{p.book ? ` de "${p.book}"` : ""}.
                </div>
              ))}
            </div>
            <button onClick={dismissBetaNotice} style={primaryBtn}>Cerrar</button>
          </div>
        </Modal>
      )}
      {view === "library" ? (
        <LibraryScreen
          universes={universes} sagas={sagas} setSagas={setSagas} books={books} setBooks={setBooks}
          setUniverses={setUniverses} openBook={openBook} addUniverse={addUniverse} addSaga={addSaga}
          addBook={addBook} deleteSagaCascade={deleteSagaCascade} deleteUniverseCascade={deleteUniverseCascade}
          authorName={authorName} onOpenShelf={() => setView("shelf")} headerControls={headerControls}
          isMobile={isMobile} lastEditedBookId={lastEditedBookId}
        />
      ) : view === "shelf" ? (
        <ShelfLibrary
          books={books} sagas={sagas} onBack={() => setView("library")} onOpenBook={openBook}
          isMobile={isMobile} layout={shelfLayout} setLayout={setShelfLayout} decor={shelfDecor}
          setDecor={setShelfDecor} lastEditedBookId={lastEditedBookId}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", height: "100%" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, order: isMobile ? 1 : 0 }}>
            <BookTopBar book={currentBook} onBack={() => setView("library")} headerControls={headerControls} />
            <div style={{ flex: 1, overflow: "auto", padding: isMobile ? "14px 14px" : "20px 28px" }}>
              {tab === "capitulos" && <ChaptersTab bookId={currentBookId} chapters={chapters} setChapters={setChapters} bookActs={bookActs[currentBookId!] || []} setBookActs={setBookActs} isMobile={isMobile} />}
              {tab === "personajes" && <CharactersTab sagaId={scopeId} bookId={currentBookId} books={scopeBooks} bookActs={bookActs} characters={characters} setCharacters={setCharacters} ideas={ideas} setIdeas={setIdeas} light={light} relPositions={relPositions[scopeId!] || {}} setRelPositions={(pos: any) => setRelPositions((r: any) => ({ ...r, [scopeId!]: pos }))} />}
              {tab === "estructura" && <StructureTab bookId={currentBookId} chapters={chapters} setChapters={setChapters} bookActs={bookActs} setBookActs={setBookActs} />}
              {tab === "calendario" && <CalendarTab sagaId={scopeId} characters={characters} events={events} setEvents={setEvents} />}
              {tab === "aparicion" && <AppearanceTab sagaId={scopeId} books={scopeBooks} chapters={chapters} characters={characters} appearances={appearances} setAppearances={setAppearances} />}
              {tab === "linea" && <StoryTimelineTab sagaId={scopeId} books={scopeBooks} setBooks={setBooks} storyEvents={storyEvents} setStoryEvents={setStoryEvents} characters={characters.filter((c: any) => c.sagaId === scopeId)} eraConfig={eraConfig[scopeId!]} setEraConfig={(patch: any) => setEraConfig((e: any) => ({ ...e, [scopeId!]: { ...(e[scopeId!] || { startYear: 0, suffix: "" }), ...patch } }))} />}
              {tab === "localizacion" && <LocationTab sagaId={scopeId} books={scopeBooks} chapters={chapters} characters={characters.filter((c: any) => c.sagaId === scopeId)} universeEntries={universeEntries} setUniverseEntries={setUniverseEntries} locations={locations} setLocations={setLocations} borders={borders[scopeId!] || []} setBorders={(list: any) => setBorders((f: any) => ({ ...f, [scopeId!]: list }))} />}
              {tab === "universo" && <UniverseTab sagaId={scopeId} universeEntries={universeEntries} setUniverseEntries={setUniverseEntries} />}
              {tab === "lore" && <LoreTab sagaId={scopeId} loreEntries={loreEntries} setLoreEntries={setLoreEntries} bestiary={bestiary} setBestiary={setBestiary} />}
              {tab === "pizarra" && <CorkboardTab bookId={currentBookId} corkNotes={corkNotes} setCorkNotes={setCorkNotes} />}
              {tab === "exportar" && <ExportTab book={currentBook} chapters={chapters.filter((c: any) => c.bookId === currentBookId)} characters={characters.filter((c: any) => c.sagaId === scopeId)} universeEntries={universeEntries.filter((u: any) => u.sagaId === scopeId)} bookActs={bookActs[currentBookId!] || []} />}
              {tab === "beta" && <BetaReaderTab bookId={currentBookId} chapters={chapters.filter((c: any) => c.bookId === currentBookId)} setChapters={setChapters} surveys={surveys} setSurveys={setSurveys} />}
            </div>
          </div>
          <VerticalTabs tab={tab} setTab={setTab} isMobile={isMobile} />
        </div>
      )}
    </div>
  );
}