import { Component, ReactNode } from "react";
import { primaryBtn } from "../styles";

interface Props {
  children: ReactNode;
  onRetry?: () => void;
}
interface State {
  hasError: boolean;
}

// Envuelve el editor de capítulos (u otra zona sensible) para que, si algo
// revienta ahí dentro (por ejemplo un conflicto con una extensión del
// navegador tipo Grammarly/traductores dentro del contentEditable), no se
// caiga TODA la aplicación con un pantallazo en blanco: solo se recupera
// esa sección concreta.
//
// Importante: para que el "Reintentar" funcione bien, el componente padre
// debe renderizar este boundary con un `key` que cambie al reintentar
// (por ejemplo key={activeId}), así React lo vuelve a montar limpio.
export class EditorErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Aquí es donde verías en consola el error real si vuelve a pasar.
    console.error("EditorErrorBoundary ha capturado un error:", error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: 24,
            textAlign: "center",
            color: "var(--text)",
          }}
        >
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 17 }}>
            El editor ha tenido un problema al mostrarse
          </div>
          <div style={{ fontSize: 13, color: "var(--dim)", maxWidth: 360 }}>
            Suele deberse a una extensión del navegador (corrector, traductor,
            etc.) interfiriendo con el editor. Tu texto más reciente está a
            salvo: se guarda automáticamente mientras escribes. Pulsa
            reintentar para volver a cargarlo.
          </div>
          <button onClick={this.handleRetry} style={primaryBtn}>
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}