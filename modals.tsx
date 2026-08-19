import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { primaryBtn, smallOutlineBtn } from "./styles";

export function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,10,14,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: 12 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, padding: 22, maxWidth: "95vw" }}>
        {children}
      </div>
    </div>
  );
}

export function DeleteCascadeModal({ kind, name, hasChildren, onClose, onConfirm }: any) {
  const [choice, setChoice] = useState(hasChildren ? null : "delete");
  const [step, setStep] = useState(0);

  if (choice === null) return (
    <Modal onClose={onClose}>
      <div style={{ width: 380, maxWidth: "90vw" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, color: "#C1594A" }}>
          <AlertTriangle size={16} /><div style={{ fontFamily: "'Fraunces', serif", fontSize: 17 }}>Eliminar {kind} "{name}"</div>
        </div>
        <div style={{ fontSize: 13.5, marginBottom: 16, color: "var(--text)" }}>Este {kind} contiene {kind === "universo" ? "sagas y libros" : "libros"}. ¿Qué quieres hacer con ellos?</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={() => setChoice("keep")} style={{ ...smallOutlineBtn, justifyContent: "flex-start", padding: "10px 12px" }}>Eliminar solo {kind === "universo" ? "el universo (las sagas quedan sin universo)" : "la saga (los libros quedan sueltos)"}</button>
          <button onClick={() => setChoice("delete")} style={{ ...smallOutlineBtn, justifyContent: "flex-start", padding: "10px 12px", borderColor: "#C1594A", color: "#C1594A" }}>Eliminar todo el contenido {kind === "universo" ? "(sagas y libros incluidos)" : "(libros y capítulos incluidos)"}</button>
        </div>
        <button onClick={onClose} style={{ ...smallOutlineBtn, marginTop: 14 }}>Cancelar</button>
      </div>
    </Modal>
  );

  const messages = [
    `¿Seguro que quieres borrar "${name}"?`,
    `Esta acción no se puede deshacer. ¿Confirmas borrar todo?`,
    `Última confirmación: pulsa "Borrar todo" para eliminar "${name}" definitivamente.`,
  ];

  return (
    <Modal onClose={onClose}>
      <div style={{ width: 380, maxWidth: "90vw" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, color: "#C1594A" }}>
          <AlertTriangle size={16} /><div style={{ fontFamily: "'Fraunces', serif", fontSize: 17 }}>Confirmación {step + 1} de 3</div>
        </div>
        <div style={{ fontSize: 13.5, marginBottom: 18, color: "var(--text)" }}>{messages[step]}</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={smallOutlineBtn}>Cancelar</button>
          <button onClick={() => (step < 2 ? setStep(step + 1) : (onConfirm(choice === "delete"), onClose()))} style={{ ...primaryBtn, background: "#C1594A" }}>{step < 2 ? "Continuar" : "Borrar todo"}</button>
        </div>
      </div>
    </Modal>
  );
}