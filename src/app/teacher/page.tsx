"use client";

import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Play,
  Square,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  MessageSquare,
  Send,
  Sparkles,
  AlertTriangle,
  Heart,
  Eye,
  Check,
  X,
  Volume2,
} from "lucide-react";
import { QRDisplay } from "@/components/QRDisplay";
import { SkeletonCard, EmptyState, ErrorState } from "@/components/UIStates";
import { LineSimulatorModal } from "@/components/LineSimulatorModal";

export default function TeacherHubPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [safeMessages, setSafeMessages] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Announcement state
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  const [announcementPriority, setAnnouncementPriority] = useState<"NORMAL" | "URGENT">("URGENT");
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // SafeMessage reply state
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [replyText, setReplyText] = useState("");

  // LINE Simulator state
  const [lineModalData, setLineModalData] = useState<any | null>(null);

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch Sessions
      const resSessions = await fetch("/api/v1/sessions?targetRoom=ม.4/1");
      const dataSessions = await resSessions.json();
      if (dataSessions.success) {
        setSessions(dataSessions.data);
        const currentActive = dataSessions.data.find((s: any) => s.status === "ACTIVE") || dataSessions.data[0];
        setActiveSession(currentActive);
      }

      // 2. Fetch Leaves
      const resLeaves = await fetch("/api/v1/leaves?advisorRoom=ม.4/1");
      const dataLeaves = await resLeaves.json();
      if (dataLeaves.success) setLeaves(dataLeaves.data);

      // 3. Fetch SafeMessages
      const resSafe = await fetch("/api/v1/safespace");
      const dataSafe = await resSafe.json();
      if (dataSafe.success) setSafeMessages(dataSafe.data);

      // 4. Fetch All Students in Room
      const resUsers = await fetch("/api/v1/users");
      const dataUsers = await resUsers.json();
      if (dataUsers.success) {
        const roomStudents = dataUsers.data.filter((u: any) => u.role === "STUDENT");
        setStudents(roomStudents);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load teacher dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherData();
    const interval = setInterval(fetchTeacherData, 6000);
    return () => clearInterval(interval);
  }, []);

  // Handle Session Start / Close
  const handleSessionAction = async (action: "START" | "CLOSE") => {
    if (!activeSession) return;
    try {
      const res = await fetch("/api/v1/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: activeSession.id, action }),
      });
      const data = await res.json();
      if (data.success) {
        fetchTeacherData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Manual Fast Roll-call
  const handleRollCallChange = async (studentId: string, status: "PRESENT" | "LATE" | "LEAVE" | "ABSENT") => {
    if (!activeSession) return;
    try {
      const res = await fetch("/api/v1/attendance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSession.id,
          studentId,
          status,
          note: "อาจารย์ติ๊กชื่อผ่านระบบ Fast Roll-call",
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchTeacherData();

        // Trigger simulated LINE notification to parent if Absent or Late
        if (status === "ABSENT" || status === "LATE") {
          const student = students.find((s) => s.id === studentId);
          setLineModalData({
            title: status === "ABSENT" ? "แจ้งเตือนนักเรียนขาดเรียน" : "แจ้งเตือนนักเรียนมาสาย",
            studentName: student?.name || "นักเรียน",
            subjectName: activeSession?.course?.name,
            time: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
            location: activeSession?.course?.room,
            status,
            extraMessage: `อาจารย์ผู้สอนได้บันทึกสถานะ ${status === "ABSENT" ? "ขาดเรียน" : "มาสาย"} ในคาบนี้`,
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Leave Approval
  const handleLeaveAction = async (leaveId: string, action: "TEACHER_APPROVE" | "TEACHER_REJECT") => {
    try {
      const res = await fetch("/api/v1/leaves", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaveId, action }),
      });
      const data = await res.json();
      if (data.success) {
        fetchTeacherData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle SafeMessage Reply
  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;
    try {
      const res = await fetch("/api/v1/safespace", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: selectedMessage.id, reply: replyText }),
      });
      const data = await res.json();
      if (data.success) {
        setReplyText("");
        setSelectedMessage(null);
        fetchTeacherData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Broadcast Announcement
  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementContent.trim()) return;
    try {
      setIsBroadcasting(true);
      const res = await fetch("/api/v1/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: announcementTitle,
          content: announcementContent,
          priority: announcementPriority,
          targetRoom: "ม.4/1",
          senderName: "อ.สมศรี รักษ์เรียน (ครูประจำชั้น ม.4/1)",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAnnouncementTitle("");
        setAnnouncementContent("");
        
        // Show simulated LINE notification preview
        setLineModalData({
          title: "📢 " + data.data.title,
          studentName: "นักเรียนและผู้ปกครอง ม.4/1",
          subjectName: "ประกาศด่วนจากครูประจำชั้น",
          time: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
          status: "URGENT",
          extraMessage: data.data.content,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsBroadcasting(false);
    }
  };

  if (loading && !activeSession) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <SkeletonCard lines={4} />
        <SkeletonCard lines={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <ErrorState message={error} onRetry={fetchTeacherData} />
      </div>
    );
  }

  // Calculate current attendance metrics for active session
  const currentAttendances = activeSession?.attendances || [];
  const presentCount = currentAttendances.filter((a: any) => a.status === "PRESENT").length;
  const lateCount = currentAttendances.filter((a: any) => a.status === "LATE").length;
  const totalChecked = presentCount + lateCount;
  const totalStudents = students.length || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Banner: Teacher Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 text-xs font-semibold px-3 py-1 rounded-full flex items-center space-x-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-300" />
              <span>ห้องครู & อาจารย์ที่ปรึกษา (ม.4/1)</span>
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>ระบบ Real-time เชื่อมต่อแล้ว</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            อ.สมศรี รักษ์เรียน
          </h1>
          <p className="text-sm text-indigo-200">
            วิชาปัจจุบัน: {activeSession?.course?.name || "คณิตศาสตร์เพิ่มเติม"} • {activeSession?.course?.room}
          </p>
        </div>

        {/* Session Action Buttons */}
        <div className="flex items-center space-x-3">
          {activeSession?.status === "ACTIVE" ? (
            <button
              onClick={() => handleSessionAction("CLOSE")}
              className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-3 rounded-2xl font-bold text-xs flex items-center space-x-2 shadow-lg shadow-rose-600/30 transition active:scale-95"
            >
              <Square className="w-4 h-4" />
              <span>ปิดรอบเช็คชื่อ</span>
            </button>
          ) : (
            <button
              onClick={() => handleSessionAction("START")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-2xl font-bold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-600/30 transition active:scale-95"
            >
              <Play className="w-4 h-4" />
              <span>เปิดรอบเช็คชื่อ (เริ่มคาบ)</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid Layout: Left Live QR & Fast Roll-call, Right Leaves & SafeSpace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Live QR + Fast Roll-call Grid */}
        <div className="lg:col-span-7 space-y-6">
          {/* Dynamic Live QR Card */}
          {activeSession && (
            <QRDisplay
              sessionId={activeSession.id}
              courseName={activeSession.course?.name || "คณิตศาสตร์"}
              courseRoom={activeSession.course?.room || "ห้อง 302"}
              pinCode={activeSession.pinCode || "4829"}
            />
          )}

          {/* Live Attendance Ticker & Counter */}
          <div className="glass-card rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>รายชื่อนักเรียน & โหมด Fast Roll-call</span>
                </h3>
                <p className="text-xs text-zinc-500">
                  แตะปุ่มเพื่อเปลี่ยนสถานะนักเรียนได้ทันที (มา / สาย / ลา / ขาด)
                </p>
              </div>

              {/* Counter Badge */}
              <div className="text-right">
                <span className="text-xs font-bold text-zinc-400">เช็คชื่อแล้ว</span>
                <p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  {totalChecked} / {totalStudents} คน
                </p>
              </div>
            </div>

            {/* Student List Roll-Call Table */}
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {students.map((student) => {
                const attRecord = activeSession?.attendances?.find(
                  (a: any) => a.studentId === student.id
                );
                const status = attRecord?.status || "ABSENT";

                return (
                  <div
                    key={student.id}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 px-2 rounded-xl transition"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <img
                        src={student.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
                        alt={student.name}
                        className="w-9 h-9 rounded-full object-cover border border-zinc-200"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {student.name}
                        </p>
                        <p className="text-[11px] text-zinc-400">
                          #{student.code} • Streak 🔥 {student.streakDays || 0} วัน
                        </p>
                      </div>
                    </div>

                    {/* 4-Status Quick Roll-call Buttons */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleRollCallChange(student.id, "PRESENT")}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center space-x-1 ${
                          status === "PRESENT"
                            ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-emerald-50 hover:text-emerald-700"
                        }`}
                      >
                        <Check className="w-3 h-3" />
                        <span>มา</span>
                      </button>

                      <button
                        onClick={() => handleRollCallChange(student.id, "LATE")}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center space-x-1 ${
                          status === "LATE"
                            ? "bg-amber-500 text-white shadow-sm shadow-amber-500/30"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-amber-50 hover:text-amber-700"
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>สาย</span>
                      </button>

                      <button
                        onClick={() => handleRollCallChange(student.id, "LEAVE")}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center space-x-1 ${
                          status === "LEAVE"
                            ? "bg-sky-500 text-white shadow-sm shadow-sky-500/30"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-sky-50 hover:text-sky-700"
                        }`}
                      >
                        <span>ลา</span>
                      </button>

                      <button
                        onClick={() => handleRollCallChange(student.id, "ABSENT")}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center space-x-1 ${
                          status === "ABSENT" && attRecord
                            ? "bg-rose-600 text-white shadow-sm shadow-rose-600/30"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-rose-50 hover:text-rose-700"
                        }`}
                      >
                        <X className="w-3 h-3" />
                        <span>ขาด</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): SafeSpace Inbox, Leaves Approval, Broadcast */}
        <div className="lg:col-span-5 space-y-6">
          {/* SafeSpace Counselor Inbox (กล่องความในใจถึงอาจารย์ที่ปรึกษา) */}
          <div className="glass-card rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-600 flex items-center justify-center">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    SafeSpace: ข้อความปรึกษาอาจารย์
                  </h3>
                  <p className="text-[11px] text-zinc-500">ข้อมูลลับเฉพาะครูประจำชั้นเท่านั้น</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200">
                {safeMessages.length} ข้อความ
              </span>
            </div>

            {safeMessages.length === 0 ? (
              <EmptyState
                title="ยังไม่มีข้อความปรึกษา"
                description="เมื่อนักเรียนส่งข้อความขอคำปรึกษา จะปรากฏที่นี่อย่างเป็นส่วนตัว"
              />
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {safeMessages.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => {
                      setSelectedMessage(msg);
                      setReplyText(msg.reply || "");
                    }}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition ${
                      selectedMessage?.id === msg.id
                        ? "bg-pink-50/80 border-pink-300 dark:bg-pink-950/40"
                        : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-pink-200"
                    }`}
                  >
                    <div className="flex items-center justify-between pb-1.5">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        {msg.student?.name}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-pink-100 text-pink-700">
                        หมวด: {msg.category}
                      </span>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-300 line-clamp-2">{msg.content}</p>

                    {msg.reply && (
                      <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-emerald-700 dark:text-emerald-400 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>ตอบกลับแล้ว</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Reply Drawer / Box */}
            {selectedMessage && (
              <div className="mt-3 p-3 bg-pink-50/50 dark:bg-zinc-800/50 rounded-xl border border-pink-200 space-y-2 animate-in fade-in duration-150">
                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  ตอบกลับ {selectedMessage.student?.name}:
                </p>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="พิมพ์ข้อความให้กำลังใจ หรือเวลานัดพบที่ห้องพักครู..."
                  rows={2}
                  className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="text-xs px-3 py-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleSendReply}
                    className="text-xs px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-bold flex items-center space-x-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>ส่งข้อความตอบกลับ</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Leave Requests Approval Queue */}
          <div className="glass-card rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-sky-600" />
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  คำขอลาหยุด (Leave Requests)
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                {leaves.length} รายการ
              </span>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {leaves.map((leave) => (
                <div
                  key={leave.id}
                  className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      {leave.student?.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        leave.teacherStatus === "APPROVED"
                          ? "bg-emerald-100 text-emerald-700"
                          : leave.teacherStatus === "REJECTED"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {leave.teacherStatus === "APPROVED"
                        ? "อนุมัติแล้ว"
                        : leave.teacherStatus === "REJECTED"
                        ? "ไม่อนุมัติ"
                        : "รออาจารย์อนุมัติ"}
                    </span>
                  </div>

                  <p className="text-zinc-600 dark:text-zinc-300">
                    เหตุผล: {leave.reason}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-zinc-100">
                    <span>
                      {leave.parentApproved ? "✅ ผู้ปกครองยืนยันแล้ว" : "⏳ รอผู้ปกครองยืนยัน"}
                    </span>
                    {leave.teacherStatus === "PENDING" && (
                      <div className="flex space-x-1.5">
                        <button
                          onClick={() => handleLeaveAction(leave.id, "TEACHER_APPROVE")}
                          className="px-2 py-1 rounded bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                        >
                          อนุมัติ
                        </button>
                        <button
                          onClick={() => handleLeaveAction(leave.id, "TEACHER_REJECT")}
                          className="px-2 py-1 rounded bg-rose-600 text-white font-bold hover:bg-rose-700"
                        >
                          ปฏิเสธ
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Broadcast Announcement */}
          <div className="glass-card rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-3">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>ส่งประกาศด่วนถึง LINE ผู้ปกครอง & นักเรียน</span>
            </h3>

            <form onSubmit={handleBroadcast} className="space-y-3 text-xs">
              <input
                type="text"
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                placeholder="หัวข้อประกาศ เช่น พรุ่งนี้เตรียมชุดพละ"
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <textarea
                value={announcementContent}
                onChange={(e) => setAnnouncementContent(e.target.value)}
                placeholder="รายละเอียดประกาศ..."
                rows={2}
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={isBroadcasting}
                className="w-full bg-[#06C755] hover:bg-[#05a847] text-white font-bold py-2.5 rounded-xl transition shadow-md shadow-[#06C755]/20 flex items-center justify-center space-x-1.5 active:scale-[0.98]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isBroadcasting ? "กำลังส่ง..." : "บรอดแคสต์เข้า LINE ผู้ปกครอง"}</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* LINE Flex Card Simulator Modal */}
      <LineSimulatorModal
        isOpen={!!lineModalData}
        onClose={() => setLineModalData(null)}
        data={lineModalData}
      />
    </div>
  );
}
