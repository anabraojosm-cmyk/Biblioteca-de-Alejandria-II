import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Ban } from "lucide-react";
import { supabase } from "../lib/supabase";
import { READER_COLORS } from "../constants";

const BETA_DISCLAIMER = "Este enlace es de un solo uso, una vez se cierre no se podrá volver a abrir y tus comentarios serán enviados. Solo puedes leer y comentar: no se puede editar, copiar ni seleccionar el contenido para evitar plagios. Espero que disfrutes la lectura ¡comenta todo lo que quieras! <3";

type Step = "loading" | "invalid" | "used" | "disclaimer" | "register" | "reading" | "survey" | "done";

export default function ReaderPage() {
  const { linkId } = useParams();
  const [step, setStep] = useState<Step>("loading");
  const [link, setLink] = useState<any>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(READER_COLORS[0]);
  const [comments, setComments] = useState<{ excerpt: string; comment: string }[]>([]);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [draftExcerpt, setDraftExcerpt] = useState("");
  const [draftComment, setDraftComment] = useState("");
  const [survey, setSurvey] = useState({ importance: 0, impact: 0, opinion: "" });
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!linkId) return;
    supabase.from("beta_links").select("*").eq("id", linkId).maybeSingle().then(({ data }) => {
      if (!data) { setStep("invalid"); return; }
      if (data.used) { setStep("used"); return; }
      setLink(data);
      setStep("disclaimer");
    });
  }, [linkId]);

  function beginReading() {
    setStep("register");
  }

  function completeRegister() {
    if (!name.trim()) return;
    setStep("reading");
  }

  function openCommentBox() {
    const sel = window.getSelection();
    const text = sel && sel.toString();
    if (!text || !text.trim()) { alert("Primero selecciona el fragmento de texto sobre el que quieres comentar."); return; }
    setDraftExcerpt(text);
    setDraftComment("");
    setShowCommentBox(true);
  }

  async function submitComment() {
    if (!draftComment.trim() || !link) return;
    const { error } = await supabase.from("beta_comments").insert({
      link_id: link.id, owner_id: link.owner_id, book_id: link.book_id, chapter_id: link.chapter_id,
      reader_name: name, reader_color: color, excerpt: draftExcerpt, comment: draftComment,
    });
    if (!error) {
      setComments((c) => [...c, { excerpt: draftExcerpt, comment: draftComment }]);
      setShowCommentBox(false);
    }
  }

  function finishReading() {
    setStep("survey");
  }

  async function submitSurvey(skip: boolean) {
    if (!link) return;
    if (!skip && (survey.importance || survey.impact || survey.opinion)) {
      await supabase.from("beta_surveys").insert({
        link_id: link.id, owner_id: link.owner_id, book_id: link.book_id, chapter_id: link.chapter_id,
        reader_name: name, importance: survey.importance || null, impact: survey.impact || null, opinion: survey.opinion || null,
      });
    }
    await supabase.from("beta_links").update({ used: true }).eq("id", link.id).eq("used", false);
    setStep("done");
  }

  const page: React.CSSProperties = { minHeight: "100vh", background: "#15161d", color: "#EDE9DD", fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 };
  const card: React.CSSProperties = { width: "min(100%, 560px)", background: "#191a22", border: "1px solid #282a38", borderRadius: 14, padding: 26 };
  const btn: React.CSSProperties = { background: "#C9A24B", color: "#1c1712", border: "none", borderRadius: 7, padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" };
  const outlineBtn: React.CSSProperties = { background: "none", border: "1px solid #282a38", color: "#EDE9DD", borderRadius: 7, padding: "9px 14px", fontSize: 13, cursor: "pointer" };
  const input: React.CSSProperties = { width: "100%", marginBottom: 10, padding: "9px 12px", borderRadius: 7, border: "1px solid #282a38", background: "#101117", color: "#EDE9DD", fontSize: 13, boxSizing: "border-box" };

  if (step === "loading") return <div style={page}>Cargando...</div>;
  if (step === "invalid") return <div style={page}><div style={card}>Este enlace no existe.</div></div>;
  if (step === "used") return <div style={page}><div style={card}>Este enlace ya se usó y ya no está disponible. Pide a la autora que te envíe uno nuevo.</div></div>;

  if (step === "disclaimer") return (
    <div style={page}>
      <div style={{ ...card, textAlign: "center" }}>
        <Ban size={26} color="#C9A24B" style={{ marginBottom: 10 }} />
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, marginBottom: 10 }}>Antes de empezar a leer</div>
        <div style={{ fontSize: 13.5, lineHeight: 1.6, marginBottom: 18 }}>{BETA_DISCLAIMER}</div>
        <button onClick={beginReading} style={btn}>Entendido, empezar a leer</button>
      </div>
    </div>
  );

  if (step === "register") return (
    <div style={page}>
      <div style={card}>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, marginBottom: 14 }}>Regístrate para comentar</div>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" style={input} />
        <div style={{ fontSize: 11.5, color: "#77746a", marginBottom: 6 }}>Color para tus comentarios</div>
        <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
          {READER_COLORS.map((c) => <button key={c} onClick={() => setColor(c)} style={{ width: 22, height: 22, borderRadius: "50%", background: c, border: color === c ? "2px solid #fff" : "1px solid #282a38", cursor: "pointer" }} />)}
        </div>
        <button onClick={completeRegister} style={btn}>Empezar a leer y comentar</button>
      </div>
    </div>
  );

  if (step === "reading") return (
    <div style={{ minHeight: "100vh", background: "#15161d", color: "#EDE9DD", fontFamily: "'Inter', sans-serif", padding: 20 }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, marginBottom: 4 }}>{link.chapter_title}</div>
        <div style={{ fontSize: 11.5, color: "#77746a", marginBottom: 16 }}>Comentando como <span style={{ color }}>{name}</span> — selecciona texto para comentar</div>
        <div
          ref={contentRef}
          onCopy={(e) => e.preventDefault()}
          onContextMenu={(e) => e.preventDefault()}
          dangerouslySetInnerHTML={{ __html: link.chapter_content }}
          style={{ background: "#191a22", border: "1px solid #282a38", borderRadius: 10, padding: 22, fontFamily: `'${link.chapter_font}', serif`, fontSize: 15.5, lineHeight: 1.8, textAlign: link.chapter_justify ? "justify" : "left", userSelect: "text" }}
        />
        <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
          <button onClick={openCommentBox} style={outlineBtn}>+ Comentar selección</button>
          <button onClick={finishReading} style={btn}>Terminar lectura</button>
        </div>
        {showCommentBox && (
          <div style={{ ...card, marginTop: 14 }}>
            <div style={{ fontSize: 11.5, color: "#77746a", fontStyle: "italic", marginBottom: 8 }}>"{draftExcerpt}"</div>
            <textarea value={draftComment} onChange={(e) => setDraftComment(e.target.value)} rows={3} placeholder="Escribe tu comentario..." style={{ ...input, resize: "vertical" }} />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setShowCommentBox(false)} style={outlineBtn}>Cancelar</button>
              <button onClick={submitComment} style={btn}>Enviar comentario</button>
            </div>
          </div>
        )}
        {comments.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 11.5, color: "#77746a", marginBottom: 8 }}>Tus comentarios en este capítulo ({comments.length})</div>
            {comments.map((c, i) => (
              <div key={i} style={{ background: "#191a22", border: "1px solid #282a38", borderLeft: `3px solid ${color}`, borderRadius: 8, padding: 10, fontSize: 12.5, marginBottom: 8 }}>
                <div style={{ color: "#77746a", fontStyle: "italic", marginBottom: 4 }}>"{c.excerpt}"</div>
                {c.comment}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (step === "survey") return (
    <div style={page}>
      <div style={card}>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, marginBottom: 6 }}>Cuestionario del capítulo</div>
        <div style={{ fontSize: 11.5, color: "#77746a", marginBottom: 16 }}>Totalmente opcional — puedes omitirlo.</div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11.5, color: "#77746a", marginBottom: 6 }}>¿Cuánto importa este capítulo en la historia? (1-5)</div>
          <div style={{ display: "flex", gap: 6 }}>{[1, 2, 3, 4, 5].map((n) => <button key={n} onClick={() => setSurvey((s) => ({ ...s, importance: n }))} style={survey.importance === n ? btn : outlineBtn}>{n}</button>)}</div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11.5, color: "#77746a", marginBottom: 6 }}>Nivel de impacto (1-5)</div>
          <div style={{ display: "flex", gap: 6 }}>{[1, 2, 3, 4, 5].map((n) => <button key={n} onClick={() => setSurvey((s) => ({ ...s, impact: n }))} style={survey.impact === n ? btn : outlineBtn}>{n}</button>)}</div>
        </div>
        <textarea value={survey.opinion} onChange={(e) => setSurvey((s) => ({ ...s, opinion: e.target.value }))} rows={3} placeholder="Desarrolla tu opinión (opcional)" style={{ ...input, resize: "vertical" }} />
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={() => submitSurvey(true)} style={outlineBtn}>Omitir</button>
          <button onClick={() => submitSurvey(false)} style={btn}>Enviar</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={page}>
      <div style={{ ...card, textAlign: "center" }}>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 19, marginBottom: 10 }}>¡Gracias por leer!</div>
        <div style={{ fontSize: 13.5, color: "#77746a" }}>Tus comentarios se han enviado. Ya puedes cerrar esta ventana.</div>
      </div>
    </div>
  );
}