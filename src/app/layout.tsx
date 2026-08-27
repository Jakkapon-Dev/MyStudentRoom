import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RoleSwitcher } from "@/components/RoleSwitcher";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MyStudentRoom — ระบบเช็คชื่ออัจฉริยะ & ติดตามบุตรหลานแบบเรียลไทม์",
  description:
    "แพลตฟอร์มบริหารจัดการการเข้าเรียน ดูแลช่วยเหลือนักเรียน SafeSpace และติดตามบุตรหลานผ่าน LINE สำหรับสถานศึกษา",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 antialiased`}>
        <RoleSwitcher />
        <main className="flex-1">{children}</main>
        <footer className="py-6 text-center text-xs text-zinc-400 border-t border-zinc-200/60 dark:border-zinc-800/60">
          <p>© 2026 MyStudentRoom Platform — Engineered with Apex Protocol (v5.0)</p>
        </footer>
      </body>
    </html>
  );
}
