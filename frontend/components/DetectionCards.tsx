"use client";
import type { Detection } from "@/app/page";

type Props = { detections: Detection[] };

const CONF_COLOR = (conf: number) =>
  conf >= 0.85 ? "var(--success)" : conf >= 0.65 ? "var(--accent)" : "var(--accent2)";

export default function DetectionCards({ detections }: Props) {
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
        <span>DETECTIONS</span>
        <span
          style={{
            background: detections.length ? "var(--accent)" : "var(--border)",
            color: detections.length ? "#0c0e12" : "var(--muted)",
            borderRadius: 3,
            padding: "2px 7px",
            fontSize: 10,
            fontWeight: 700,
            transition: "all 0.2s",
          }}
        >
          {detections.length}
        </span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "10px", display: "flex", flexDirection: "column", gap: 8 }}>
        {detections.length === 0 ? (
          <Empty />
        ) : (
          detections.map((d, i) => <DetCard key={i} d={d} />)
        )}
      </div>
    </div>
  );
}

function DetCard({ d }: { d: Detection }) {
  const pct = Math.round(d.conf * 100);
  return (
    <div
      className="animate-fade-up"
      style={{
        background: "var(--bg)",
        border: "1px solid var(--border)",
        borderRadius: 6,
        padding: "10px",
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: 60, height: 60, borderRadius: 5, overflow: "hidden",
          background: "var(--surface)", flexShrink: 0,
          border: `1px solid ${CONF_COLOR(d.conf)}33`,
        }}
      >
        {d.thumb && (
          <img src={d.thumb} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        )}
      </div>

      <div
        style={{
          width: 52, height: 60, borderRadius: 5, overflow: "hidden",
          background: "var(--surface)", flexShrink: 0,
        }}
      >
        <img
          src={d.cardpic || "/cards/default.jpg"}
          alt=""
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "var(--sans)", fontWeight: 600, fontSize: 13,
            color: "var(--text)", lineHeight: 1.3,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}
        >
          {d.name}
        </div>

        <div style={{ marginTop: 8 }}>
          <div
            style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: 4, fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)",
            }}
          >
            <span>CONF</span>
            <span style={{ color: CONF_COLOR(d.conf), fontWeight: 700 }}>{pct}%</span>
          </div>
          <div
            style={{
              height: 3, background: "var(--border)", borderRadius: 2, overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%", width: `${pct}%`,
                background: CONF_COLOR(d.conf),
                borderRadius: 2,
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Empty() {
  return (
    <div
      style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 10,
        letterSpacing: "0.1em", gap: 10, padding: "40px 0",
      }}
    >
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      NO PRODUCTS DETECTED
    </div>
  );
}