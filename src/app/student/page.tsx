"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  QrCode,
  MapPin,
  Flame,
  Award,
  AlertCircle,
  CheckCircle2,
  Heart,
  Send,
  Calendar,
  Sparkles,
  BookOpen,
  ShoppingBag,
  Clock,
  Camera,
  Check,
  Zap,
  CheckSquare,
  Square,
} from "lucide-react";
import { SkeletonCard, ErrorState } from "@/components/UIStates";
import { LineSimulatorModal } from "@/components/LineSimulatorModal";

export default function StudentPortalPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Session & Check-in input states
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [qrInputToken, setQrInputToken] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [checkinMethod, setCheckinMethod] = useState<"QR" | "PIN">("QR");
  const [checkinSuccessMsg, setCheckinSuccessMsg] = useState<string | null>(null);
  const [checkinErrorMsg, setCheckinErrorMsg] = useState<string | null>(null);

  // Daily Mood check-in state
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moodNote, setMoodNote] = useState("");

  // SafeSpace state
  const [safeCategory, setSafeCategory] = useState("STUDY");
  const [safeContent, setSafeContent] = useState("");
  const [safeMeetReq, setSafeMeetReq] = useState(false);
  const [safeSuccessMsg, setSafeSuccessMsg] = useState<string | null>(null);

  // Leave Form state
  const [leaveType, setLeaveType] = useState<"SICK" | "BUSINESS" | "ACTIVITY">("SICK");
  const [leaveStartDate, setLeaveStartDate] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveSuccessMsg, setLeaveSuccessMsg] = useState<string | null>(null);

  // Homework Completed State
  const [completedHw, setCompletedHw] = useState<Record<string, boolean>>({});

  // LINE Simulator
  const [lineModalData, setLineModalData] = useState<any | null>(null);

  const studentId = "student_chaiwat"; // Default student Chaiwat

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch Student Stats
      const resStats = await fetch(`/api/v1/stats?mode=student&studentId=${studentId}`);
      const dataStats = await resStats.json();
      if (dataStats.success) {
        setData(dataStats.data);
      }

      // Fetch Active Sessions
      const resSessions = await fetch("/api/v1/sessions?targetRoom=ม.4/1");
      const dataSessions = await resSessions.json();
      if (dataSessions.success) {
        const currentActive = dataSessions.data.find((s: any) => s.status === "ACTIVE") || dataSessions.data[0];
        setActiveSession(currentActive);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load student data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  // Toggle Homework Complete
  const toggleHomework = (hwId: string) => {
    setCompletedHw((prev) => ({
      ...prev,
      [hwId]: !prev[hwId],
    }));
  };

  // Handle QR Check-in
  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession) return;

    setCheckinSuccessMsg(null);
    setCheckinErrorMsg(null);

    const mockStudentLat = 13.75631;
    const mockStudentLng = 100.50182;

    try {
      const res = await fetch("/api/v1/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSession.id,
          studentId,
          method: checkinMethod,
          token: checkinMethod === "QR" ? (qrInputToken || activeSession.currentDynamicToken) : undefined,
          pinCode: checkinMethod === "PIN" ? pinInput : undefined,
          latitude: mockStudentLat,
          longitude: mockStudentLng,
        }),
      });

      const resData = await res.json();
      if (resData.success) {
        setCheckinSuccessMsg(resData.message);
        setQrInputToken("");
        setPinInput("");

        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });

        setLineModalData({
          title: "เข้าเรียนเรียบร้อยแล้ว",
          studentName: data?.student?.name || "นาย ชัยวัฒน์ ภักดี",
          subjectName: activeSession?.course?.name,
          time: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
          location: activeSession?.course?.room,
          status: "PRESENT",
          extraMessage: "ระบบตรวจสอบพิกัด GPS และ Token เรียบร้อยแล้ว",
        });

        fetchStudentData();
      } else {
        setCheckinErrorMsg(resData.error);
      }
    } catch (err: any) {
      setCheckinErrorMsg(err.message || "Check-in failed");
    }
  };

  // Handle Mood Submit
  const handleMoodSubmit = async (mood: string) => {
    setSelectedMood(mood);
    try {
      await fetch("/api/v1/safespace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "MOOD",
          studentId,
          mood,
          note: moodNote,
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Handle SafeSpace Message Submit
  const handleSafeSpaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!safeContent.trim()) return;

    try {
      const res = await fetch("/api/v1/safespace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          advisorId: "teacher_somsri",
          category: safeCategory,
          content: safeContent,
          requestMeet: safeMeetReq,
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        setSafeSuccessMsg(resData.message);
        setSafeContent("");
        setTimeout(() => setSafeSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Leave Submit
  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason.trim() || !leaveStartDate) return;

    try {
      const res = await fetch("/api/v1/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          leaveType,
          startDate: leaveStartDate,
          endDate: leaveStartDate,
          reason: leaveReason,
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        setLeaveSuccessMsg(resData.message);
        setLeaveReason("");
        setLeaveStartDate("");
        setTimeout(() => setLeaveSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && !data) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        <SkeletonCard lines={3} />
        <SkeletonCard lines={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <ErrorState message={error} onRetry={fetchStudentData} />
      </div>
    );
  }

  const student = data?.student;
  const courseStats = data?.courseStats || [];
  const homeworks = data?.homeworks || [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in duration-200">
      {/* Student Profile Card & Streak Banner */}
      <div className="bg-gradient-to-tr from-indigo-700 via-indigo-600 to-sky-500 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <img
            src={student?.avatarUrl || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"}
            alt={student?.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-white/40 shadow-md"
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/20">
                ห้อง {student?.studentRoom || "ม.4/1"}
              </span>
              <span className="text-[11px] font-medium text-indigo-100">#{student?.code}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black mt-0.5">{student?.name}</h1>
            <p className="text-xs text-indigo-100">โรงเรียนเตรียมอุดมศึกษาพัฒนาการ</p>
          </div>
        </div>

        {/* Gamification Streak & Points */}
        <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20">
          <div className="text-center">
            <span className="text-[10px] font-bold text-amber-300 flex items-center justify-center space-x-1">
              <Flame className="w-3.5 h-3.5 fill-amber-300" />
              <span>ON-TIME STREAK</span>
            </span>
            <p className="text-xl font-extrabold text-white">🔥 {student?.streakDays || 18} วัน</p>
          </div>
          <div className="h-8 w-px bg-white/20" />
          <div className="text-center">
            <span className="text-[10px] font-bold text-sky-200">คะแนนจิตพิสัย</span>
            <p className="text-xl font-extrabold text-white">{student?.points || 240} pts</p>
          </div>
        </div>
      </div>

      {/* 🌟 NEW: Today's Homework Checklist from Teachers */}
      <div className="glass-card rounded-3xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              การบ้านประจำวัน (Homework Tasks)
            </h3>
          </div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-full border border-indigo-200">
            {homeworks.length} รายการวันนี้
          </span>
        </div>

        {homeworks.length > 0 ? (
          <div className="space-y-2.5">
            {homeworks.map((hw: any) => {
              const isDone = !!completedHw[hw.id];
              return (
                <div
                  key={hw.id}
                  onClick={() => toggleHomework(hw.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start space-x-3 ${
                    isDone
                      ? "bg-emerald-50/60 border-emerald-200 dark:bg-emerald-950/20 opacity-75"
                      : "bg-zinc-50/60 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 hover:border-indigo-300"
                  }`}
                >
                  <div className="mt-0.5">
                    {isDone ? (
                      <CheckSquare className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Square className="w-5 h-5 text-zinc-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`text-xs font-bold ${
                          isDone
                            ? "line-through text-zinc-400"
                            : "text-zinc-900 dark:text-zinc-100"
                        }`}
                      >
                        {hw.course?.name}: {hw.title}
                      </h4>
                      <span className="text-[10px] font-medium text-zinc-400">
                        {hw.dueLabel || "ส่งคาบถัดไป"}
                      </span>
                    </div>
                    {hw.description && (
                      <p className="text-[11px] text-zinc-500 mt-0.5">{hw.description}</p>
                    )}
                    <p className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-1">
                      อาจารย์ผู้สั่ง: {hw.teacher?.name}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl text-center text-xs text-zinc-400">
            🎉 วันนี้ยังไม่มีการบ้าน สามารถพักผ่อนหรือทบทวนบทเรียนได้เลย!
          </div>
        )}
      </div>

      {/* Check-in Card (Scanner & PIN) */}
      <div className="glass-card rounded-3xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                เช็คชื่อเข้าห้องเรียน (Smart Check-in)
              </h3>
              <p className="text-xs text-zinc-500">
                {activeSession ? `วิชา: ${activeSession.course?.name} (${activeSession.course?.room})` : "ยังไม่มีคลาสเปิดเช็คชื่อ"}
              </p>
            </div>
          </div>

          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setCheckinMethod("QR")}
              className={`px-3 py-1 rounded-lg transition ${
                checkinMethod === "QR" ? "bg-white dark:bg-zinc-900 shadow-sm text-indigo-600 font-bold" : "text-zinc-500"
              }`}
            >
              สแกน QR
            </button>
            <button
              onClick={() => setCheckinMethod("PIN")}
              className={`px-3 py-1 rounded-lg transition ${
                checkinMethod === "PIN" ? "bg-white dark:bg-zinc-900 shadow-sm text-indigo-600 font-bold" : "text-zinc-500"
              }`}
            >
              กรอก PIN
            </button>
          </div>
        </div>

        {checkinSuccessMsg && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center space-x-2 animate-in zoom-in-95">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{checkinSuccessMsg}</span>
          </div>
        )}

        {checkinErrorMsg && (
          <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs font-bold flex items-center space-x-2 animate-in zoom-in-95">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{checkinErrorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleCheckin} className="space-y-3">
          {checkinMethod === "QR" ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={qrInputToken}
                  onChange={(e) => setQrInputToken(e.target.value)}
                  placeholder="สแกนหรือระบุรหัสจากหน้าจอ (เช่น MSR-7F8A-9C21)"
                  className="flex-1 text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQrInputToken(activeSession?.currentDynamicToken || "MSR-7F8A-9C21")}
                  className="px-3 py-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold border border-indigo-200 flex items-center space-x-1"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>ดึงรหัสสด</span>
                </button>
              </div>
              <p className="text-[11px] text-zinc-400 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>พิกัด GPS: ตรวจจับระยะห่างในห้องเรียนอัตโนมัติ</span>
              </p>
            </div>
          ) : (
            <div>
              <input
                type="text"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="กรอกรหัส PIN 4 หลัก จากหน้าจอครู"
                maxLength={6}
                className="w-full text-center text-lg tracking-widest font-mono font-bold p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 transition active:scale-[0.98]"
          >
            <Check className="w-4 h-4" />
            <span>ยืนยันการเช็คชื่อเข้าห้องเรียน</span>
          </button>
        </form>
      </div>

      {/* 80% Rule Exam Meter & Attendance Breakdown */}
      <div className="glass-card rounded-3xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              สถานะสิทธิ์เข้าสอบ (กฎการเข้าเรียน 80%)
            </h3>
          </div>
          <span className="text-[11px] text-zinc-400">เทอม 1/2569</span>
        </div>

        <div className="space-y-4">
          {courseStats.map((stat: any) => (
            <div
              key={stat.courseId}
              className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                    {stat.name} ({stat.code})
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    อาจารย์ผู้สอน: {stat.teacherName} • {stat.room}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs font-black px-2 py-0.5 rounded-full ${
                      stat.currentPercentage >= 80
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {stat.currentPercentage}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    stat.currentPercentage >= 80 ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                  style={{ width: `${Math.min(100, stat.currentPercentage)}%` }}
                />
              </div>

              {/* Quota & Warning */}
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-zinc-500">
                  มา: {stat.presentCount} | สาย: {stat.lateCount} | ขาด: {stat.absentCount}
                </span>
                <span
                  className={`font-semibold ${
                    stat.isAtRisk ? "text-rose-600 font-bold" : "text-zinc-600"
                  }`}
                >
                  {stat.isAtRisk ? "⚠️ เสี่ยงติด มส. (เหลือโควตาขาด 0-1 ครั้ง)" : `เหลือโควตาขาดได้: ${stat.remainingAbsenceQuota} ครั้ง`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Mood Check-in */}
      <div className="glass-card rounded-3xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span>เช็คอินอารมณ์ยามเช้า (Daily Mood)</span>
          </h3>
          <span className="text-[10px] text-zinc-400">บอกให้อาจารย์ที่ปรึกษารู้</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            { key: "HAPPY", icon: "😄", label: "สดชื่น" },
            { key: "NEUTRAL", icon: "😐", label: "ปกติ" },
            { key: "TIRED", icon: "😫", label: "เหนื่อย/ล้า" },
            { key: "STRESSED", icon: "😢", label: "เครียด/มีปัญหา" },
          ].map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => handleMoodSubmit(m.key)}
              className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center space-y-1 ${
                selectedMood === m.key
                  ? "bg-pink-50 border-pink-400 scale-105 shadow-sm"
                  : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-pink-200"
              }`}
            >
              <span className="text-2xl">{m.icon}</span>
              <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* SafeSpace: กล่องข้อความลับถึงอาจารย์ที่ปรึกษา */}
      <div className="glass-card rounded-3xl p-6 shadow-sm border border-pink-200/80 dark:border-pink-900/40 space-y-4 bg-gradient-to-b from-pink-50/20 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-600 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                SafeSpace: ปรึกษา อ.สมศรี (ครูประจำชั้น)
              </h3>
              <p className="text-[11px] text-zinc-500">ข้อมูลลับเฉพาะครูที่ปรึกษาคนเดียวเท่านั้น</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
            🔒 ปลอดภัย 100%
          </span>
        </div>

        {safeSuccessMsg && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center space-x-2 animate-in zoom-in-95">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{safeSuccessMsg}</span>
          </div>
        )}

        <form onSubmit={handleSafeSpaceSubmit} className="space-y-3 text-xs">
          <div className="flex gap-2">
            {["STUDY", "FRIEND", "STRESS", "HEALTH"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSafeCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition ${
                  safeCategory === cat
                    ? "bg-pink-600 text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 hover:bg-pink-50"
                }`}
              >
                {cat === "STUDY" ? "เรื่องเรียน" : cat === "FRIEND" ? "เรื่องเพื่อน" : cat === "STRESS" ? "ความเครียด" : "สุขภาพ"}
              </button>
            ))}
          </div>

          <textarea
            value={safeContent}
            onChange={(e) => setSafeContent(e.target.value)}
            placeholder="เล่าสิ่งที่กังวลหรืออยากให้อาจารย์ช่วยเหลือ (ไม่ต้องกลัวใครรู้นะครับ)..."
            rows={3}
            className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-pink-500 focus:outline-none"
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 text-zinc-600 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={safeMeetReq}
                onChange={(e) => setSafeMeetReq(e.target.checked)}
                className="rounded text-pink-600 focus:ring-pink-500"
              />
              <span>ขอนัดคุยส่วนตัวแบบเงียบๆ ที่ห้องพักครู</span>
            </label>

            <button
              type="submit"
              className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>ส่งข้อความลับ</span>
            </button>
          </div>
        </form>
      </div>

      {/* Submit Leave Request */}
      <div className="glass-card rounded-3xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-sky-600" />
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              ยื่นใบลาหยุดออนไลน์ (Leave Request)
            </h3>
          </div>
        </div>

        {leaveSuccessMsg && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{leaveSuccessMsg}</span>
          </div>
        )}

        <form onSubmit={handleLeaveSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-zinc-500 mb-1">ประเภทการลา</label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
              >
                <option value="SICK">ลาป่วย (แนบใบรับรองแพทย์)</option>
                <option value="BUSINESS">ลากิจ</option>
                <option value="ACTIVITY">ช่วยกิจกรรมโรงเรียน</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-zinc-500 mb-1">วันที่ต้องการลา</label>
              <input
                type="date"
                value={leaveStartDate}
                onChange={(e) => setLeaveStartDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-zinc-500 mb-1">เหตุผลการลา</label>
            <input
              type="text"
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              placeholder="ระบุเหตุผลการลา เช่น เป็นไข้หวัดพบแพทย์..."
              className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 rounded-xl text-xs transition"
          >
            ส่งใบลา (ระบบจะส่งต่อให้ผู้ปกครองกดยืนยัน)
          </button>
        </form>
      </div>

      {/* LINE Notification Simulator Modal */}
      <LineSimulatorModal
        isOpen={!!lineModalData}
        onClose={() => setLineModalData(null)}
        data={lineModalData}
      />
    </div>
  );
}
