"use client";

import React, { useState, useEffect } from "react";
import {
  HeartHandshake,
  MessageSquare,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  BellRing,
  Sparkles,
  MapPin,
  FileCheck,
  ChevronRight,
  ShieldCheck,
  Send,
} from "lucide-react";
import { SkeletonCard, EmptyState, ErrorState } from "@/components/UIStates";
import { LineSimulatorModal } from "@/components/LineSimulatorModal";

export default function ParentPortalPage() {
  const [data, setData] = useState<any | null>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Direct Leave submit by Parent
  const [directLeaveType, setDirectLeaveType] = useState<"SICK" | "BUSINESS">("SICK");
  const [directLeaveDate, setDirectLeaveDate] = useState("");
  const [directLeaveReason, setDirectLeaveReason] = useState("");
  const [directLeaveSuccessMsg, setDirectLeaveSuccessMsg] = useState<string | null>(null);

  // LINE Simulator
  const [lineModalData, setLineModalData] = useState<any | null>(null);

  const parentId = "parent_somjai"; // Default parent Somjai

  const fetchParentData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch Parent Feed
      const resFeed = await fetch(`/api/v1/stats?mode=parent-feed&parentId=${parentId}`);
      const dataFeed = await resFeed.json();
      if (dataFeed.success) setData(dataFeed.data);

      // 2. Fetch Announcements
      const resAnn = await fetch("/api/v1/announcements?targetRoom=ม.4/1");
      const dataAnn = await resAnn.json();
      if (dataAnn.success) setAnnouncements(dataAnn.data);
    } catch (err: any) {
      setError(err.message || "Failed to load parent portal data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParentData();
    const interval = setInterval(fetchParentData, 8000);
    return () => clearInterval(interval);
  }, []);

  // Handle Parent Leave Confirmation
  const handleConfirmChildLeave = async (leaveId: string) => {
    try {
      const res = await fetch("/api/v1/leaves", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leaveId,
          action: "PARENT_CONFIRM",
          note: "ผู้ปกครองกดยืนยันการลาหยุดของนักเรียนเรียบร้อยแล้วผ่าน LINE LIFF",
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        fetchParentData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Parent Direct Leave Submission
  const handleDirectLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentChild = data?.children?.[selectedChildIndex];
    if (!currentChild || !directLeaveReason.trim() || !directLeaveDate) return;

    try {
      const res = await fetch("/api/v1/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: currentChild.id,
          leaveType: directLeaveType,
          startDate: directLeaveDate,
          endDate: directLeaveDate,
          reason: directLeaveReason,
          isParentDirect: true,
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        setDirectLeaveSuccessMsg("ส่งใบลาถึงคุณครูประจำชั้นเรียบร้อยแล้ว");
        setDirectLeaveReason("");
        setDirectLeaveDate("");
        fetchParentData();
        setTimeout(() => setDirectLeaveSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && !data) {
    return (
      <div className="max-w-md mx-auto p-4 space-y-4">
        <SkeletonCard lines={3} />
        <SkeletonCard lines={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-4">
        <ErrorState message={error} onRetry={fetchParentData} />
      </div>
    );
  }

  const children = data?.children || [];
  const activeChild = children[selectedChildIndex] || children[0];
  const gateRecords = activeChild?.gateRecords || [];
  const attendances = activeChild?.attendances || [];
  const leaveRequests = activeChild?.leaveRequests || [];

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-200">
      {/* LINE LIFF Header Bar */}
      <div className="bg-[#06C755] text-white rounded-3xl p-5 shadow-lg flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
              LINE Official App
            </span>
            <h1 className="text-lg font-black mt-0.5">MyStudentRoom for Parents</h1>
          </div>
        </div>
        <button
          onClick={() =>
            setLineModalData({
              title: "สรุปการเข้าเรียนประจำวัน",
              studentName: activeChild?.name || "ด.ช. ชัยวัฒน์",
              subjectName: "ภาพรวมรายวัน",
              time: "16:00",
              status: "PRESENT",
              extraMessage: "วันนี้เข้าเรียนครบทุกคาบ และมาตรงเวลา 100%",
            })
          }
          className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition text-xs font-bold flex items-center space-x-1"
          title="ดูตัวอย่าง Flex Notification"
        >
          <BellRing className="w-4 h-4" />
        </button>
      </div>

      {/* Multi-child Switcher */}
      {children.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-1">
          {children.map((child: any, idx: number) => (
            <button
              key={child.id}
              onClick={() => setSelectedChildIndex(idx)}
              className={`flex-1 p-2.5 rounded-2xl border text-xs font-bold flex items-center space-x-2 transition ${
                selectedChildIndex === idx
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600"
              }`}
            >
              <img
                src={child.avatarUrl || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100"}
                alt={child.name}
                className="w-6 h-6 rounded-full object-cover border"
              />
              <span className="truncate">{child.name.split(" ")[1] || child.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Child Summary Card */}
      <div className="glass-card rounded-3xl p-5 shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-3">
        <div className="flex items-center space-x-3">
          <img
            src={activeChild?.avatarUrl || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"}
            alt={activeChild?.name}
            className="w-12 h-12 rounded-2xl object-cover border border-zinc-200 shadow-sm"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                สถานะ: อยู่ในโรงเรียน
              </span>
            </div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 truncate mt-0.5">
              {activeChild?.name}
            </h2>
            <p className="text-xs text-zinc-500">
              ห้อง {activeChild?.studentRoom} • รหัส #{activeChild?.code}
            </p>
          </div>
        </div>
      </div>

      {/* Real-Time Live Activity Feed / Timeline */}
      <div className="glass-card rounded-3xl p-5 shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>ไทม์ไลน์ความเคลื่อนไหววันนี้ (Live Feed)</span>
          </h3>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>อัปเดตสด</span>
          </span>
        </div>

        {/* Timeline List */}
        <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800 text-xs">
          {/* 1. Morning Gate Arrival */}
          {gateRecords.length > 0 ? (
            <div className="relative space-y-1">
              <div className="absolute -left-[21px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm flex items-center justify-center text-white text-[8px]" />
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  เดินทางถึงโรงเรียนเรียบร้อยแล้ว
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  {new Date(gateRecords[0].timestamp).toLocaleTimeString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  น.
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-emerald-500" />
                <span>{gateRecords[0].gateName}</span>
              </p>
            </div>
          ) : (
            <div className="relative space-y-1">
              <div className="absolute -left-[21px] top-0.5 w-4 h-4 rounded-full bg-amber-400 border-2 border-white shadow-sm" />
              <p className="font-semibold text-zinc-600">ยังไม่พบบันทึกการสแกนผ่านประตูโรงเรียน</p>
            </div>
          )}

          {/* 2. Class Attendances */}
          {attendances.map((att: any) => (
            <div key={att.id} className="relative space-y-1">
              <div
                className={`absolute -left-[21px] top-0.5 w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white text-[8px] ${
                  att.status === "PRESENT"
                    ? "bg-emerald-500"
                    : att.status === "LATE"
                    ? "bg-amber-500"
                    : "bg-rose-500"
                }`}
              />
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  เข้าเรียนวิชา: {att.session?.course?.name}
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  {att.checkinTime
                    ? new Date(att.checkinTime).toLocaleTimeString("th-TH", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "08:30"}{" "}
                  น.
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">
                ห้องเรียน: {att.session?.course?.room} • อาจารย์:{" "}
                {att.session?.course?.teacher?.name}
              </p>
              <div className="pt-0.5">
                <span
                  className={`text-[9px] font-bold px-2 py-0.2 rounded-full ${
                    att.status === "PRESENT"
                      ? "bg-emerald-50 text-emerald-700"
                      : att.status === "LATE"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {att.status === "PRESENT"
                    ? "✅ มาตรงเวลา"
                    : att.status === "LATE"
                    ? "⚠️ มาสาย"
                    : "❌ ขาดเรียน"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leave Requests: Confirm or Direct Submit */}
      <div className="glass-card rounded-3xl p-5 shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-sky-600" />
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              การลาหยุดของบุตรหลาน
            </h3>
          </div>
        </div>

        {/* Pending Confirmation List */}
        {leaveRequests.filter((l: any) => !l.parentApproved).length > 0 && (
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-amber-600 flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>รอยืนยันจากผู้ปกครอง:</span>
            </span>
            {leaveRequests
              .filter((l: any) => !l.parentApproved)
              .map((l: any) => (
                <div
                  key={l.id}
                  className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs space-y-2"
                >
                  <p className="font-bold text-zinc-900">
                    น้องขอยื่นลา: {l.leaveType === "SICK" ? "ลาป่วย" : "ลากิจ"}
                  </p>
                  <p className="text-zinc-600 text-[11px]">เหตุผล: {l.reason}</p>
                  <button
                    onClick={() => handleConfirmChildLeave(l.id)}
                    className="w-full bg-[#06C755] hover:bg-[#05a847] text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center space-x-1 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>กดยืนยันรับทราบการลา (ส่งให้ครูอนุมัติ)</span>
                  </button>
                </div>
              ))}
          </div>
        )}

        {/* Direct Leave Form by Parent */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block mb-2">
            ผู้ปกครองแจ้งลาหยุดแทนบุตรหลาน:
          </span>

          {directLeaveSuccessMsg && (
            <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs rounded-xl font-bold mb-2">
              {directLeaveSuccessMsg}
            </div>
          )}

          <form onSubmit={handleDirectLeaveSubmit} className="space-y-2.5 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <select
                value={directLeaveType}
                onChange={(e) => setDirectLeaveType(e.target.value as any)}
                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
              >
                <option value="SICK">ลาป่วย</option>
                <option value="BUSINESS">ลากิจ</option>
              </select>
              <input
                type="date"
                value={directLeaveDate}
                onChange={(e) => setDirectLeaveDate(e.target.value)}
                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
              />
            </div>
            <input
              type="text"
              value={directLeaveReason}
              onChange={(e) => setDirectLeaveReason(e.target.value)}
              placeholder="ระบุเหตุผลการลา เช่น ไม่สบาย มีไข้..."
              className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl transition"
            >
              ส่งใบลาตรงถึงครูประจำชั้น
            </button>
          </form>
        </div>
      </div>

      {/* Announcements Broadcasts */}
      <div className="glass-card rounded-3xl p-5 shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-3">
        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
          <BellRing className="w-4 h-4 text-indigo-600" />
          <span>ข่าวสารและประกาศจากโรงเรียน</span>
        </h3>

        <div className="space-y-2">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                ann.priority === "URGENT"
                  ? "bg-rose-50/50 border-rose-200 dark:bg-rose-950/20"
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{ann.title}</span>
                {ann.priority === "URGENT" && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700">
                    ด่วนมาก
                  </span>
                )}
              </div>
              <p className="text-zinc-600 dark:text-zinc-300 text-[11px]">{ann.content}</p>
              <p className="text-[10px] text-zinc-400">{ann.senderName}</p>
            </div>
          ))}
        </div>
      </div>

      {/* LINE Simulator Modal */}
      <LineSimulatorModal
        isOpen={!!lineModalData}
        onClose={() => setLineModalData(null)}
        data={lineModalData}
      />
    </div>
  );
}
