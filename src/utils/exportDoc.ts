import { Document, Packer, Paragraph, TextRun, HeadingLevel, ShadingType, AlignmentType } from "docx";

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function rgbaToHex(color: string): string | null {
  const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return null;
  const [, r, g, b] = m;
  return [r, g, b].map((n) => Number(n).toString(16).padStart(2, "0")).join("").toUpperCase();
}

type Fmt = { bold?: boolean; italics?: boolean; underline?: boolean; highlightHex?: string | null };

function extractRuns(node: ChildNode, fmt: Fmt, runs: { text: string; fmt: Fmt }[]) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent || "";
    if (text) runs.push({ text, fmt });
    return;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();
  const nextFmt: Fmt = { ...fmt };
  if (tag === "b" || tag === "strong") nextFmt.bold = true;
  if (tag === "i" || tag === "em") nextFmt.italics = true;
  if (tag === "u") nextFmt.underline = true;
  const bg = el.style?.backgroundColor;
  if (bg && bg !== "transparent") {
    const hex = rgbaToHex(bg);
    if (hex) nextFmt.highlightHex = hex;
  }
  el.childNodes.forEach((child) => extractRuns(child, nextFmt, runs));
}

function htmlToParagraphs(html: string): Paragraph[] {
  const container = document.createElement("div");
  container.innerHTML = html;
  const paragraphs: Paragraph[] = [];
  let currentLine: ChildNode[] = [];

  function flushLine() {
    const runs: { text: string; fmt: Fmt }[] = [];
    currentLine.forEach((n) => extractRuns(n, {}, runs));
    currentLine = [];
    if (runs.length === 0) {
      paragraphs.push(new Paragraph({ text: "" }));
      return;
    }
    const textRuns = runs.map(
      (r) =>
        new TextRun({
          text: r.text,
          bold: r.fmt.bold,
          italics: r.fmt.italics,
          underline: r.fmt.underline ? {} : undefined,
          shading: r.fmt.highlightHex ? { type: ShadingType.CLEAR, fill: r.fmt.highlightHex } : undefined,
        })
    );
    paragraphs.push(new Paragraph({ children: textRuns }));
  }

  container.childNodes.forEach((node) => {
    const el = node as HTMLElement;
    const tag = node.nodeType === Node.ELEMENT_NODE ? el.tagName.toLowerCase() : "";
    if (tag === "div" || tag === "p") {
      flushLine();
      el.childNodes.forEach((child) => currentLine.push(child));
      flushLine();
    } else if (tag === "hr") {
      flushLine();
      paragraphs.push(
        new Paragraph({
          border: { bottom: { color: "999999", space: 1, style: "single", size: 6 } },
          spacing: { after: 200 },
        })
      );
    } else if (tag === "br") {
      flushLine();
    } else {
      currentLine.push(node);
    }
  });
  flushLine();
  return paragraphs;
}

export async function exportChaptersToWord(bookTitle: string, chapters: any[]) {
  const children: Paragraph[] = [
    new Paragraph({ text: bookTitle, heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
  ];
  chapters.forEach((c) => {
    children.push(new Paragraph({ text: c.title, heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }));
    children.push(...htmlToParagraphs(c.content || ""));
  });
  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  download(blob, `${bookTitle}.docx`);
}

export function exportChaptersToPdf(bookTitle: string, chapters: any[]) {
  const win = window.open("", "_blank");
  if (!win) {
    alert("Tu navegador ha bloqueado la ventana de impresión. Permite las ventanas emergentes para exportar a PDF.");
    return;
  }
  const body = chapters.map((c) => `
    <h2 style="font-family: 'Fraunces', serif;">${c.title}</h2>
    <div style="font-family: '${c.font || "Fraunces"}', serif; font-size: 14px; line-height: 1.7; text-align: ${c.justify ? "justify" : "left"};">
      ${c.content || ""}
    </div>
    <div style="page-break-after: always;"></div>
  `).join("");
  win.document.write(`
    <html><head><title>${bookTitle}</title>
    <style>body{font-family:serif;padding:40px;} h1{text-align:center;font-family:'Fraunces',serif;}</style>
    </head><body>
    <h1>${bookTitle}</h1>
    ${body}
    </body></html>
  `);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}

export async function exportWorldbuilding(bookTitle: string, characters: any[], bookActs: any[], universeEntries: any[]) {
  const children: Paragraph[] = [
    new Paragraph({ text: `Construcción de mundo — ${bookTitle}`, heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
  ];

  if (characters.length) {
    children.push(new Paragraph({ text: "Personajes", heading: HeadingLevel.HEADING_1, spacing: { before: 400 } }));
    characters.forEach((c) => {
      children.push(new Paragraph({ text: c.name, heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }));
      const fields: [string, string][] = [
        ["Apodo", c.nickname], ["Rol", c.role], ["Motivación", c.motivation],
        ["Virtudes", c.virtues], ["Defectos", c.defects], ["Personalidad", c.personality],
      ];
      fields.forEach(([label, value]) => {
        if (value) children.push(new Paragraph({ children: [new TextRun({ text: `${label}: `, bold: true }), new TextRun({ text: value })] }));
      });
    });
  }

  if (bookActs.length) {
    children.push(new Paragraph({ text: "Actos", heading: HeadingLevel.HEADING_1, spacing: { before: 400 } }));
    bookActs.forEach((a) => children.push(new Paragraph({ text: a.name })));
  }

  if (universeEntries.length) {
    children.push(new Paragraph({ text: "Universo", heading: HeadingLevel.HEADING_1, spacing: { before: 400 } }));
    universeEntries.forEach((e) => {
      children.push(new Paragraph({ text: `${e.title} (${e.category})`, heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }));
      if (e.content) children.push(new Paragraph({ text: e.content }));
    });
  }

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  download(blob, `${bookTitle} - Construccion de mundo.docx`);
}