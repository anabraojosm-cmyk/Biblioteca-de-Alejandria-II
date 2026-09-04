const uid = () => Math.random().toString(36).substr(2, 9);

export const seedUniverses = [{ id: "u1", name: "Mundo de Ébano" }];

export const seedSagas = [
  { id: "s1", name: "Las Crónicas de Ébano", universeId: "u1", color: "#7A5EA8" },
  { id: "s2", name: "El Pacto de las Mareas", universeId: "u1", color: "#4F86A8" },
];

export const seedBooks = [
  { id: "b1", sagaId: "s1", title: "El Susurro de las Cenizas", numberInSaga: 1, color: "#7c5cbf", cover: null, status: "en_proceso", genre: "Fantasía", subgenre: "Fantasía política", dateCreated: "2025-01-10", dateFinished: "", sinopsis: "Yren huye de la corte tras la caída de su casa.", narrators: "Yren Voss, Dain Ashworth", narrativePerson: "Tercera persona limitada", narrativeStartYear: 0, narrativeStartMonth: 1, narrativeStartDay: 1, narrativeEndYear: 0, narrativeEndMonth: 9, narrativeEndDay: 20 },
  { id: "b2", sagaId: "s1", title: "La Corona Rota", numberInSaga: 2, color: "#b0479a", cover: null, status: "sin_empezar", genre: "Fantasía", subgenre: "", dateCreated: "2025-06-01", dateFinished: "", sinopsis: "", narrators: "", narrativePerson: "Tercera persona limitada", narrativeStartYear: 0, narrativeStartMonth: 7, narrativeStartDay: 1, narrativeEndYear: 1, narrativeEndMonth: 8, narrativeEndDay: 15 },
  { id: "b3", sagaId: null, title: "Donde Duermen los Faros", numberInSaga: null, color: "#3d8a7a", cover: null, status: "borrador", genre: "Drama", subgenre: "", dateCreated: "2025-03-02", dateFinished: "", sinopsis: "", narrators: "", narrativePerson: "Primera persona", narrativeStartYear: null, narrativeStartMonth: null, narrativeStartDay: null, narrativeEndYear: null, narrativeEndMonth: null, narrativeEndDay: null },
  { id: "b4", sagaId: "s2", title: "La Marea Negra", numberInSaga: 1, color: "#4F86A8", cover: null, status: "borrador", genre: "Aventura", subgenre: "", dateCreated: "2025-02-01", dateFinished: "", sinopsis: "Un contrabandista se ve envuelto en un pacto ancestral.", narrators: "", narrativePerson: "Tercera persona limitada", narrativeStartYear: null, narrativeStartMonth: null, narrativeStartDay: null, narrativeEndYear: null, narrativeEndMonth: null, narrativeEndDay: null },
  { id: "b5", sagaId: "s2", title: "El Canto de las Profundidades", numberInSaga: 2, color: "#8AA85F", cover: null, status: "sin_empezar", genre: "Aventura", subgenre: "", dateCreated: "2025-04-01", dateFinished: "", sinopsis: "", narrators: "", narrativePerson: "Tercera persona limitada", narrativeStartYear: null, narrativeStartMonth: null, narrativeStartDay: null, narrativeEndYear: null, narrativeEndMonth: null, narrativeEndDay: null },
  { id: "b6", sagaId: null, title: "Cartas que Nunca Envié", numberInSaga: null, color: "#C9A24B", cover: null, status: "sin_empezar", genre: "Romance", subgenre: "", dateCreated: "2025-05-01", dateFinished: "", sinopsis: "", narrators: "", narrativePerson: "Primera persona", narrativeStartYear: null, narrativeStartMonth: null, narrativeStartDay: null, narrativeEndYear: null, narrativeEndMonth: null, narrativeEndDay: null },
];

export const seedBookActs: Record<string, any[]> = {
  b1: [{ id: "a1", name: "Acto 1", color: "#6E93C9", startOrder: 0 }, { id: "a2", name: "Acto 2", color: "#C9A24B", startOrder: 2 }, { id: "a3", name: "Acto 3", color: "#C1594A", startOrder: 4 }],
  b2: [{ id: "a1", name: "Acto 1", color: "#6E93C9", startOrder: 0 }],
  b3: [{ id: "a1", name: "Acto 1", color: "#6E93C9", startOrder: 0 }],
  b4: [{ id: "a1", name: "Acto 1", color: "#6E93C9", startOrder: 0 }],
  b5: [{ id: "a1", name: "Acto 1", color: "#6E93C9", startOrder: 0 }],
  b6: [{ id: "a1", name: "Acto 1", color: "#6E93C9", startOrder: 0 }],
};

