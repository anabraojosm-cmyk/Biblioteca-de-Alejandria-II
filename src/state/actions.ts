import { uid } from "../utils";

export function useLibraryActions({
  sagas, setSagas, setBooks, setBookActs, setUniverses,
  setChapters, setCharacters, setUniverseEntries, setEvents,
  setAppearances, setStoryEvents, setLocations, setLoreEntries,
  setBestiary, setIdeas, books, setCurrentBookId, setTab, setView, setLastEditedBookId,
}: any) {
  function openBook(id: string) {
    setCurrentBookId(id); setTab("capitulos"); setView("book"); setLastEditedBookId(id);
  }

  function addUniverse() {
    const name = prompt("Nombre del universo:");
    if (name) setUniverses((u: any[]) => [...u, { id: uid(), name }]);
  }

  function addSaga(universeId: string | null) {
    const name = prompt("Nombre de la saga:");
    if (!name) return;
    if (universeId) {
      const siblings = sagas.filter((s: any) => s.universeId === universeId);
      if (siblings.length > 0) {
        const share = confirm(`Este universo ya tiene otras sagas.\n\n¿Quieres que "${name}" comparta personajes con las sagas existentes de este universo? (Aceptar = compartir, Cancelar = mantenerla independiente)`);
        setSagas((s: any[]) => [...s, { id: uid(), name, universeId, color: null, sharesWith: share ? siblings.map((x: any) => x.id) : [] }]);
        return;
      }
    }
    setSagas((s: any[]) => [...s, { id: uid(), name, universeId: universeId || null, color: null, sharesWith: [] }]);
  }

  function addBook(sagaId: string | null) {
    const title = prompt("Título del libro:");
    if (!title) return;
    const n = books.filter((b: any) => b.sagaId === sagaId).length + 1;
    const nb = {
      id: uid(), sagaId, title, numberInSaga: sagaId ? n : null,
      color: "#7c5cbf", colors: ["#7c5cbf"], cover: null, status: "sin_empezar", genre: "", subgenre: "",
      dateCreated: new Date().toISOString().slice(0, 10), dateFinished: "", sinopsis: "",
      narrators: "", narrativePerson: "",
      narrativeStartYear: null, narrativeStartMonth: null, narrativeStartDay: null,
      narrativeEndYear: null, narrativeEndMonth: null, narrativeEndDay: null,
    };
    setBooks((b: any[]) => [...b, nb]);
    setBookActs((a: any) => ({ ...a, [nb.id]: [{ id: uid(), name: "Acto 1", color: "#6E93C9", startOrder: 0 }] }));
    openBook(nb.id);
  }

  function deleteSagaCascade(sagaId: string, deleteBooksToo: boolean) {
    const sagaBookIds = books.filter((b: any) => b.sagaId === sagaId).map((b: any) => b.id);
    if (deleteBooksToo) {
      setBooks((b: any[]) => b.filter((x) => x.sagaId !== sagaId));
      setChapters((c: any[]) => c.filter((x) => !sagaBookIds.includes(x.bookId)));
    } else {
      setBooks((b: any[]) => b.map((x) => (x.sagaId === sagaId ? { ...x, sagaId: null, numberInSaga: null } : x)));
    }
    setSagas((s: any[]) => s.filter((x) => x.id !== sagaId));
    setCharacters((c: any[]) => c.filter((x) => x.sagaId !== sagaId));
    setUniverseEntries((u: any[]) => u.filter((x) => x.sagaId !== sagaId));
    setEvents((e: any[]) => e.filter((x) => x.sagaId !== sagaId));
    setAppearances((a: any[]) => a.filter((x) => x.sagaId !== sagaId));
    setStoryEvents((s: any[]) => s.filter((x) => x.sagaId !== sagaId));
    setLocations((l: any[]) => l.filter((x) => x.sagaId !== sagaId));
    setLoreEntries((l: any[]) => l.filter((x) => x.sagaId !== sagaId));
    setBestiary((b: any[]) => b.filter((x) => x.sagaId !== sagaId));
    setIdeas((i: any[]) => i.filter((x) => x.sagaId !== sagaId));
  }

  function deleteUniverseCascade(universeId: string, deleteEverything: boolean) {
    const uSagas = sagas.filter((s: any) => s.universeId === universeId).map((s: any) => s.id);
    if (deleteEverything) uSagas.forEach((sid: string) => deleteSagaCascade(sid, true));
    else setSagas((s: any[]) => s.map((x) => (x.universeId === universeId ? { ...x, universeId: null } : x)));
    setUniverses((u: any[]) => u.filter((x) => x.id !== universeId));
  }

  function deleteBook(bookId: string) {
    setBooks((items: any[]) => items.filter((book) => book.id !== bookId));
    setBookActs((acts: any) => {
      const next = { ...acts };
      delete next[bookId];
      return next;
    });
    setChapters((items: any[]) => {
      const ids = items.filter((chapter) => chapter.bookId === bookId).map((chapter) => chapter.id);
      setAppearances((appearances: any[]) => appearances.filter((item) => !ids.includes(item.chapterId)));
      return items.filter((chapter) => chapter.bookId !== bookId);
    });
    setCurrentBookId((current: string | null) => current === bookId ? null : current);
    setView((current: string) => current === "book" ? "library" : current);
  }

  return { openBook, addUniverse, addSaga, addBook, deleteSagaCascade, deleteUniverseCascade, deleteBook };
}