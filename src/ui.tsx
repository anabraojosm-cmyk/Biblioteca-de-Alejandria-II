import { fieldLabel, textInput, textArea } from "./styles";

export function Badge({ text, color }: { text: string; color: string }) {
  return <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 10, background: color + "22", color, border: `1px solid ${color}55` }}>{text}</span>;
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11.5, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 0.6, margin: "16px 0 8px" }}>{children}</div>;
}

export function Row2({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>{children}</div>;
}

export function Field({ label, value, onChange, custom, type }: any) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={fieldLabel}>{label}</div>
      {custom || <input type={type || "text"} value={value} onChange={(e) => onChange(e.target.value)} style={textInput} />}
    </div>
  );
}

export function FieldArea({ label, value, onChange }: any) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={fieldLabel}>{label}</div>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2} style={textArea} />
    </div>
  );
}