export const seedChapters = [
  { id: "ch1", bookId: "b1", title: "El puerto de sal", pov: "Yren Voss", brief: "Yren huye de la corte por mar.", tension: 2, order: 0, content: "Yren llegó al puerto antes del amanecer, cuando el olor a sal aún podía confundirse con el de la sangre. No miró atrás.", dropCap: true, justify: true, indent: true, font: "Fraunces", readOnly: false, notes: [{ id: uid(), color: "#C9A24B", theme: "Continuidad", excerpt: "olor a sal", markId: "m1", comment: "Recurrente: usarlo como leitmotiv." }], betaComments: [] },
  { id: "ch2", bookId: "b1", title: "La última carta", pov: "Dain Ashworth", brief: "Dain recibe noticias del frente.", tension: 3, order: 1, content: "La carta decía muy poco, pero lo que callaba pesaba más que lo escrito.", dropCap: true, justify: true, indent: true, font: "Fraunces", readOnly: false, notes: [], betaComments: [{ id: uid(), reader: "Marta", comment: "Me encanta esta línea, ¡muy intrigante!", excerpt: "pesaba más que lo escrito", notified: false }] },
  { id: "ch3", bookId: "b1", title: "Cenizas en el viento", pov: "Yren Voss", brief: "El cerco se cierra sobre la ciudad.", tension: 4, order: 2, content: "El humo cubría la ciudad entera.", dropCap: true, justify: true, indent: true, font: "Fraunces", readOnly: false, notes: [], betaComments: [] },
  { id: "ch4", bookId: "b1", title: "El precio del silencio", pov: "Dain Ashworth", brief: "Dain descubre la traición.", tension: 3, order: 3, content: "Dain leyó el nombre dos veces antes de creerlo.", dropCap: true, justify: true, indent: true, font: "Fraunces", readOnly: false, notes: [], betaComments: [] },
  { id: "ch5", bookId: "b1", title: "La Ciudadela cae", pov: "Yren Voss", brief: "Enfrentamiento final del acto.", tension: 5, order: 4, content: "La sal blanca se tiñó de rojo esa noche.", dropCap: true, justify: true, indent: true, font: "Fraunces", readOnly: false, notes: [], betaComments: [] },
];

