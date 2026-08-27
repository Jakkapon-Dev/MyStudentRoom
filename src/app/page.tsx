"use client";

import React from "react";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  HeartHandshake,
  ShieldCheck,
  QrCode,
  MapPin,
  Flame,
  Heart,
  MessageSquare,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default function HomePage() {
  const portals = [
    {
      title: "ห้องครูผู้สอน & ที่ปรึกษา (Teacher Hub)",
      description:
        "ฉาย Dynamic QR บนจอโปรเจกเตอร์ (หมุนทุก 8 วิ), โหมด Fast Roll-call ติ๊กชื่อรวดเร็ว, อนุมัติใบลา และดูแล SafeSpace นักเรียน",
      href: "/teacher",
      icon: GraduationCap,
      badge: "อาจารย์ / ครูประจำชั้น",
      color: "from-indigo-600 to-indigo-800",
      accent: "text-indigo-600 bg-indigo-50 border-indigo-200",
      tags: ["Dynamic QR", "Fast Roll-call", "SafeSpace Inbox", "LINE Broadcast"],
    },
    {
      title: "พอร์ทัลนักเรียน (Student Mobile App)",
      description:
        "สแกน QR ผ่านมือถือพร้อมตรวจพิกัด GPS ในห้องเรียน, ดูเกจวัดสิทธิ์สอบ 80%, บันทึก Daily Mood, ปรึกษาครูที่ปรึกษา และสะสม Streak",
      href: "/student",
      icon: Users,
      badge: "นักเรียน / นักศึกษา",
      color: "from-sky-600 to-indigo-700",
      accent: "text-sky-600 bg-sky-50 border-sky-200",
      tags: ["QR & GPS Check-in", "80% Rule Exam Meter", "SafeSpace กล่องความในใจ", "Daily Mood"],
    },
    {
      title: "ผู้ปกครองบน LINE (Parent LINE Portal)",
      description:
        "ติดตามไทม์ไลน์ลูก Real-time (ถึง รร. / เข้าแต่ละคาบ), กดยืนยันการลาหยุด, รับประกาศด่วน และดูสถิติรายสัปดาห์",
      href: "/parent",
      icon: HeartHandshake,
      badge: "ผู้ปกครอง (LINE LIFF)",
      color: "from-emerald-600 to-[#06C755]",
      accent: "text-[#06C755] bg-emerald-50 border-emerald-200",
      tags: ["Real-time Timeline", "LINE Flex Cards", "ยืนยันใบลา", "แจ้งเตือนขาด/สาย"],
    },
    {
      title: "ฝ่ายวิชาการ & ทะเบียน (Academic Admin)",
      description:
        "แดชบอร์ดสรุปสถิติการมาเรียนทั้งโรงเรียน, กราฟแนวโน้ม, จัดการรายชื่อนักเรียน/อาจารย์ และ Export รายงานเป็น Excel / PDF",
      href: "/admin",
      icon: ShieldCheck,
      badge: "ฝ่ายบริหาร / ทะเบียน",
      color: "from-slate-800 to-slate-900",
      accent: "text-rose-600 bg-rose-50 border-rose-200",
      tags: ["School Heatmap", "Excel / CSV Export", "Student Roster", "Printable Sheets"],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 animate-in fade-in duration-200">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Gen Smart Attendance & Well-being Ecosystem</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
          ระบบเช็คชื่ออัจฉริยะ & ดูแลช่วยเหลือนักเรียนครบวงจร
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
          เชื่อมโยงโรงเรียน อาจารย์ นักเรียน และผู้ปกครองเข้าด้วยกันอย่างไร้รอยต่อ ป้องกันการโกงด้วย Dynamic QR + GPS พร้อมระบบ SafeSpace เพื่อสุขภาวะจิตใจของนักเรียน
        </p>
      </div>

      {/* 4 Feature Portals Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {portals.map((portal) => {
          const Icon = portal.icon;
          return (
            <Link
              key={portal.href}
              href={portal.href}
              className="group block glass-card rounded-3xl p-7 shadow-sm hover:shadow-xl border border-zinc-200 dark:border-zinc-800 transition-all duration-200 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between">
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${portal.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${portal.accent}`}>
                  {portal.badge}
                </span>
              </div>

              <div className="mt-5 space-y-2">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 transition flex items-center justify-between">
                  <span>{portal.title}</span>
                  <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition" />
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  {portal.description}
                </p>
              </div>

              {/* Feature Tags */}
              <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap gap-1.5">
                {portal.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Highlights Bar */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
        <div className="space-y-1">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2">
            <QrCode className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">Dynamic Live QR</h4>
          <p className="text-[11px] text-zinc-500">หมุนรหัสทุก 8 วินาที ป้องกันโกง</p>
        </div>

        <div className="space-y-1">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
            <MapPin className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">GPS Geofencing</h4>
          <p className="text-[11px] text-zinc-500">ตรวจจับพิกัดในรัศมีห้องเรียน</p>
        </div>

        <div className="space-y-1">
          <div className="w-10 h-10 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center mx-auto mb-2">
            <Heart className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">Advisor SafeSpace</h4>
          <p className="text-[11px] text-zinc-500">กล่องความในใจปรึกษาครูที่ปรึกษา</p>
        </div>

        <div className="space-y-1">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2">
            <Flame className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">80% Rule & Streak</h4>
          <p className="text-[11px] text-zinc-500">คำนวณสิทธิ์สอบ & เหรียญรางวัล</p>
        </div>
      </div>
    </div>
  );
}
