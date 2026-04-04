"use client";
import { RefObject } from "react";

type Props = {
  videoRef: RefObject<HTMLVideoElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  running: boolean;
};

export default function CameraPanel({ videoRef, canvasRef, running }: Props) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <Corner pos="top-left" />
      <Corner pos="top-right" />
      <Corner pos="bottom-left" />
      <Corner pos="bottom-right" />

      {running && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 5,
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
        </div>
      )}

      <div
        style={{
          position: "absolute",
          top: 22, left: 28,
          fontFamily: "var(--mono)",
          fontSize: 12,
          letterSpacing: "0.14em",
          color: "var(--accent2)",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {running && (
          <span
            style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "var(--danger)",
              display: "inline-block",
              animation: "pulse-border 1s ease infinite",
            }}
          />
        )}
        LIVE FEED
      </div>

      <div style={{ flex: 1, background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        {!running && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(12,14,18,0.85)",
              fontFamily: "var(--mono)",
              color: "var(--muted)",
              gap: 12,
            }}
          >
            <CameraIcon />
            <span style={{ fontSize: 11, letterSpacing: "0.12em" }}>PRESS START TO BEGIN SCANNING</span>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

function Corner({ pos }: { pos: "top-left" | "top-right" | "bottom-left" | "bottom-right" }) {
  const styles: Record<string, React.CSSProperties> = {
    "top-left":     { top: 8,  left: 8,  borderTop: "2px solid var(--accent)", borderLeft:  "2px solid var(--accent)" },
    "top-right":    { top: 8,  right: 8, borderTop: "2px solid var(--accent)", borderRight: "2px solid var(--accent)" },
    "bottom-left":  { bottom: 8, left: 8,  borderBottom: "2px solid var(--accent)", borderLeft:  "2px solid var(--accent)" },
    "bottom-right": { bottom: 8, right: 8, borderBottom: "2px solid var(--accent)", borderRight: "2px solid var(--accent)" },
  };
  return (
    <div
      style={{
        position: "absolute",
        width: 16, height: 16,
        zIndex: 10,
        pointerEvents: "none",
        ...styles[pos],
      }}
    />
  );
}

function CameraIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  );
}