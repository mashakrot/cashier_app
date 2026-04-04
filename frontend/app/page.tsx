// "use client";
// import { useRef, useState, useCallback, useEffect } from "react";
// import CameraPanel from "@/components/CameraPanel";
// import DetectionCards from "@/components/DetectionCards";
// import HistoryPanel from "@/components/HistoryPanel";
// import StatusBar from "@/components/StatusBar";

// export type Detection = {
//   name: string;
//   conf: number;
//   time: string;
//   thumb: string | null;
//   cardpic: string;
// };

// const FRAME_MS   = 600;
// const BACKEND    = "/api/backend";

// export default function Home() {
//   const videoRef   = useRef<HTMLVideoElement>(null);
//   const canvasRef  = useRef<HTMLCanvasElement>(null);
//   const streamRef  = useRef<MediaStream | null>(null);
//   const intervalId = useRef<ReturnType<typeof setInterval> | null>(null);

//   const [running,     setRunning]     = useState(false);
//   const [detections,  setDetections]  = useState<Detection[]>([]);
//   const [history,     setHistory]     = useState<Detection[]>([]);
//   const [elapsed,     setElapsed]     = useState<number | null>(null);
//   const [serverTime,  setServerTime]  = useState("");
//   const [frameCount,  setFrameCount]  = useState(0);
//   const [error,       setError]       = useState("");

//   const startCamera = useCallback(async () => {
//     try {
//       const s = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: "environment", width: { ideal: 1280 } },
//         audio: false,
//       });
//       streamRef.current = s;
//       if (videoRef.current) {
//         videoRef.current.srcObject = s;
//         await videoRef.current.play();
//       }
//       setError("");
//     } catch (e: any) {
//       setError("Camera error: " + e.message);
//     }
//   }, []);

//   const stopCamera = useCallback(() => {
//     streamRef.current?.getTracks().forEach((t) => t.stop());
//     streamRef.current = null;
//     if (videoRef.current) videoRef.current.srcObject = null;
//   }, []);

//   const sendFrame = useCallback(async () => {
//     const video  = videoRef.current;
//     const canvas = canvasRef.current;
//     if (!video || !canvas || !streamRef.current) return;
//     if (!video.videoWidth || !video.videoHeight) return;

//     const MAX_SIDE = 1000;
//     const scale = MAX_SIDE / Math.max(video.videoWidth, video.videoHeight);
//     canvas.width  = Math.round(video.videoWidth  * scale);
//     canvas.height = Math.round(video.videoHeight * scale);
//     canvas.getContext("2d")!.drawImage(video, 0, 0, canvas.width, canvas.height);
//     const dataUrl = canvas.toDataURL("image/jpeg", 0.8);

//     try {
//       const res  = await fetch(`${BACKEND}/detect`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ image: dataUrl }),
//       });
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       const j = await res.json();

//       setDetections(j.detections ?? []);
//       setElapsed(j.elapsed ?? null);
//       setServerTime(j.server_time ?? "");
//       setFrameCount((c) => c + 1);

//       if (j.detections?.length) {
//         setHistory((prev) => [...j.detections, ...prev].slice(0, 200));
//       }
//     } catch (e: any) {
//       console.error("Frame error:", e);
//     }
//   }, []);

//   const start = useCallback(async () => {
//     await startCamera();
//     intervalId.current = setInterval(sendFrame, FRAME_MS);
//     setRunning(true);
//   }, [startCamera, sendFrame]);

//   const stop = useCallback(() => {
//     if (intervalId.current) clearInterval(intervalId.current);
//     stopCamera();
//     setRunning(false);
//   }, [stopCamera]);

//   const clearHistory = useCallback(async () => {
//     await fetch(`${BACKEND}/history/clear`, { method: "POST" });
//     setHistory([]);
//   }, []);

//   useEffect(() => () => stop(), [stop]);

//   return (
//     <div
//       style={{
//         display: "grid",
//         gridTemplateColumns: "1fr 340px 300px",
//         gridTemplateRows: "auto 1fr",
//         height: "100vh",
//         gap: "12px",
//         padding: "12px",
//         background: "var(--bg)",
//       }}
//     >
//       <div style={{ gridColumn: "1 / -1" }}>
//         <StatusBar
//           running={running}
//           elapsed={elapsed}
//           serverTime={serverTime}
//           frameCount={frameCount}
//           error={error}
//           onStart={start}
//           onStop={stop}
//           onClear={clearHistory}
//         />
//       </div>

//       <CameraPanel videoRef={videoRef} canvasRef={canvasRef} running={running} />

//       <DetectionCards detections={detections} />

//       <HistoryPanel history={history} />
//     </div>
//   );
// }


"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import CameraPanel from "@/components/CameraPanel";
import PendingDrawer from "@/components/PendingDrawer";
import Receipt from "@/components/Receipt";
import StatusBar from "@/components/StatusBar";
import MobileLayout from "@/components/MobileLayout";

export type Detection = {
  id: string;
  name: string;
  conf: number;
  time: string;
  thumb: string | null;
  cardpic: string;
  price: number;
};

export type ReceiptItem = {
  name: string;
  price: number;
  cardpic: string;
  thumb: string | null;
  qty: number;
  addedAt: number;
};

