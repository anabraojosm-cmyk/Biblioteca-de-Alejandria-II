import { useState } from "react";
import { supabase } from "./lib/supabase";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) setError(error.message);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#15161d", fontFamily: "'Inter', sans-serif" }}>
      <form onSubmit={handleSubmit} style={{ width: 320, background: "#191a22", border: "1px solid #282a38", borderRadius: 14, padding: 28 }}>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: "#EDE9DD", marginBottom: 18 }}>
          {mode === "login" ? "Entrar en tu biblioteca" : "Crear cuenta"}
        </div>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo electrónico"
          style={{ width: "100%", marginBottom: 10, padding: "9px 12px", borderRadius: 7, border: "1px solid #282a38", background: "#101117", color: "#EDE9DD", fontSize: 13 }} />
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña"
          style={{ width: "100%", marginBottom: 14, padding: "9px 12px", borderRadius: 7, border: "1px solid #282a38", background: "#101117", color: "#EDE9DD", fontSize: 13 }} />
        {error && <div style={{ color: "#C1594A", fontSize: 12.5, marginBottom: 12 }}>{error}</div>}
        <button type="submit" disabled={loading}
          style={{ width: "100%", padding: "10px 0", borderRadius: 7, border: "none", background: "#C9A24B", color: "#1c1712", fontWeight: 600, fontSize: 13, cursor: "pointer", marginBottom: 12 }}>
          {loading ? "Un momento..." : mode === "login" ? "Entrar" : "Crear cuenta"}
        </button>
        <div style={{ textAlign: "center", fontSize: 12, color: "#77746a" }}>
          {mode === "login" ? (
            <>¿Sin cuenta? <span onClick={() => setMode("signup")} style={{ color: "#C9A24B", cursor: "pointer" }}>Crear una</span></>
          ) : (
            <>¿Ya tienes cuenta? <span onClick={() => setMode("login")} style={{ color: "#C9A24B", cursor: "pointer" }}>Entrar</span></>
          )}
        </div>
      </form>
    </div>
  );
}