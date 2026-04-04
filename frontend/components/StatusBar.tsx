"use client";

type Props = {
  running: boolean;
  elapsed: number | null;
  frameCount: number;
  error: string;
  onStart: () => void;
  onStop: () => void;
};

export default function StatusBar({
  running,
  elapsed,
  frameCount,
  error,
  onStart,
  onStop,
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "8px 16px",
        fontFamily: "var(--mono)",
        fontSize: 11,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginRight: 18 }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: running ? "var(--success)" : "var(--muted)",
            boxShadow: running ? "0 0 0 3px rgba(71,255,156,0.25)" : "none",
            transition: "all 0.3s",
            display: "inline-block",
          }}
        />
        <span
          style={{
            color: "var(--text)",
            letterSpacing: "0.12em",
            fontWeight: 700,
            fontSize: 26,
          }}
        >
          Ma.<span style={{ color: "var(--accent)" }}>Kro</span>
        </span>
      </div>

      <div style={{ width: 1, height: 20, background: "var(--border)" }} />

      {!running ? (
        <button onClick={onStart} style={btnStyle("var(--accent)", "#0c0e12")}>
          ▶ START
        </button>
      ) : (
        <button onClick={onStop} style={btnStyle("var(--danger)", "#fff")}>
          ■ STOP
        </button>
      )}

      <div style={{ flex: 1 }} />

      {error && (
        <span style={{ color: "var(--danger)", fontSize: 11 }}>
          {error}
        </span>
      )}

      {elapsed != null && (
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              color: "var(--muted)",
              fontSize: 12,
              letterSpacing: "0.1em",
            }}
          >
            LATENCY · FRAMES
          </div>
          <div
            style={{
              color: "var(--accent)",
              fontSize: 16,
              marginTop: 1,
            }}
          >
            {Math.round(elapsed * 1000)}ms · {frameCount}
          </div>
        </div>
      )}
    </div>
  );
}

function btnStyle(bg: string, color: string): React.CSSProperties {
  return {
    fontFamily: "var(--mono)",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.08em",
    padding: "6px 14px",
    borderRadius: 4,
    border: "none",
    background: bg,
    color,
    cursor: "pointer",
    transition: "opacity 0.15s",
  };
}