const FRAME_MS       = 700;
const BACKEND        = "/api/backend";
const PENDING_TTL_MS = 2500;

export default function Home() {
  const videoRef   = useRef<HTMLVideoElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const streamRef  = useRef<MediaStream | null>(null);
  const intervalId = useRef<ReturnType<typeof setInterval> | null>(null);

  const [running,  setRunning]  = useState(false);
  const [pending,  setPending]  = useState<Detection[]>([]);
  const [receipt,  setReceipt]  = useState<ReceiptItem[]>([]);
  const [elapsed,  setElapsed]  = useState<number | null>(null);
  const [error,    setError]    = useState("");
  const [frameN,   setFrameN]   = useState(0);
  const [isMobile, setIsMobile] = useState<boolean>(true);

  const lastSeenRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine) and (min-width: 1025px)");
    setIsMobile(!mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(!e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = s;
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        await videoRef.current.play();
      }
      setError("");
    } catch (e: any) {
      setError("Camera error: " + e.message);
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const sendFrame = useCallback(async () => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !streamRef.current) return;
    if (!video.videoWidth || !video.videoHeight) return;

    const MAX   = 1000;
    const scale = MAX / Math.max(video.videoWidth, video.videoHeight);
    canvas.width  = Math.round(video.videoWidth  * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    canvas.getContext("2d")!.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      const res = await fetch(`${BACKEND}/detect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: canvas.toDataURL("image/jpeg", 0.8) }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = await res.json();

      setElapsed(j.elapsed ?? null);
      setFrameN((n) => n + 1);

      const now = Date.now();
      const inFrame: Detection[] = (j.detections ?? []).map((d: any) => ({ ...d, id: d.name }));
      inFrame.forEach((d) => { lastSeenRef.current[d.name] = now; });

      setPending((prev) => {
        const prevNames = new Set(prev.map((p) => p.name));
        const newOnes   = inFrame.filter((d) => !prevNames.has(d.name));
        const merged    = [
          ...prev.map((p) => {
            const up = inFrame.find((d) => d.name === p.name);
            return up ? { ...p, conf: up.conf, thumb: up.thumb ?? p.thumb } : p;
          }),
          ...newOnes,
        ];
        return merged.filter((p) => now - (lastSeenRef.current[p.name] ?? 0) < PENDING_TTL_MS);
      });
    } catch (e: any) {
      console.error(e);
    }
  }, []);

  const start = useCallback(async () => {
    await startCamera();
    intervalId.current = setInterval(sendFrame, FRAME_MS);
    setRunning(true);
  }, [startCamera, sendFrame]);

  const stop = useCallback(() => {
    if (intervalId.current) clearInterval(intervalId.current);
    stopCamera();
    setRunning(false);
    setPending([]);
  }, [stopCamera]);

  const confirm = useCallback((det: Detection) => {
    setPending((prev) => prev.filter((p) => p.name !== det.name));
    lastSeenRef.current[det.name] = Date.now() + 5000;
    setReceipt((prev) => {
      const idx = prev.findIndex((r) => r.name === det.name);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
        return copy;
      }
      return [
        { name: det.name, price: det.price, cardpic: det.cardpic, thumb: det.thumb, qty: 1, addedAt: Date.now() },
        ...prev,
      ];
    });
  }, []);

  const dismiss = useCallback((det: Detection) => {
    setPending((prev) => prev.filter((p) => p.name !== det.name));
    lastSeenRef.current[det.name] = Date.now() + 8000;
  }, []);

  const removeFromReceipt = useCallback((name: string) => {
    setReceipt((prev) => {
      const idx = prev.findIndex((r) => r.name === name);
      if (idx < 0) return prev;
      const copy = [...prev];
      if (copy[idx].qty > 1) {
        copy[idx] = { ...copy[idx], qty: copy[idx].qty - 1 };
      } else {
        copy.splice(idx, 1);
      }
      return copy;
    });
  }, []);

  const clearReceipt = useCallback(() => setReceipt([]), []);

  useEffect(() => () => stop(), [stop]);

  if (isMobile) {
    return (
      <MobileLayout
        videoRef={videoRef}
        canvasRef={canvasRef}
        running={running}
        pending={pending}
        receipt={receipt}
        elapsed={elapsed}
        error={error}
        onStart={start}
        onStop={stop}
        onConfirm={confirm}
        onDismiss={dismiss}
        onRemove={removeFromReceipt}
        onClear={clearReceipt}
      />
    );
  }

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 380px",
      gridTemplateRows: "52px 1fr",
      height: "100vh",
      gap: "10px",
      padding: "10px",
      background: "var(--bg)",
    }}>
      <div style={{ gridColumn: "1 / -1" }}>
        <StatusBar
          running={running}
          elapsed={elapsed}
          frameCount={frameN}
          error={error}
          onStart={start}
          onStop={stop}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 0 }}>
        <CameraPanel videoRef={videoRef} canvasRef={canvasRef} running={running} />
        <PendingDrawer items={pending} onConfirm={confirm} onDismiss={dismiss} />
      </div>

      <Receipt items={receipt} onRemove={removeFromReceipt} onClear={clearReceipt} />
    </div>
  );
}