export const seedCharacters = [
  { id: "c1", sagaId: "s1", order: 0, name: "Yren Voss", nickname: "La Sombra del Puerto", customFamilyTag: "", photo: null, emblem: null, importance: "Principal", lineageGroup: "Casa Voss", powerLevel: 6, natureType: "Humano", natureSubtype: "", natureSubtypeOther: "", natureEffect: "", isMilitary: false, militaryRank: "", isNoble: false, nobleTitle: "", isDead: false, deathBookId: "", deathNote: "", age: "27", birthday: "03-14", birthplace: "Puerto Cendal", civilStatus: "Soltera", title: "Ex-dama de corte", occupation: "Espía", physicalHeight: "1.68", physicalDesc: "Cabello negro corto, cicatriz en la ceja izquierda.", role: "Protagonista", motivation: "Vengar a su hermano", virtues: "Lealtad, astucia", defects: "Desconfianza extrema, orgullo", weakness: "Perder el control", personality: "Reservada, calculadora, irónica", itemsCarried: "Daga de su hermano", importantItems: "Carta sellada del Canciller", hobbies: "Ajedrez, tallar madera", trivia: "Nunca duerme dos noches en la misma habitación", statusByBook: { b1: "Recién huida de la corte, desconfía de todos.", b2: "Al mando de la resistencia, endurecida por la guerra." }, roleByBook: { b1: "Protagonista", b2: "Protagonista" }, relationships: [{ id: uid(), targetId: "c2", type: "amor", note: "Se conocieron en el exilio" }, { id: uid(), targetId: "c2", type: "companero", note: "Luchan juntas la resistencia" }, { id: uid(), targetId: "c3", type: "enemistad", note: "Mató a su hermano" }, { id: uid(), targetId: "c4", type: "hijo", note: "" }, { id: uid(), targetId: "c6", type: "hermano", note: "" }] },
  { id: "c2", sagaId: "s1", order: 1, name: "Dain Ashworth", nickname: "El Comandante Gris", customFamilyTag: "", photo: null, emblem: null, importance: "Principal", lineageGroup: "Casa Ashworth", powerLevel: 6, natureType: "Humano", natureSubtype: "", natureSubtypeOther: "", natureEffect: "", isMilitary: true, militaryRank: "Comandante", isNoble: true, nobleTitle: "Vizconde/sa", isDead: false, deathBookId: "", deathNote: "", age: "30", birthday: "07-02", birthplace: "Ciudadela de Sal", civilStatus: "Soltero", title: "Comandante exiliado", occupation: "Militar", physicalHeight: "1.85", physicalDesc: "Complexión fuerte, cicatriz en el antebrazo.", role: "Protagonista", motivation: "Restaurar el reino a su pueblo", virtues: "Valentía, empatía", defects: "Impulsividad", weakness: "Repetir los errores de su padre", personality: "Idealista, cálido, directo", itemsCarried: "Espada de su padre", importantItems: "", hobbies: "Cabalgar", trivia: "", statusByBook: { b1: "Comandante exiliado, aún cree en Yren.", b2: "Roto por la guerra, pero sigue a su lado." }, roleByBook: { b1: "Protagonista", b2: "Secundario" }, relationships: [{ id: uid(), targetId: "c1", type: "amor", note: "" }, { id: uid(), targetId: "c1", type: "companero", note: "" }, { id: uid(), targetId: "c3", type: "aliado", note: "Antiguos hermanos de armas, ahora enfrentados" }, { id: uid(), targetId: "c4", type: "hijo", note: "" }, { id: uid(), targetId: "c5", type: "hermano", note: "" }] },
  { id: "c3", sagaId: "s1", order: 2, name: "Canciller Rhoswen", nickname: "", customFamilyTag: "", photo: null, emblem: null, importance: "Secundario", lineageGroup: "", powerLevel: 9, natureType: "Sobrenatural", natureSubtype: "Otro", natureSubtypeOther: "Ser inmortal ligado a un juramento", natureEffect: "No envejece; pierde poder si miente.", isMilitary: false, militaryRank: "", isNoble: true, nobleTitle: "Duque/sa", isDead: true, deathBookId: "b1", deathNote: "Muere al final del Acto 3.", age: "58 (aparenta 40)", birthday: "11-30", birthplace: "Desconocido", civilStatus: "Viudo", title: "Canciller", occupation: "Gobierno", physicalHeight: "1.78", physicalDesc: "Porte rígido, ojos grises.", role: "Antagonista", motivation: "Orden a cualquier precio", virtues: "Disciplina", defects: "Frialdad", weakness: "El caos", personality: "Frío, meticuloso, se cree justo", itemsCarried: "Anillo de sello", importantItems: "El Silencio (juramento)", hobbies: "", trivia: "", statusByBook: { b1: "En la sombra, moviendo hilos.", b2: "Al descubierto, acorralado." }, roleByBook: { b1: "Antagonista", b2: "Antagonista" }, relationships: [{ id: uid(), targetId: "c1", type: "enemistad", note: "" }] },
  { id: "c4", sagaId: "s1", order: 3, name: "Elara Voss-Ashworth", nickname: "La Pequeña Ceniza", customFamilyTag: "", photo: null, emblem: null, importance: "Ocasional", lineageGroup: "Casa Voss", powerLevel: 2, natureType: "Humano", natureSubtype: "", natureSubtypeOther: "", natureEffect: "", isMilitary: false, militaryRank: "", isNoble: false, nobleTitle: "", isDead: false, deathBookId: "", deathNote: "", age: "3", birthday: "01-05", birthplace: "Bosque de Ceniza", civilStatus: "-", title: "", occupation: "", physicalHeight: "0.95", physicalDesc: "Ojos grises como su padre.", role: "Hija de los protagonistas", motivation: "", virtues: "", defects: "", weakness: "", personality: "Curiosa", itemsCarried: "", importantItems: "", hobbies: "", trivia: "", statusByBook: { b2: "Crece escondida en el campamento de la resistencia." }, roleByBook: {}, relationships: [{ id: uid(), targetId: "c1", type: "padre", note: "" }, { id: uid(), targetId: "c2", type: "padre", note: "" }] },
  { id: "c5", sagaId: "s1", order: 4, name: "Bram Ashworth", nickname: "", customFamilyTag: "", photo: null, emblem: null, importance: "Ocasional", lineageGroup: "Casa Ashworth", powerLevel: 4, natureType: "Humano", natureSubtype: "", natureSubtypeOther: "", natureEffect: "", isMilitary: true, militaryRank: "Capitán", isNoble: true, nobleTitle: "Vizconde/sa", isDead: false, deathBookId: "", deathNote: "", age: "26", birthday: "09-18", birthplace: "Ciudadela de Sal", civilStatus: "Soltero", title: "Capitán de la guardia", occupation: "Militar", physicalHeight: "1.79", physicalDesc: "Más delgado que su hermano.", role: "Hermano menor de Dain", motivation: "Demostrar su valía", virtues: "Lealtad", defects: "Envidia", weakness: "Comparación con Dain", personality: "Ambicioso, reservado", itemsCarried: "", importantItems: "", hobbies: "", trivia: "", statusByBook: { b1: "Sirve todavía al Canciller." }, roleByBook: { b1: "Secundario" }, relationships: [{ id: uid(), targetId: "c2", type: "hermano", note: "" }] },
  { id: "c6", sagaId: "s1", order: 5, name: "Sera Voss", nickname: "La Callada", customFamilyTag: "", photo: null, emblem: null, importance: "Secundario", lineageGroup: "Casa Voss", powerLevel: 4, natureType: "Cercano a lo sobrenatural", natureSubtype: "", natureSubtypeOther: "", natureEffect: "Sueña fragmentos del futuro.", isMilitary: false, militaryRank: "", isNoble: false, nobleTitle: "", isDead: false, deathBookId: "", deathNote: "", age: "24", birthday: "05-22", birthplace: "Puerto Cendal", civilStatus: "Soltera", title: "", occupation: "Curandera", physicalHeight: "1.63", physicalDesc: "Idéntica a Yren, pero con los ojos claros.", role: "Hermana de Yren", motivation: "Proteger a su hermana", virtues: "Paciencia", defects: "Se guarda secretos", weakness: "Sus visiones la debilitan", personality: "Serena, observadora", itemsCarried: "", importantItems: "", hobbies: "Herboristería", trivia: "", statusByBook: { b1: "Se queda en Puerto Cendal, oculta." }, roleByBook: { b1: "Secundario" }, relationships: [{ id: uid(), targetId: "c1", type: "hermano", note: "" }] },
];

