"use client";

import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { RefreshCw, Maximize2, Minimize2, KeyRound, Clock, ShieldCheck, Sparkles } from "lucide-react";
import { generateDynamicToken } from "@/lib/qr-crypto";

interface QRDisplayProps {
  sessionId: string;
  courseName: string;
  courseRoom: string;
  pinCode?: string;
  onRefresh?: () => void;
}

export function QRDisplay({
  sessionId,
  courseName,
  courseRoom,
  pinCode = "4829",
  onRefresh,
}: QRDisplayProps) {
  const [token, setToken] = useState<string>("");
  const [timeRemaining, setTimeRemaining] = useState<number>(8);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Interval timer to rotate token every 8 seconds
  useEffect(() => {
    const updateQR = () => {
      const { token: newToken, timeRemainingSec } = generateDynamicToken(sessionId);
      setToken(newToken);
      setTimeRemaining(timeRemainingSec);

      // Render QR code to canvas
      if (canvasRef.current && newToken) {
        QRCode.toCanvas(
          canvasRef.current,
          JSON.stringify({
            app: "MY_STUDENT_ROOM",
            sessionId,
            token: newToken,
            ts: Date.now(),
          }),
          {
            width: isFullscreen ? 360 : 240,
            margin: 2,
            color: {
              dark: "#0f172a",
              light: "#ffffff",
            },
          }
        );
      }
    };

    updateQR();
    const interval = setInterval(updateQR, 1000);
    return () => clearInterval(interval);
  }, [sessionId, isFullscreen]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`glass-card rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center transition-all ${
        isFullscreen
          ? "fixed inset-0 z-50 bg-white dark:bg-zinc-950 p-12 flex items-center justify-center"
          : ""
      }`}
    >
      {/* Header */}
      <div className="w-full flex items-center justify-between pb-4 mb-2 border-b border-zinc-100 dark:border-zinc-800">
        <div className="text-left">
          <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dynamic Live QR (เปลี่ยนรหัสทุก 8 วินาที)</span>
          </span>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            {courseName}
          </h3>
          <p className="text-xs text-zinc-500">{courseRoom}</p>
        </div>

        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition"
          title="ฉายเต็มจอโปรเจกเตอร์"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* QR Canvas Container */}
      <div className="relative my-3 p-3 bg-white rounded-2xl shadow-inner border border-zinc-200/80 flex items-center justify-center">
        <canvas ref={canvasRef} className="rounded-xl shadow-sm" />
      </div>

      {/* Rotation Countdown Ring & Active Token */}
      <div className="flex items-center space-x-3 mt-2">
        <div className="flex items-center space-x-1.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-3 py-1.5 rounded-xl">
          <Clock className="w-4 h-4 text-indigo-600 animate-spin" />
          <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 font-mono">
            หมดอายุใน {timeRemaining}s
          </span>
        </div>

        <div className="bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700">
          <span className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 tracking-wider">
            {token || "GENERATING..."}
          </span>
        </div>
      </div>

      {/* Emergency PIN Fallback */}
      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 w-full flex items-center justify-between text-xs text-zinc-500">
        <span className="flex items-center space-x-1.5">
          <KeyRound className="w-4 h-4 text-amber-500" />
          <span>รหัส PIN สำรอง:</span>
        </span>
        <span className="font-mono font-extrabold text-sm px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          {pinCode}
        </span>
      </div>
    </div>
  );
}
