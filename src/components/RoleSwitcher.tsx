"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Users,
  GraduationCap,
  HeartHandshake,
  ShieldCheck,
  Smartphone,
  ChevronDown,
  Sparkles,
  Layers,
} from "lucide-react";
import { CurrentUser } from "@/lib/types";

export function RoleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [users, setUsers] = useState<CurrentUser[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetch("/api/v1/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setUsers(data.data);
          
          // Auto select user from localStorage or pick default
          const savedUserId = localStorage.getItem("MSR_ACTIVE_USER_ID");
          const found = data.data.find((u: CurrentUser) => u.id === savedUserId);
          if (found) {
            setCurrentUser(found);
          } else {
            // Default to Teacher Somsri
            const defaultTeacher = data.data.find((u: CurrentUser) => u.role === "TEACHER") || data.data[0];
            setCurrentUser(defaultTeacher);
            localStorage.setItem("MSR_ACTIVE_USER_ID", defaultTeacher.id);
          }
        }
      })
      .catch((err) => console.error("Error loading users for switcher:", err));
  }, []);

  const handleSelectUser = (user: CurrentUser) => {
    setCurrentUser(user);
    localStorage.setItem("MSR_ACTIVE_USER_ID", user.id);
    setIsOpen(false);

    // Auto navigate to corresponding role page
    if (user.role === "TEACHER") router.push("/teacher");
    else if (user.role === "STUDENT") router.push("/student");
    else if (user.role === "PARENT") router.push("/parent");
    else if (user.role === "ADMIN") router.push("/admin");
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "TEACHER":
        return {
          label: "อาจารย์ผู้สอน & ที่ปรึกษา",
          bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
          icon: GraduationCap,
        };
      case "STUDENT":
        return {
          label: "นักเรียน (ม.4/1)",
          bg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
          icon: Users,
        };
      case "PARENT":
        return {
          label: "ผู้ปกครอง (LINE LIFF)",
          bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          icon: HeartHandshake,
        };
      case "ADMIN":
        return {
          label: "ฝ่ายวิชาการ (Admin)",
          bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
          icon: ShieldCheck,
        };
      default:
        return { label: role, bg: "bg-zinc-100 text-zinc-600", icon: Users };
    }
  };

  const currentBadge = currentUser ? getRoleBadge(currentUser.role) : null;

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => router.push("/")}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-sky-600 bg-clip-text text-transparent">
                  MyStudentRoom
                </span>
                <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  Apex v5.0
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 hidden sm:block">
                ระบบเช็คชื่ออัจฉริยะ & ติดตามบุตรหลานแบบเรียลไทม์
              </p>
            </div>
          </div>

          {/* Role Navigation Quick Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-zinc-100/80 dark:bg-zinc-900/80 p-1 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60">
            <button
              onClick={() => router.push("/teacher")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
                pathname.startsWith("/teacher")
                  ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>ห้องครู (Teacher Hub)</span>
            </button>
            <button
              onClick={() => router.push("/student")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
                pathname.startsWith("/student")
                  ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>นักเรียน (Student)</span>
            </button>
            <button
              onClick={() => router.push("/parent")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
                pathname.startsWith("/parent")
                  ? "bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>ผู้ปกครอง (LINE)</span>
            </button>
            <button
              onClick={() => router.push("/admin")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
                pathname.startsWith("/admin")
                  ? "bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>วิชาการ (Admin)</span>
            </button>
          </nav>

          {/* Universal Demo Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center space-x-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 hover:border-indigo-300 dark:hover:border-indigo-700 transition shadow-sm"
            >
              {currentUser?.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                  {currentUser?.name[0] || "U"}
                </div>
              )}
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-1">
                  <span>{currentUser?.name || "เลือกผู้ใช้ทดสอบ"}</span>
                </div>
                {currentBadge && (
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${currentBadge.bg}`}
                  >
                    {currentBadge.label}
                  </span>
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-2 z-50 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>สลับบทบาททดสอบ (Demo Switcher)</span>
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-1 py-1">
                  {users.map((user) => {
                    const badge = getRoleBadge(user.role);
                    const isSelected = currentUser?.id === user.id;
                    const Icon = badge.icon;

                    return (
                      <button
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center space-x-3 transition ${
                          isSelected
                            ? "bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/80"
                            : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                        }`}
                      >
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover border"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600">
                            <Icon className="w-4 h-4" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                            {user.name}
                          </p>
                          <div className="flex items-center space-x-1 mt-0.5">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${badge.bg}`}
                            >
                              {badge.label}
                            </span>
                            {user.code && (
                              <span className="text-[10px] text-zinc-400">
                                #{user.code}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
