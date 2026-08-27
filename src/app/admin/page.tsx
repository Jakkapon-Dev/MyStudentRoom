"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Download,
  Users,
  Building2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  FileSpreadsheet,
  Printer,
  Sparkles,
} from "lucide-react";
import { SkeletonCard, EmptyState, ErrorState } from "@/components/UIStates";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/v1/stats?mode=overview");
      const resData = await res.json();
      if (resData.success) {
        setData(resData.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load academic data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Export CSV
  const handleExportCSV = () => {
    if (!data?.studentList) return;

    const headers = ["StudentCode", "Name", "Room", "StreakDays", "Points", "Role"];
    const rows = data.studentList.map((s: any) => [
      s.code || "",
      `"${s.name}"`,
      s.studentRoom || "",
      s.streakDays || 0,
      s.points || 0,
      s.role,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e: any) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `MyStudentRoom_Attendance_Report_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading && !data) {
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
        <ErrorState message={error} onRetry={fetchAdminData} />
      </div>
    );
  }

  const overview = data?.overview || {};
  const studentList = data?.studentList || [];
  const recentAttendances = data?.recentAttendances || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
              ฝ่ายวิชาการและทะเบียน
            </span>
            <span className="text-xs text-zinc-400">ปีการศึกษา 2569</span>
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">
            รายงานสถิติการเข้าเรียนภาพรวม (Academic Overview)
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 flex items-center space-x-1.5 shadow-sm transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>พิมพ์รายงาน (Print)</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-indigo-600/20 transition active:scale-95"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export เป็น Excel/CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-2">
          <span className="text-xs text-zinc-500 font-medium">อัตราการเข้าเรียนรวม</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-emerald-600">
              {overview.overallAttendanceRate}%
            </span>
            <span className="text-xs text-emerald-600 font-bold flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" />
              +2.4%
            </span>
          </div>
          <p className="text-[11px] text-zinc-400">อยู่ในเกณฑ์ดีเยี่ยมตลอดภาคเรียน</p>
        </div>

        <div className="glass-card rounded-2xl p-5 shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-2">
          <span className="text-xs text-zinc-500 font-medium">จำนวนนักเรียนทั้งหมด</span>
          <p className="text-3xl font-black text-zinc-900 dark:text-zinc-100">
            {overview.totalStudents} คน
          </p>
          <p className="text-[11px] text-zinc-400">ระดับชั้น ม.4 ทั้งหมด</p>
        </div>

        <div className="glass-card rounded-2xl p-5 shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-2">
          <span className="text-xs text-zinc-500 font-medium">คลาสที่กำลังเปิดสอนสด</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-indigo-600">
              {overview.activeSessions} คลาส
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <p className="text-[11px] text-zinc-400">เช็คชื่อด้วย Dynamic QR & GPS</p>
        </div>

        <div className="glass-card rounded-2xl p-5 shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-2">
          <span className="text-xs text-zinc-500 font-medium">ใบลาที่รออนุมัติ</span>
          <p className="text-3xl font-black text-amber-500">{overview.pendingLeaves} รายการ</p>
          <p className="text-[11px] text-zinc-400">รออาจารย์ประจำวิชาตรวจสอบ</p>
        </div>
      </div>

      {/* Main Table: Student Master Directory */}
      <div className="glass-card rounded-3xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>ทะเบียนนักเรียนและสถิติการมาเรียน (Student Attendance Roster)</span>
            </h3>
            <p className="text-xs text-zinc-500">ข้อมูลสรุปรายบุคคลสำหรับส่งฝ่ายวิชาการ</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400">
                <th className="pb-3 font-semibold">รหัสนักเรียน</th>
                <th className="pb-3 font-semibold">ชื่อ - นามสกุล</th>
                <th className="pb-3 font-semibold">ห้องเรียน</th>
                <th className="pb-3 font-semibold">On-Time Streak</th>
                <th className="pb-3 font-semibold">จิตพิสัย</th>
                <th className="pb-3 font-semibold text-right">สถานะสิทธิ์สอบ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {studentList.map((st: any) => (
                <tr key={st.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition">
                  <td className="py-3.5 font-mono text-zinc-500">#{st.code}</td>
                  <td className="py-3.5 font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2.5">
                    <img
                      src={st.avatarUrl || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100"}
                      alt={st.name}
                      className="w-7 h-7 rounded-full object-cover border"
                    />
                    <span>{st.name}</span>
                  </td>
                  <td className="py-3.5 text-zinc-600 dark:text-zinc-400">{st.studentRoom}</td>
                  <td className="py-3.5 font-bold text-amber-600">🔥 {st.streakDays} วัน</td>
                  <td className="py-3.5 font-bold text-indigo-600">{st.points} pts</td>
                  <td className="py-3.5 text-right">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ✅ มีสิทธิ์สอบ (Normal)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
