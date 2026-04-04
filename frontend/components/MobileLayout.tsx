"use client";
import { RefObject, useState, useRef } from "react";
import type { Detection, ReceiptItem } from "@/app/page";
import Receipt from "@/components/Receipt";

type Props = {
  videoRef:  RefObject<HTMLVideoElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  running:   boolean;
  pending:   Detection[];
  receipt:   ReceiptItem[];
  elapsed:   number | null;
  error:     string;
  onStart:   () => void;
  onStop:    () => void;
  onConfirm: (d: Detection) => void;
  onDismiss: (d: Detection) => void;
  onRemove:  (name: string) => void;
  onClear:   () => void;
};

export default function MobileLayout({
  videoRef, canvasRef, running, pending, receipt,
  elapsed, error, onStart, onStop,
  onConfirm, onDismiss, onRemove, onClear,
}: Props) {
  const [receiptOpen, setReceiptOpen] = useState(false);
  const sheetRef  = useRef<HTMLDivElement>(null);
  const dragStart = useRef<number | null>(null);

  const total     = receipt.reduce((s, r) => s + r.price * r.qty, 0);
  const itemCount = receipt.reduce((s, r) => s + r.qty, 0);

  const onTouchStart = (e: React.TouchEvent) => {
    dragStart.current = e.touches[0].clientY;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (dragStart.current === null || !sheetRef.current) return;
    const dy = e.touches[0].clientY - dragStart.current;
    if (dy > 0) sheetRef.current.style.transform = `translateY(${dy}px)`;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!sheetRef.current || dragStart.current === null) return;
    const dy = e.changedTouches[0].clientY - dragStart.current;
    sheetRef.current.style.transform = "";
    dragStart.current = null;
    if (dy > 80) setReceiptOpen(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000", overflow: "hidden" }}>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        controls={false}
        style={{
          position: "absolute", inset: 0, zIndex: 1,
          width: "100%", height: "100%",
          objectFit: "cover",
          display: running ? "block" : "none",
        }}
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {!running && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 3,
          background: "rgba(12,14,18,0.95)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 20,
        }}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.2">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", letterSpacing: "0.14em" }}>
            PRESS START TO SCAN
          </p>
        </div>
      )}

      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
        display: "flex", alignItems: "center",
        padding: "30px",
        background: "linear-gradient(to bottom, rgba(12,14,18,0.9) 60%, transparent)",
        gap: 12,
      }}>
        <span style={{
          fontFamily: "var(--mono)", fontSize: 20, fontWeight: 700,
          letterSpacing: "0.14em", color: "var(--text)",
        }}>
          Ma.<span style={{ color: "var(--accent)" }}>Kro</span>
        </span>

        <div style={{ flex: 1 }} />

        {elapsed != null && running && (
          <span style={{
            fontFamily: "var(--mono)", fontSize: 12,
            color: "var(--muted)", letterSpacing: "0.08em",
          }}>
            {Math.round(elapsed * 1000)}ms
          </span>
        )}

        <button
          onClick={running ? onStop : onStart}
          style={{
            fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700,
            letterSpacing: "0.1em",
            padding: "8px 16px",
            borderRadius: 20,
            border: "none",
            background: running ? "var(--danger)" : "var(--accent)",
            color: running ? "#fff" : "#0c0e12",
            cursor: "pointer",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {running ? "■ STOP" : "▶ START"}
        </button>
      </div>

      {error && (
        <div style={{
          position: "absolute", top: 100, left: 16, right: 16, zIndex: 10,
          background: "var(--danger)", color: "#fff",
          fontFamily: "var(--mono)", fontSize: 11,
          padding: "10px 14px", borderRadius: 8,
        }}>
          {error}
        </div>
      )}

      {running && (
        <>
          <Bracket pos="tl" /><Bracket pos="tr" />
          <Bracket pos="bl" /><Bracket pos="br" />
        </>
      )}

      {pending.length > 0 && !receiptOpen && (
        <div style={{
          position: "absolute",
          bottom: receipt.length > 0 ? 100 : 32,
          left: 0, right: 0,
          zIndex: 10,
          padding: "0 16px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}>
          <div style={{
            fontFamily: "var(--mono)", fontSize: 13,
            color: "rgba(255,255,255,0.5)", letterSpacing: "0.14em",
            marginBottom: 2, textAlign: "center",
          }}>
            DETECTED — TAP TO ADD
          </div>
          {pending.map((det) => (
            <PendingChip key={det.name} det={det} onConfirm={onConfirm} onDismiss={onDismiss} />
          ))}
        </div>
      )}

      {receipt.length > 0 && !receiptOpen && (
        <button
          onClick={() => setReceiptOpen(true)}
          className="animate-slide-up"
          style={{
            position: "absolute",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 24px",
            borderRadius: 40,
            border: "none",
            background: "var(--accent)",
            color: "#0c0e12",
            fontFamily: "var(--mono)",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.08em",
            cursor: "pointer",
            boxShadow: "0 8px 32px rgba(232,255,71,0.35)",
            WebkitTapHighlightColor: "transparent",
            whiteSpace: "nowrap",
          }}
        >
          <CartIcon />
          <span>€{total.toFixed(2)}</span>
          <span style={{
            background: "#0c0e12",
            color: "var(--accent)",
            width: 22, height: 22,
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700,
          }}>
            {itemCount}
          </span>
        </button>
      )}

      {receiptOpen && (
        <>
          <div
            onClick={() => setReceiptOpen(false)}
            style={{
              position: "absolute", inset: 0, zIndex: 15,
              background: "rgba(0,0,0,0.6)",
            }}
          />
          <div
            ref={sheetRef}
            className="animate-sheet-in"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            style={{
              position: "absolute",
              bottom: 0, left: 0, right: 0,
              zIndex: 20,
              height: "82vh",
              background: "var(--surface)",
              borderRadius: "20px 20px 0 0",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              transition: "transform 0.1s linear",
            }}
          >
            <div style={{
              display: "flex", justifyContent: "center",
              padding: "12px 0 4px", flexShrink: 0, cursor: "grab",
            }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "var(--border)" }} />
            </div>

            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "8px 20px 12px",
              borderBottom: "1px solid var(--border)",
              flexShrink: 0,
            }}>
              <div style={{
                fontFamily: "var(--mono)", fontSize: 13,
                letterSpacing: "0.14em", color: "var(--text)", fontWeight: 700,
              }}>
                YOUR BASKET
              </div>
              <button
                onClick={() => setReceiptOpen(false)}
                style={{
                  background: "var(--border)", border: "none",
                  width: 28, height: 28, borderRadius: "50%",
                  color: "var(--muted)", fontSize: 14,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <Receipt
                items={receipt}
                onRemove={onRemove}
                onClear={onClear}
                onPay={() => setReceiptOpen(false)}
                mobile
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function PendingChip({ det, onConfirm, onDismiss }: {
  det: Detection;
  onConfirm: (d: Detection) => void;
  onDismiss: (d: Detection) => void;
}) {
  return (
    <div
      className="animate-slide-up"
      style={{
        display: "flex", alignItems: "center", gap: 10,
        background: "rgba(19,22,29,0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(232,255,71,0.2)",
        borderRadius: 12,
        padding: "10px 12px",
      }}
    >
      {det.thumb && (
        <div style={{ width: 50, height: 50, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
          <img src={det.thumb} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: "var(--sans)", fontWeight: 600, fontSize: 20,
          color: "var(--text)",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {det.name}
        </div>
        <div style={{ display: "flex" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: "var(--mono)", fontSize: 13,
              color: det.conf >= 0.85 ? "var(--success)" : det.conf >= 0.65 ? "var(--accent)" : "var(--accent2)",
              marginTop: 2,
            }}>
              {Math.round(det.conf * 100)}% match
            </div>
            <div style={{
              fontFamily: "var(--mono)", fontWeight: 700, fontSize: 20,
              color: "var(--accent)",
            }}>
              €{det.price.toFixed(2)}
            </div>
          </div>

          <button
            onClick={() => onDismiss(det)}
            style={{
              width: 38, height: 38, borderRadius: 8,
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--muted)", fontSize: 20,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0,
              WebkitTapHighlightColor: "transparent",
            }}
          >✕</button>

          <button
            onClick={() => onConfirm(det)}
            style={{
              width: 38, height: 38, borderRadius: 8,
              border: "none",
              background: "var(--accent)",
              color: "#0c0e12", fontSize: 20, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0,
              WebkitTapHighlightColor: "transparent",
            }}
          >+</button>
        </div>
      </div>
    </div>
  );
}

function Bracket({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const borders: React.CSSProperties = {
    tl: { borderTop: "2px solid var(--accent)", borderLeft:  "2px solid var(--accent)", top: 64,  left: 64  },
    tr: { borderTop: "2px solid var(--accent)", borderRight: "2px solid var(--accent)", top: 64,  right: 64 },
    bl: { borderBottom: "2px solid var(--accent)", borderLeft:  "2px solid var(--accent)", bottom: 64, left: 64  },
    br: { borderBottom: "2px solid var(--accent)", borderRight: "2px solid var(--accent)", bottom: 64, right: 64 },
  }[pos];
  return (
    <div style={{ position: "absolute", width: 22, height: 22, zIndex: 5, pointerEvents: "none", ...borders }} />
  );
}

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  );
}