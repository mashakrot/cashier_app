"use client";
import type { ReceiptItem } from "@/app/page";

type Props = {
  items: ReceiptItem[];
  onRemove: (name: string) => void;
  onClear: () => void;
  onPay?: () => void;
  mobile?: boolean;
};

const STORE_NAME = "Ma.Kro Store";
const TAX_RATE = 0.24;

export default function Receipt({ items, onRemove, onClear, onPay, mobile = false }: Props) {
  const subtotal = items.reduce((s, r) => s + r.price * r.qty, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal;

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 8,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      height: "100%",
    }}>
      {!mobile && (
        <div style={{
          padding: "16px 20px 12px",
          borderBottom: "1px dashed var(--border)",
          textAlign: "center",
        }}>
          <div style={{
            fontFamily: "var(--mono)",
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: "0.2em",
            color: "var(--text)",
          }}>
            {STORE_NAME}
          </div>
          <div style={{
            fontFamily: "var(--mono)",
            fontSize: 12,
            color: "var(--muted)",
            marginTop: 4,
            letterSpacing: "0.1em",
          }}>
            {new Date().toLocaleDateString("fi-FI")} &nbsp;·&nbsp; {new Date().toLocaleTimeString("fi-FI", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr auto auto",
        gap: 8,
        padding: "8px 16px",
        borderBottom: "1px solid var(--border)",
        fontFamily: "var(--mono)",
        fontSize: 13,
        letterSpacing: "0.12em",
        color: "var(--muted)",
      }}>
        <span>ITEM</span>
        <span style={{ textAlign: "right" }}>QTY</span>
        <span style={{ textAlign: "right", minWidth: 64 }}>PRICE</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {items.length === 0 ? (
          <div style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            color: "var(--muted)",
            fontFamily: "var(--mono)",
            fontSize: 13,
            letterSpacing: "0.1em",
          }}>
            <ReceiptIcon />
            NO ITEMS SCANNED YET
          </div>
        ) : (
          items.map((item) => (
            <ReceiptLine key={item.name} item={item} onRemove={onRemove} />
          ))
        )}
      </div>

      {items.length > 0 && (
        <div style={{
          borderTop: "1px dashed var(--border)",
          padding: "12px 16px",
        }}>
          <TotalRow label="SUBTOTAL" value={subtotal} muted />
          <TotalRow label={`VAT (${Math.round(TAX_RATE * 100)}%)`} value={tax} muted />
          <div style={{ height: 1, background: "var(--border)", margin: "10px 0" }} />
          <TotalRow label="TOTAL" value={total} large />
        </div>
      )}

      <div style={{
        padding: "12px",
        borderTop: "1px solid var(--border)",
        display: "flex",
        gap: 8,
      }}>
        <button
          onClick={onClear}
          disabled={items.length === 0}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: 6,
            border: "1px solid var(--border)",
            background: "transparent",
            color: items.length === 0 ? "var(--muted)" : "var(--text)",
            fontFamily: "var(--mono)",
            fontSize: 13,
            letterSpacing: "0.1em",
            cursor: items.length === 0 ? "not-allowed" : "pointer",
            opacity: items.length === 0 ? 0.4 : 1,
          }}
        >
          CLEAR
        </button>
        <button
          disabled={items.length === 0}
          onClick={onPay}
          style={{
            flex: 3,
            padding: "10px",
            borderRadius: 6,
            border: "none",
            background: items.length === 0 ? "var(--border)" : "var(--accent)",
            color: items.length === 0 ? "var(--muted)" : "#0c0e12",
            fontFamily: "var(--mono)",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.12em",
            cursor: items.length === 0 ? "not-allowed" : "pointer",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => { if (items.length) (e.currentTarget as HTMLButtonElement).style.opacity = "0.85"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
        >
          PAY &nbsp;{items.length > 0 ? `€${total.toFixed(2)}` : ""}
        </button>
      </div>
    </div>
  );
}

function ReceiptLine({ item, onRemove }: { item: ReceiptItem; onRemove: (n: string) => void }) {
  return (
    <div
      className="animate-fade-up"
      style={{
        display: "grid",
        gridTemplateColumns: "44px 1fr auto auto",
        alignItems: "center",
        gap: 10,
        padding: "9px 16px",
        borderBottom: "1px solid var(--border)",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "var(--bg)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 4, overflow: "hidden",
        background: "var(--bg)", flexShrink: 0,
      }}>
        <img
          src={item.cardpic || "/cards/default.jpg"}
          alt=""
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>

      <div>
        <div style={{
          fontFamily: "var(--sans)", fontSize: 15, fontWeight: 500, color: "var(--text)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          maxWidth: 160,
        }}>
          {item.name}
        </div>
        <div style={{
          fontFamily: "var(--mono)", fontSize: 13, color: "var(--muted)", marginTop: 2,
        }}>
          €{item.price.toFixed(2)} each
        </div>
      </div>

      <div style={{
        fontFamily: "var(--mono)", fontSize: 15, color: "var(--accent2)",
        textAlign: "right", minWidth: 24,
      }}>
        ×{item.qty}
      </div>

      <div style={{ textAlign: "right", minWidth: 72 }}>
        <div style={{
          fontFamily: "var(--mono)", fontSize: 15, fontWeight: 700, color: "var(--text)",
        }}>
          €{(item.price * item.qty).toFixed(2)}
        </div>
        <button
          onClick={() => onRemove(item.name)}
          style={{
            fontFamily: "var(--mono)", fontSize: 13,
            color: "var(--muted)", background: "none", border: "none",
            cursor: "pointer", padding: 0, letterSpacing: "0.06em",
            marginTop: 2,
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--danger)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--muted)"; }}
        >
          REMOVE
        </button>
      </div>
    </div>
  );
}

function TotalRow({ label, value, muted, large }: {
  label: string; value: number; muted?: boolean; large?: boolean;
}) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: 6,
    }}>
      <span style={{
        fontFamily: "var(--mono)",
        fontSize: large ? 15 : 13,
        letterSpacing: "0.1em",
        color: muted ? "var(--muted)" : "var(--text)",
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: "var(--mono)",
        fontSize: large ? 24 : 16,
        fontWeight: large ? 700 : 400,
        color: large ? "var(--accent)" : muted ? "var(--muted)" : "var(--text)",
        letterSpacing: "0.04em",
      }}>
        €{value.toFixed(2)}
      </span>
    </div>
  );
}

function ReceiptIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}