"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

/**
 * Lightweight draw-to-sign pad for the customer approval page. Captures the
 * drawn signature as a PNG data URL into a hidden input (name="signatureDataUrl")
 * and the signer's typed name (name="signatureName"). Optional — leaving it
 * blank simply approves without a signature.
 */
export function SignaturePad() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hiddenRef = useRef<HTMLInputElement | null>(null);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(false);

  function pointInCanvas(e: ReactPointerEvent<HTMLCanvasElement>) {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (c.width / rect.width),
      y: (e.clientY - rect.top) * (c.height / rect.height),
    };
  }

  function handleDown(e: ReactPointerEvent<HTMLCanvasElement>) {
    e.preventDefault();
    const c = canvasRef.current!;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    drawing.current = true;
    const { x, y } = pointInCanvas(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    try {
      c.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }

  function handleMove(e: ReactPointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = pointInCanvas(e);
    ctx.lineTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#18181b";
    ctx.stroke();
  }

  function handleUp() {
    if (!drawing.current) return;
    drawing.current = false;
    const c = canvasRef.current;
    if (c && hiddenRef.current) {
      hiddenRef.current.value = c.toDataURL("image/png");
      setHasInk(true);
    }
  }

  function clear() {
    const c = canvasRef.current;
    if (c) {
      const ctx = c.getContext("2d");
      ctx?.clearRect(0, 0, c.width, c.height);
    }
    if (hiddenRef.current) hiddenRef.current.value = "";
    setHasInk(false);
  }

  return (
    <div className="rounded-md border border-zinc-200 bg-white p-3" data-testid="signature-pad">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-zinc-500">
          Signature (optional — for insurance claims)
        </span>
        {hasInk && (
          <button
            type="button"
            onClick={clear}
            className="text-xs font-medium text-zinc-500 hover:text-zinc-800"
            data-testid="signature-clear"
          >
            Clear
          </button>
        )}
      </div>
      <input
        type="text"
        name="signatureName"
        placeholder="Type your full name"
        autoComplete="name"
        className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        data-testid="signature-name"
      />
      <canvas
        ref={canvasRef}
        width={600}
        height={160}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerLeave={handleUp}
        className="mt-2 h-40 w-full touch-none rounded-md border border-dashed border-zinc-300 bg-zinc-50"
        style={{ cursor: "crosshair" }}
        data-testid="signature-canvas"
      />
      <input type="hidden" name="signatureDataUrl" ref={hiddenRef} data-testid="signature-data" />
      <p className="mt-1 text-xs text-zinc-400">
        Draw your signature above with your finger or mouse.
      </p>
    </div>
  );
}