export const seedUniverseEntries = [
  { id: "pl1", sagaId: "s1", category: "Lugares", title: "La Ciudadela de Sal", content: "Fortaleza tallada en un acantilado de sal blanca. Sede del Canciller.", tags: ["fortaleza"], parentId: null, localX: 50, localY: 50, posNS: 6, posEW: 2, nearRiver: false, nearSea: true, nearMountain: true, nearLake: false, nearVolcano: false, nearCamp: false, isSupernatural: false, isCapital: true, isImportantCourt: true, isIsland: false, kingdomName: "" },
  { id: "pl2", sagaId: "s1", category: "Lugares", title: "Puerto Cendal", content: "Puerto comercial al sur del reino, punto de fuga de Yren.", tags: [], parentId: null, localX: 50, localY: 50, posNS: -7, posEW: 0, nearRiver: false, nearSea: true, nearMountain: false, nearLake: false, nearVolcano: false, nearCamp: false, isSupernatural: false, isCapital: false, isImportantCourt: false, isIsland: false, kingdomName: "" },
  { id: "pl2a", sagaId: "s1", category: "Lugares", title: "Muelle Viejo", content: "Zona portuaria donde atracan los barcos de contrabando.", tags: [], parentId: "pl2", localX: 30, localY: 40, posNS: 0, posEW: 0, nearRiver: false, nearSea: false, nearMountain: false, nearLake: false, nearVolcano: false, nearCamp: false, isSupernatural: false, isCapital: false, isImportantCourt: false, isIsland: false, kingdomName: "" },
  { id: "pl2b", sagaId: "s1", category: "Lugares", title: "Mercado de Especias", content: "El corazón comercial de Puerto Cendal.", tags: [], parentId: "pl2", localX: 65, localY: 55, posNS: 0, posEW: 0, nearRiver: false, nearSea: false, nearMountain: false, nearLake: false, nearVolcano: false, nearCamp: false, isSupernatural: false, isCapital: false, isImportantCourt: false, isIsland: false, kingdomName: "" },
  { id: "pl2a1", sagaId: "s1", category: "Lugares", title: "Taberna La Sirena Rota", content: "Punto de encuentro de espías y contrabandistas.", tags: [], parentId: "pl2a", localX: 50, localY: 50, posNS: 0, posEW: 0, nearRiver: false, nearSea: false, nearMountain: false, nearLake: false, nearVolcano: false, nearCamp: false, isSupernatural: false, isCapital: false, isImportantCourt: false, isIsland: false, kingdomName: "" },
  { id: "pl3", sagaId: "s1", category: "Lugares", title: "Bosque de Ceniza", content: "Bosque quemado tras la Guerra del Silencio, refugio de la resistencia.", tags: ["refugio"], parentId: null, localX: 50, localY: 50, posNS: 0, posEW: -6, nearRiver: true, nearSea: false, nearMountain: false, nearLake: true, nearVolcano: false, nearCamp: true, isSupernatural: true, isCapital: false, isImportantCourt: false, isIsland: false, kingdomName: "" },
  { id: "pl4", sagaId: "s1", category: "Lugares", title: "Ciudad de Cendal (corte)", content: "Capital del reino, sede de la antigua corte de Yren.", tags: [], parentId: null, localX: 50, localY: 50, posNS: 5, posEW: 5, nearRiver: true, nearSea: false, nearMountain: false, nearLake: false, nearVolcano: false, nearCamp: false, isSupernatural: false, isCapital: true, isImportantCourt: true, isIsland: false, kingdomName: "" },
  { id: "pl5", sagaId: "s1", category: "Lugares", title: "Paso de Hierro", content: "Frontera montañosa con el reino vecino.", tags: [], parentId: null, localX: 50, localY: 50, posNS: 8, posEW: 6, nearRiver: false, nearSea: false, nearMountain: true, nearLake: false, nearVolcano: true, nearCamp: false, isSupernatural: false, isCapital: false, isImportantCourt: false, isIsland: false, kingdomName: "" },
  { id: "pl6", sagaId: "s1", category: "Lugares", title: "Islas Grises", content: "Archipiélago al otro lado del mar, fuera del reino.", tags: ["exterior"], parentId: null, localX: 50, localY: 50, posNS: -4, posEW: 17, nearRiver: false, nearSea: true, nearMountain: false, nearLake: false, nearVolcano: false, nearCamp: false, isSupernatural: false, isCapital: false, isImportantCourt: false, isIsland: true, kingdomName: "Reino de las Mareas" },
  { id: "rc1", sagaId: "s1", category: "Religión / cultos", title: "El Culto del Silencio", content: "Orden religiosa que venera el juramento como forma de poder.", tags: [] },
  { id: "dg1", sagaId: "s1", category: "Dioses", title: "Vessa, la que Calla", content: "Diosa del secreto y las promesas.", domain: "Secretos, juramentos, silencio", symbol: "Una llave sin cerradura", personality: "Justa pero implacable con quien rompe su palabra", image: null, tags: [] },
  { id: "ob1", sagaId: "s1", category: "Objetos", title: "El Silencio (juramento)", content: "Reliquia que ata el poder del Canciller a su palabra.", objectKind: "Mágico", image: null, tags: [] },
];

