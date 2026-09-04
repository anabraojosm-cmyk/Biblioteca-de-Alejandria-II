export const REL_TYPES: Record<string, { label: string; color: string; closeness: string }> = {
  amistad: { label: "Amistad", color: "#C9A24B", closeness: "buena" },
  enemistad: { label: "Enemistad", color: "#FF3B30", closeness: "mala" },
  amor: { label: "Pareja / amor", color: "#C06E97", closeness: "buena" },
  familia: { label: "Familia (otro vínculo)", color: "#8AA85F", closeness: "buena" },
  padre: { label: "Es su padre/madre", color: "#1E6E4A", closeness: "buena" },
  hijo: { label: "Es su hijo/a", color: "#4FB8C9", closeness: "buena" },
  hermano: { label: "Es su hermano/a", color: "#B98CD9", closeness: "buena" },
  aliado: { label: "Aliado / socio", color: "#6E93C9", closeness: "buena" },
  guardia: { label: "Guardia / siervo de", color: "#9C8B5E", closeness: "buena" },
  mala_amistad: { label: "Mala amistad", color: "#A8683F", closeness: "mala" },
  mentor: { label: "Profesor / guía / maestro", color: "#4FA0A8", closeness: "buena" },
  protector: { label: "Protector", color: "#4F86A8", closeness: "buena" },
  companero: { label: "Compañero", color: "#D97F3D", closeness: "buena" },
  mejor_amigo: { label: "Mejor amigo/a", color: "#E58F65", closeness: "buena" },
  alma_gemela: { label: "Alma gemela / MATE", color: "#D85C9A", closeness: "buena" },
  matrimonio: { label: "Matrimonio", color: "#B8893D", closeness: "buena" },
  prometido: { label: "Prometido/a", color: "#C06E97", closeness: "buena" },
  divorcio: { label: "Divorcio", color: "#8A6878", closeness: "mala" },
  tio_sobrino: { label: "Tío/a - sobrino/a", color: "#739B71", closeness: "buena" },
  abuelo_nieta: { label: "Abuelo/a - nieto/a", color: "#668A9B", closeness: "buena" },
  primo: { label: "Primo/a", color: "#8C78B8", closeness: "buena" },
  socio_enemigo: { label: "Socio enemigo", color: "#B35A4A", closeness: "mala" },
};
export const REL_RECIPROCAL: Record<string, string> = { guardia: "protector", padre: "hijo", hijo: "padre" };
export const FAMILY_REL_KEYS = ["padre", "hijo", "hermano", "familia", "tio_sobrino", "abuelo_nieta", "primo"];

export const UNIVERSE_CATEGORIES = ["Lugares", "Reglas y magia", "Historia", "Facciones", "Religión / cultos", "Dioses", "Objetos", "Otros"];
export const IMPORTANCE = ["Principal", "Secundario", "Ocasional"];
export const NATURE_TYPES = ["Humano", "Sobrenatural", "Cercano a lo sobrenatural"];
export const NATURE_SUBTYPES = ["Vampiro", "Hada/Fae", "Demonio", "Deidad", "Espíritu/Fantasma", "Bruja/Mago", "Metamorfo", "Elemental", "Elfo", "Cambiaformas", "Monstruo", "Ogro", "Orco", "Hombre lobo", "Sirena", "Oráculo", "Vidente", "Otro"];
export const MILITARY_RANKS = ["Gran Mariscal", "General", "Comandante", "Capitán", "Sargento", "Soldado", "Recluta"];
export const NOBLE_TITLES = ["Barón/esa", "Vizconde/sa", "Conde/sa", "Marqués/a", "Duque/sa", "Príncipe/sa", "Rey/Reina"];
export const GENRES = ["Fantasía", "Romance", "Ciencia ficción", "Misterio", "Thriller", "Histórica", "Terror", "Drama", "Aventura", "Otro"];
export const NARRATIVE_PERSON = ["Primera persona", "Segunda persona", "Tercera persona limitada", "Tercera persona omnisciente"];
export const OBJECT_KINDS = ["Normal", "Arma", "Mágico", "Divino / de dioses"];

export const STATUS: Record<string, { label: string; color: string }> = {
  sin_empezar: { label: "Sin empezar", color: "#8b8672" },
  en_proceso: { label: "En proceso", color: "#6E93C9" },
  borrador: { label: "Borrador", color: "#C9A24B" },
  finalizado: { label: "Finalizado", color: "#5FA98C" },
  en_correccion: { label: "En corrección", color: "#C1594A" },
  cancelado: { label: "Cancelado", color: "#5c5a53" },
};

export const COLOR_PRESETS = [
  "#7c5cbf", "#b0479a", "#3d8a7a", "#C1594A", "#4F86A8", "#8AA85F", "#C9A24B", "#7A5EA8",
  "#4F7BB0", "#A8683F", "#E8C547", "#D97F3D", "#F5F3EB", "#8B8B85", "#2B2A27", "#4FB8C9",
  "#1F3A63", "#8C1F1F", "#3B2F63", "#6B3E26", "#A63D40", "#D26A3A", "#E09F3E", "#F2D479",
  "#B7C96B", "#4B7F52", "#2C9C86", "#72C6B2", "#3D7EA6", "#86BBD8", "#496A9C", "#6D597A",
  "#C08497", "#E5989B", "#F28482", "#F6BD60", "#9B5DE5", "#00BBF9",
];
export const COLOR_NAMES: Record<string, string> = { "#E8C547": "Amarillo", "#D97F3D": "Naranja", "#F5F3EB": "Blanco", "#8B8B85": "Gris", "#2B2A27": "Negro", "#4FB8C9": "Cian", "#1F3A63": "Azul oscuro", "#8C1F1F": "Rojo fuerte" };
export const HIGHLIGHTER_COLORS = ["rgba(246,226,122,0.35)", "rgba(246,169,169,0.35)", "rgba(169,216,246,0.35)", "rgba(185,240,176,0.35)", "rgba(227,185,240,0.35)", "rgba(246,201,138,0.35)"];

