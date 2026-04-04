"use client";
import type { Detection } from "@/app/page";

type Props = {
  items: Detection[];
  onConfirm: (d: Detection) => void;
  onDismiss: (d: Detection) => void;
};

export default function PendingDrawer({ items, onConfirm, onDismiss }: Props) {
  if (items.length === 0) {
    return (
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "14px 16px",
        fontFamily: "var(--mono)",
        fontSize: 11,
        color: "var(--muted)",
        letterSpacing: "0.1em",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: "50%",
          background: "var(--border)",
          display: "inline-block",
          flexShrink: 0,
        }} />
        POINT CAMERA AT A PRODUCT TO SCAN
      </div>
    );
  }

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 8,
      overflow: "hidden",
    }}>
      <div style={{
        padding: "10px 14px",
        borderBottom: "1px solid var(--border)",
        fontFamily: "var(--mono)",
        fontSize: 10,
        letterSpacing: "0.12em",
        color: "var(--muted)",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}>
        <span style={{
          width: 7, height: 7, borderRadius: "50%",
          background: "var(--accent)",
          display: "inline-block",
          boxShadow: "0 0 0 3px rgba(232,255,71,0.2)",
        }} />
        DETECTED — TAP TO ADD
      </div>

      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: 0,
        maxHeight: 220,
        overflowY: "auto",
      }}>
        {items.map((det) => (
          <PendingCard key={det.name} det={det} onConfirm={onConfirm} onDismiss={onDismiss} />
        ))}
      </div>
    </div>
  );
}

function PendingCard({ det, onConfirm, onDismiss }: {
  det: Detection;
  onConfirm: (d: Detection) => void;
  onDismiss: (d: Detection) => void;
}) {
  const pct = Math.round(det.conf * 100);

  return (
    <div
      className="animate-fade-up"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 14px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg)",
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 6, overflow: "hidden",
        background: "var(--surface)", flexShrink: 0,
        border: "1px solid var(--border)",
      }}>
        {det.thumb && <img src={det.thumb} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: "var(--sans)", fontWeight: 600, fontSize: 13,
          color: "var(--text)",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {det.name}
        </div>
        <div style={{
          fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", marginTop: 2,
        }}>
          {pct}% conf
        </div>
      </div>

      <div style={{
        fontFamily: "var(--mono)", fontSize: 15, fontWeight: 700,
        color: "var(--accent)", letterSpacing: "0.04em", flexShrink: 0,
      }}>
        €{det.price.toFixed(2)}
      </div>

      <button
        onClick={() => onDismiss(det)}
        title="Dismiss"
        style={{
          width: 36, height: 36, borderRadius: 6,
          border: "1px solid var(--border)",
          background: "transparent",
          color: "var(--muted)",
          cursor: "pointer",
          fontSize: 16,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          transition: "border-color 0.15s, color 0.15s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--danger)";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--danger)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--muted)";
        }}
      >
        ✕
      </button>

      <button
        onClick={() => onConfirm(det)}
        title="Add to receipt"
        style={{
          width: 36, height: 36, borderRadius: 6,
          border: "none",
          background: "var(--accent)",
          color: "#0c0e12",
          cursor: "pointer",
          fontSize: 18,
          fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          transition: "opacity 0.15s",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.8"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
      >
        +
      </button>
    </div>
  );
}