export const seedEvents = [
  { id: uid(), sagaId: "s1", title: "Caída de la corte de Cendal", category: "politica_interior", month: 3, day: 12, continuous: false, annual: false },
  { id: uid(), sagaId: "s1", title: "Guerra del Silencio", category: "militar", month: 5, day: 1, continuous: true, annual: false },
  { id: uid(), sagaId: "s1", title: "Festival de las Cenizas", category: "religioso", month: 3, day: 20, continuous: false, annual: true },
  { id: uid(), sagaId: "s1", title: "Concepción de Elara", category: "concepcion", month: 4, day: 2, continuous: false, annual: false },
  { id: uid(), sagaId: "s1", title: "Muerte del Canciller Rhoswen", category: "muerte", month: 9, day: 30, continuous: false, annual: false },
];

export const seedAppearances = [
  { id: uid(), sagaId: "s1", characterId: "c1", chapterId: "ch1", category: "cercano" },
  { id: uid(), sagaId: "s1", characterId: "c2", chapterId: "ch2", category: "militar" },
];

export const seedStoryEvents = [
  { id: uid(), sagaId: "s1", order: 0, yearOffset: 0, month: 3, day: 12, category: "politica_interior", title: "Caída de la corte de Cendal", description: "El Canciller Rhoswen orquesta el golpe que expulsa a la Casa Voss de la corte.", highlightFor: ["c1"] },
  { id: uid(), sagaId: "s1", order: 1, yearOffset: 0, month: 6, day: 1, category: "militar", title: "Estalla la Guerra del Silencio", description: "El reino se divide entre los leales al Canciller y la resistencia liderada por Dain.", highlightFor: ["c2"] },
  { id: uid(), sagaId: "s1", order: 2, yearOffset: 1, month: 8, day: 4, category: "nacimiento", title: "Nace Elara", description: "En el Bosque de Ceniza, escondida de la guerra.", highlightFor: ["c1", "c2", "c4"] },
  { id: uid(), sagaId: "s1", order: 3, yearOffset: 2, month: 3, day: 30, category: "muerte", title: "Cae la Ciudadela de Sal", description: "El Canciller Rhoswen muere en el asedio final.", highlightFor: ["c3"] },
];

