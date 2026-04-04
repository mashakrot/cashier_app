"use client";
import type { Detection } from "@/app/page";

type Props = { history: Detection[] };

export default function HistoryPanel({ history }: Props) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--border)",
          fontFamily: "var(--mono)",
          fontSize: 10,
          letterSpacing: "0.12em",
          color: "var(--muted)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>SCAN HISTORY</span>
        <span style={{ color: "var(--muted)", fontSize: 10 }}>{history.length}</span>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {history.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--muted)",
              fontFamily: "var(--mono)",
              fontSize: 10,
              letterSpacing: "0.1em",
            }}
          >
            NO HISTORY YET
          </div>
        ) : (
          history.map((d, i) => <HistItem key={i} d={d} isNew={i === 0} />)
        )}
      </div>
    </div>
  );
}

function HistItem({ d, isNew }: { d: Detection; isNew: boolean }) {
  const pct = Math.round(d.conf * 100);
  return (
    <div
      className={isNew ? "animate-slide-in" : undefined}
      style={{
        display: "flex",
        gap: 10,
        alignItems: "center",
        padding: "9px 12px",
        borderBottom: "1px solid var(--border)",
        transition: "background 0.15s",
      }}
    >
      <div
        style={{
          width: 42, height: 42, borderRadius: 4, overflow: "hidden",
          background: "var(--bg)", flexShrink: 0,
        }}
      >
        {d.thumb && (
          <img src={d.thumb} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "var(--sans)", fontWeight: 500, fontSize: 12,
            color: "var(--text)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}
        >
          {d.name}
        </div>
        <div
          style={{
            fontFamily: "var(--mono)", fontSize: 10, marginTop: 2,
            display: "flex", gap: 8, color: "var(--muted)",
          }}
        >
          <span style={{ color: pct >= 85 ? "var(--success)" : pct >= 65 ? "var(--accent)" : "var(--accent2)" }}>
            {pct}%
          </span>
          <span>{d.time}</span>
        </div>
      </div>

      <div
        style={{
          width: 32, height: 38, borderRadius: 3, overflow: "hidden",
          background: "var(--bg)", flexShrink: 0,
        }}
      >
        <img
          src={d.cardpic || "/cards/default.jpg"}
          alt=""
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>
    </div>
  );
}