"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Press-and-hold button. The user must keep holding (mouse, finger or Space/Enter)
 * for `holdMs`; a progress bar fills while holding. Releasing early cancels.
 * `onComplete` fires once when the bar reaches 100%.
 */
export default function HoldToConfirmButton({
  label,
  holdingLabel = "Keep holding...",
  doneLabel = "Done",
  loadingLabel = "Saving...",
  holdMs = 1500,
  disabled = false,
  loading = false,
  onComplete,
  className,
}: {
  label: string;
  holdingLabel?: string;
  doneLabel?: string;
  loadingLabel?: string;
  holdMs?: number;
  disabled?: boolean;
  loading?: boolean;
  onComplete: () => void;
  className?: string;
}) {
  const [progress, setProgress] = useState(0); // 0..1
  const [done, setDone] = useState(false);
  const raf = useRef<number | null>(null);
  const start = useRef(0);
  const holding = useRef(false);
  const firedRef = useRef(false);

  const stop = useCallback(() => {
    holding.current = false;
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = null;
  }, []);

  const reset = useCallback(() => {
    stop();
    if (!firedRef.current) setProgress(0);
  }, [stop]);

  const tick = useCallback(() => {
    if (!holding.current) return;
    const p = Math.min(1, (performance.now() - start.current) / holdMs);
    setProgress(p);
    if (p >= 1) {
      holding.current = false;
      firedRef.current = true;
      setDone(true);
      if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(30);
      onComplete();
      return;
    }
    raf.current = requestAnimationFrame(tick);
  }, [holdMs, onComplete]);

  const begin = useCallback(() => {
    if (disabled || loading || holding.current || firedRef.current) return;
    holding.current = true;
    start.current = performance.now();
    raf.current = requestAnimationFrame(tick);
  }, [disabled, loading, tick]);

  // Allow another hold after a finished attempt (e.g. server rejected it).
  useEffect(() => {
    if (!loading && done) {
      const t = setTimeout(() => {
        firedRef.current = false;
        setDone(false);
        setProgress(0);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [loading, done]);

  // If the button becomes disabled mid-hold (e.g. amount cleared), cancel.
  useEffect(() => {
    if (disabled) reset();
  }, [disabled, reset]);

  useEffect(() => stop, [stop]);

  const isHolding = progress > 0 && !done;

  return (
    <button
      type="button"
      disabled={disabled || loading}
      onPointerDown={(e) => {
        if (e.button !== undefined && e.button !== 0) return;
        begin();
      }}
      onPointerUp={reset}
      onPointerLeave={reset}
      onPointerCancel={reset}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if ((e.key === " " || e.key === "Enter") && !e.repeat) {
          e.preventDefault();
          begin();
        }
      }}
      onKeyUp={(e) => {
        if (e.key === " " || e.key === "Enter") reset();
      }}
      onBlur={reset}
      className={cn(
        "relative w-full h-12 overflow-hidden rounded-xl text-sm font-semibold text-white select-none touch-none",
        "bg-brand-700/80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      style={{ WebkitUserSelect: "none", WebkitTouchCallout: "none" }}
    >
      {/* progress fill */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 bg-emerald-500"
        style={{ width: `${progress * 100}%`, transition: isHolding ? "none" : "width 200ms ease-out" }}
      />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? (
          loadingLabel
        ) : done ? (
          <>
            <Check className="h-4 w-4" /> {doneLabel}
          </>
        ) : isHolding ? (
          `${holdingLabel} ${Math.round(progress * 100)}%`
        ) : (
          label
        )}
      </span>
    </button>
  );
}