export const seedLocations = [
  { id: uid(), sagaId: "s1", chapterId: "ch1", characterId: "c1", placeId: "pl2" },
  { id: uid(), sagaId: "s1", chapterId: "ch1", characterId: "c2", placeId: "pl4" },
  { id: uid(), sagaId: "s1", chapterId: "ch2", characterId: "c2", placeId: "pl4" },
  { id: uid(), sagaId: "s1", chapterId: "ch3", characterId: "c1", placeId: "pl1" },
  { id: uid(), sagaId: "s1", chapterId: "ch3", characterId: "c3", placeId: "pl1" },
  { id: uid(), sagaId: "s1", chapterId: "ch4", characterId: "c2", placeId: "pl3" },
  { id: uid(), sagaId: "s1", chapterId: "ch5", characterId: "c1", placeId: "pl1" },
  { id: uid(), sagaId: "s1", chapterId: "ch5", characterId: "c2", placeId: "pl1" },
  { id: uid(), sagaId: "s1", chapterId: "ch5", characterId: "c3", placeId: "pl1" },
];

export const seedEraConfig = { s1: { startYear: 389, suffix: "a.f.s" } };

export const seedBorders = { s1: [{ id: "fr1", name: "Reino de Ébano", color: "#C9A24B", points: [[30, 20], [70, 15], [85, 45], [75, 80], [40, 88], [15, 55]] }] };

export const seedLore = [
  { id: uid(), sagaId: "s1", title: "El Silencio", kind: "Magia/poderes", description: "Forma de magia basada en juramentos: cada promesa rota drena poder de quien la hizo.", fn: "Sella pactos vinculantes", inventor: "Desconocido, atribuido a Vessa", materials: "Sangre y palabra", era: "Desde la Era de Ceniza" },
  { id: uid(), sagaId: "s1", title: "La Resistencia de Ceniza", kind: "Facción/grupo", description: "Grupo rebelde liderado por Dain Ashworth tras la caída de la corte.", fn: "Oponerse al Canciller", inventor: "", materials: "", era: "Año 1 en adelante" },
];

export const seedBestiary = [
  { id: uid(), sagaId: "s1", name: "Lobo de Ceniza", species: "Bestia mágica / lobo", danger: "Medio", image: null, description: "Lobo con pelaje gris ceniza, caza en manadas cerca del Bosque de Ceniza. Sensible al fuego." },
  { id: uid(), sagaId: "s1", name: "El Silente", species: "Espíritu / guardián", danger: "Jefe", image: null, description: "Guardián invocado por el juramento del Canciller. Solo puede ser dañado por quien haya roto una promesa." },
];

export const seedCork = { b1: [{ id: uid(), text: "Recordar: el color de ojos de Sera cambia según sus visiones.", color: "#F5E6A8", x: 40, y: 30, shape: "rect", size: "M", z: 1 }, { id: uid(), text: "Revisar ritmo del Acto 2 — ¿demasiado lento?", color: "#F7C9C9", x: 260, y: 70, shape: "circle", size: "M", z: 2 }] };

export const seedIdeas = [
  { id: uid(), sagaId: "s1", text: "A Dain le viene un recuerdo sobre ropa rota cuando escucha música.", characterId: "c2", bookId: "b1", actId: "a2" },
  { id: uid(), sagaId: "s1", text: "\"El silencio también es una forma de mentir.\" — posible línea para Yren.", characterId: "c1", bookId: "", actId: "" },
];

export const seedSurveys: any[] = [];