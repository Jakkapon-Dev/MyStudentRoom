"use client";

import React from "react";
import { MessageSquare, X, BellRing, CheckCircle2, Clock, MapPin, Sparkles, Send } from "lucide-react";

interface FlexMessageData {
  title: string;
  studentName: string;
  subjectName?: string;
  time: string;
  location?: string;
  status: "PRESENT" | "LATE" | "ABSENT" | "LEAVE" | "URGENT";
  extraMessage?: string;
  badge?: string;
}

export function LineSimulatorModal({
  isOpen,
  onClose,
  data,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: FlexMessageData | null;
}) {
  if (!isOpen || !data) return null;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PRESENT":
        return {
          headerBg: "bg-[#06C755]", // Official LINE Green
          badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: CheckCircle2,
          text: "เข้าเรียนตรงเวลา",
        };
      case "LATE":
        return {
          headerBg: "bg-amber-500",
          badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
          icon: Clock,
          text: "มาสาย",
        };
      case "ABSENT":
        return {
          headerBg: "bg-red-500",
          badgeBg: "bg-red-50 text-red-700 border-red-200",
          icon: X,
          text: "ขาดเรียน",
        };
      case "LEAVE":
        return {
          headerBg: "bg-sky-500",
          badgeBg: "bg-sky-50 text-sky-700 border-sky-200",
          icon: Clock,
          text: "ลาหยุด",
        };
      default:
        return {
          headerBg: "bg-[#06C755]",
          badgeBg: "bg-emerald-50 text-emerald-700",
          icon: BellRing,
          text: "ประกาศ",
        };
    }
  };

  const style = getStatusStyle(data.status);
  const StatusIcon = style.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-sm w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Modal Top Bar */}
        <div className="px-4 py-3 bg-zinc-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-md bg-[#06C755] flex items-center justify-center">
              <MessageSquare className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs font-bold tracking-wide">LINE Notification Preview</span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* LINE Chat Background Simulation */}
        <div className="bg-[#8C9DAE] dark:bg-zinc-950 p-4 space-y-3">
          <div className="text-center">
            <span className="text-[10px] bg-black/20 text-white px-2 py-0.5 rounded-full">
              วันนี้ {data.time}
            </span>
          </div>

          {/* LINE Flex Message Bubble */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-zinc-100 max-w-xs mx-auto animate-in zoom-in-95 duration-200">
            {/* Bubble Header */}
            <div className={`${style.headerBg} p-4 text-white flex items-center justify-between`}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                  MyStudentRoom Alert
                </span>
                <h4 className="font-bold text-sm mt-1">{data.title}</h4>
              </div>
              <StatusIcon className="w-6 h-6 text-white opacity-90" />
            </div>

            {/* Bubble Body */}
            <div className="p-4 space-y-3 text-xs text-zinc-700">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                <span className="text-zinc-400">นักเรียน:</span>
                <span className="font-bold text-zinc-900">{data.studentName}</span>
              </div>

              {data.subjectName && (
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                  <span className="text-zinc-400">วิชา:</span>
                  <span className="font-medium text-zinc-800">{data.subjectName}</span>
                </div>
              )}

              <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                <span className="text-zinc-400">เวลาบันทึก:</span>
                <span className="font-medium text-zinc-800">{data.time} น.</span>
              </div>

              {data.location && (
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                  <span className="text-zinc-400 flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-zinc-400" />
                    <span>สถานที่:</span>
                  </span>
                  <span className="font-medium text-zinc-800">{data.location}</span>
                </div>
              )}

              {data.extraMessage && (
                <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-100 text-[11px] text-zinc-600">
                  💡 {data.extraMessage}
                </div>
              )}

              {/* Status Badge */}
              <div className="pt-1 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400">สถานะ:</span>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${style.badgeBg}`}>
                  {style.text}
                </span>
              </div>
            </div>

            {/* Action Buttons in Flex message */}
            <div className="p-3 bg-zinc-50 border-t border-zinc-100 flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 bg-[#06C755] hover:bg-[#05a847] text-white text-xs font-bold py-2 rounded-xl text-center shadow-sm transition active:scale-95"
              >
                เปิดดูใน LINE LIFF
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 text-center">
          <p className="text-[11px] text-zinc-500">
            จำลองการส่งข้อความอัตโนมัติผ่าน LINE Official Account (Messaging API)
          </p>
        </div>
      </div>
    </div>
  );
}