export const EVENT_CATEGORIES: Record<string, { label: string; color: string }> = {
  politica_exterior: { label: "Política exterior", color: "#6E93C9" },
  politica_interior: { label: "Política interior", color: "#4F7BB0" },
  religioso: { label: "Religioso", color: "#C9A24B" },
  militar: { label: "Militar", color: "#C1594A" },
  romance: { label: "Romance", color: "#C06E97" },
  nacimiento: { label: "Nacimiento", color: "#5FA98C" },
  concepcion: { label: "Concepción", color: "#E8A0C4" },
  muerte: { label: "Muerte", color: "#8a8a8a" },
  magia_luz: { label: "Mágico (luz)", color: "#E3D28A" },
  magia_oscura: { label: "Mágico (oscuridad)", color: "#7A5EA8" },
  mencion: { label: "Mención otro libro", color: "#77746a" },
  secreto: { label: "Secreto", color: "#9b8fd6" },
  aprendizaje: { label: "Aprendizaje", color: "#5C8AA0" },
};

export const APPEARANCE_CATEGORIES: Record<string, { label: string; color: string }> = {
  militar: { label: "Militar", color: "#C1594A" },
  nobleza: { label: "Nobleza", color: "#C9A24B" },
  religion: { label: "Religión", color: "#E3D28A" },
  sobrenatural: { label: "Sobrenatural", color: "#7A5EA8" },
  cercano: { label: "Cercano a lo sobrenatural", color: "#6E93C9" },
  cultura: { label: "Cultura", color: "#5FA98C" },
};

export const TENSION_LEVELS = [
  { level: 0, label: "Punto de mayor bajón en el prota", desc: "El personaje principal enfrenta su momento más bajo, con poco o ningún progreso." },
  { level: 1, label: "Desarrollo de trama", desc: "Se construye el contexto, el mundo y las motivaciones. Ritmo tranquilo." },
  { level: 2, label: "Trama conflictiva", desc: "Aparecen los primeros obstáculos o roces entre personajes." },
  { level: 3, label: "Conflicto abierto", desc: "El problema central se enfrenta directamente, sin vuelta atrás." },
  { level: 4, label: "Cierre de capítulo impactante", desc: "Un giro, revelación o cliffhanger que golpea al lector." },
  { level: 5, label: "Locura / clímax", desc: "Punto de máxima tensión: todo se desborda." },
  { level: 6, label: "Punto de no retorno", desc: "La situación se vuelve irreversible, con consecuencias importantes en la historia." },
];

export const LORE_TYPES = ["Magia/poderes", "Facción/grupo", "Religión/culto", "Leyenda/profecía", "Lugar/territorio", "Objeto/artefacto", "Tecnología/invento", "Otro"];
export const BESTIARY_DANGER = ["Bajo", "Medio", "Alto", "Jefe"];
export const BESTIARY_DANGER_COLOR: Record<string, string> = { Bajo: "#5FA98C", Medio: "#C9A24B", Alto: "#C1594A", Jefe: "#7A1F1F" };
export const CORK_COLORS = ["#F5E6A8", "#F7C9C9", "#C9E4C5", "#C9DFF7", "#E4C9F7", "#F7E0C9"];
export const CORK_SHAPES = ["rect", "circle", "cloud"];
export const CORK_SIZES: Record<string, number> = { S: 110, M: 150, L: 200, XL: 260, XXL: 340 };
export const DECOR_ICONS: Record<string, string> = { vela: "🕯️", gato: "🐈", planta: "🪴", luna: "🌕", "luna 2": "🌑", "arbol navidad": "🎄", "reloj arena": "⌛", "reloj": "🕰️", "corona": "👑", "bola de cristal": "🔮", "bola disco":"🪩", "saturno":"🪐","cara viento":"🌬️" };

export const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
export const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const READER_COLORS = ["#5FA98C", "#6E93C9", "#C06E97", "#C9A24B", "#7A5EA8", "#4FA0A8", "#D97F3D", "#4FB8C9"];

export const NOTE_THEMES = ["Continuidad", "Ritmo", "Estilo", "Investigar", "Lo quitaría"];
export const NOTE_COLORS: Record<string, string> = { "Continuidad": "#C9A24B", "Ritmo": "#C1594A", "Estilo": "#6E93C9", "Investigar": "#5FA98C", "Lo quitaría": "#8B4A6B" };

export const DARK = { bg: "#15161d", bg2: "#191a22", bg3: "#101117", border: "#282a38", text: "#EDE9DD", dim: "#77746a", accent: "#C9A24B", accentText: "#1c1712" };
export const LIGHT = { bg: "#FAF6EC", bg2: "#FFFFFF", bg3: "#F1EBDC", border: "#E1D9C5", text: "#2B2A25", dim: "#948F79", accent: "#3E6FA8", accentText: "#FFFFFF" };

export const RIVER_COLOR = "#61aebb";
export const SEA_COLORS = ["#154360", "#1b6372", "#2897a6", "#5de2e0", "#117864"];
export const MOUNTAIN_LEVELS: Record<number, { label: string; color: string; peakColor: string }> = {
  1: { label: "Baja", color: "#1c4d2e", peakColor: "#1d542e" },
  2: { label: "Media", color: "#6B5B4F", peakColor: "#8A7A6C" },
  3: { label: "Alta", color: "#5A5A6E", peakColor: "#F1F1F6" },
};