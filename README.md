# 🏫 MyStudentRoom — Smart Attendance & Parent Tracking Platform
**ระบบบริหารจัดการการเข้าเรียนอัจฉริยะ ดูแลช่วยเหลือนักเรียน SafeSpace และติดตามบุตรหลานผ่าน LINE**

[![Next.js 15](https://img.shields.io/badge/Next.js-15.1.7-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.2-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

---

## 📖 สารบัญ (Table of Contents)
* [ภาพรวมของระบบ (Overview)](#-ภาพรวมของระบบ-overview)
* [จุดเด่นและฟีเจอร์หลัก (Key Features)](#-จุดเด่นและฟีเจอร์หลัก-key-features)
* [โครงสร้างสถาปัตยกรรม (System Architecture)](#-โครงสร้างสถาปัตยกรรม-system-architecture)
* [เทคโนโลยีที่ใช้ (Tech Stack)](#-เทคโนโลยีที่ใช้-tech-stack)
* [ขั้นตอนการติดตั้งและรันในเครื่อง (Installation & Setup)](#-ขั้นตอนการติดตั้งและรันในเครื่อง-installation--setup)
* [บัญชีและบทบาทสำหรับทดสอบ (Demo Accounts)](#-บัญชีและบทบาทสำหรับทดสอบ-demo-accounts)
* [โครงสร้างโฟลเดอร์ (Project Structure)](#-โครงสร้างโฟลเดอร์-project-structure)

---

## 🎯 ภาพรวมของระบบ (Overview)
**MyStudentRoom** คือแพลตฟอร์มบริหารจัดการการเข้าเรียนและดูแลช่วยเหลือนักเรียนแบบครบวงจร (All-in-One School Ecosystem) ที่เชื่อมโยง **4 กลุ่มผู้ใช้งานหลัก** ได้แก่ **อาจารย์ผู้สอน, นักเรียน, ผู้ปกครอง, และฝ่ายวิชาการ** เข้าด้วยกันอย่างสมบูรณ์แบบ แก้ปัญหาการเช็คชื่อแบบเดิมๆ ด้วย **Dynamic QR Code (เปลี่ยนรหัสทุก 8 วิ)** และ **GPS Geofencing** พร้อมไทม์ไลน์ติดตามบุตรหลานแบบ Real-time ผ่าน **LINE LIFF**, กล่องส่งข้อความลับปรึกษาอาจารย์ที่ปรึกษา (**SafeSpace**), และ **ระบบเรดาร์ตรวจวัดภาระการบ้าน (Homework Load Radar)** เพื่อป้องกันไม่ให้นักเรียนทำการบ้านหนักจนเกินไป

---

## 🌟 จุดเด่นและฟีเจอร์หลัก (Key Features)

### 1. 👨‍🏫 ห้องครูผู้สอน & ที่ปรึกษา (`/teacher`)
* **Dynamic Live QR Display:** ฉายขึ้นจอโปรเจกเตอร์ในห้องเรียน รหัส Token หมุนเปลี่ยนอัตโนมัติทุก 8 วินาที ป้องกันการแคปภาพส่งต่อให้เพื่อนนอกห้อง
* **Fast Roll-Call Grid:** แตะเปลี่ยนสถานะนักเรียนรายบุคคลได้ทันที `[มา]` `[สาย]` `[ลา]` `[ขาด]` พร้อมนับยอดคนเข้าเรียนสด
* **Daily Homework Load Radar:** เรดาร์ตรวจวัดความหนาแน่นของการบ้านในห้องวันนี้ (🟢 ปกติ / 🟡 ปานกลาง / 🔴 หนาแน่น) เพื่อช่วยครูตัดสินใจในการสั่งงานไม่ให้ซ้ำซ้อน
* **Quick Homework Logger:** ฟอร์มบันทึกการบ้านแบบยืดหยุ่น ไม่ล็อกข้อมูล พร้อมปุ่มลัดวันส่ง `[ส่งคาบหน้า]` `[ส่งพรุ่งนี้]` `[ส่งสัปดาห์หน้า]`
* **Advisor SafeSpace Inbox:** กล่องรับข้อความลับที่นักเรียนส่งหาอาจารย์ที่ปรึกษา พร้อมระบบพิมพ์ข้อความตอบกลับหรือนัดพบส่วนตัว
* **Leave Approval Queue:** ตรวจสอบคำขอลาของนักเรียน (ดูเหตุผลและรูปใบรับรองแพทย์) และกดอนุมัติ/ปฏิเสธได้ทันที
* **Instant LINE Broadcaster:** ส่งประกาศด่วนตรงเข้าสู่ LINE ของผู้ปกครองและนักเรียนในห้อง

### 2. 🎒 พอร์ทัลนักเรียนบนมือถือ (`/student`)
* **Smart Check-in:** สแกน QR Token หรือกรอกรหัส PIN พร้อมระบบตรวจสอบพิกัด GPS ว่าอยู่ในรัศมีห้องเรียนจริง
* **Today's Homework Tasks:** แสดงรายการการบ้านทั้งหมดที่สั่งในห้องวันนี้ พร้อมกล่อง Checkbox ติ๊กถูกเมื่อทำเสร็จ
* **เกจวัดสิทธิ์เข้าสอบ 80% (80% Exam Meter):** คำนวณเปอร์เซ็นต์การเข้าเรียนแยกตามรายวิชา แสดงโควตาการขาดที่เหลือ และเตือนหากเสี่ยงติด มส.
* **Daily Mood Check-in:** เช็คอินอารมณ์ยามเช้า `[😄 สดชื่น]` `[😐 ปกติ]` `[😫 เหนื่อย]` `[😢 เครียด]`
* **Confidential SafeSpace Box:** กล่องส่งข้อความลับถึงครูประจำชั้น ขอนัดคุยส่วนตัวแบบเงียบๆ ปลอดภัย 100%
* **Streak & Gamification:** นับจำนวนวันที่มาตรงเวลาต่อเนื่อง (🔥) และสะสมคะแนนจิตพิสัย

### 3. 👨‍👩‍👧 พอร์ทัลผู้ปกครองบน LINE LIFF (`/parent`)
* **Live Daily Timeline:** ไทม์ไลน์ความเคลื่อนไหวสดของลูก (เวลาเดินทางถึงประตูโรงเรียน + เวลาเข้าเรียนแต่ละคาบ)
* **Child's Homework Overview:** แสดงรายการการบ้านของลูกในวันนี้และกำหนดส่ง
* **Parent Leave Confirmation:** กดยืนยันรับทราบการลาของลูก หรือส่งใบลาแทนลูกตรงถึงคุณครู
* **Urgent School Announcements:** รับข่าวสารและประกาศด่วนจากโรงเรียน
* **LINE Flex Card Simulator:** หน้าต่างจำลองการส่งการ์ดแจ้งเตือนบน LINE แบบสมจริง

### 4. 🏫 ฝ่ายวิชาการ & ทะเบียน (`/admin`)
* **School Overview Metrics:** สรุปอัตราการเข้าเรียนรวมของโรงเรียน, คลาสที่กำลังสอนสด, ใบลาที่รออนุมัติ
* **Student Attendance Roster:** ทะเบียนนักเรียน สถิติ On-time Streak และสถานะสิทธิ์สอบ
* **Export Reports:** ส่งออกข้อมูลเป็นไฟล์ **Excel / CSV** และมุมมองพร้อมสั่งพิมพ์ (Print View)

---

## 🏛️ โครงสร้างสถาปัตยกรรม (System Architecture)

```
       [ 🏫 ฝ่ายวิชาการ / Admin ]
       • จัดการข้อมูล • สถิติรวม • ออกรายงาน Excel/PDF
                 │
                 ├─── [ 👨‍🏫 คุณครู / อาจารย์ ]
                 │    • ยิง Dynamic QR (หมุนทุก 8 วิ) / Fast Roll-Call
                 │    • เรดาร์วัดภาระการบ้าน (Homework Load Balancer)
                 │    • อนุมัติใบลา & ตรวจใบรับรองแพทย์
                 │    • ดูแล SafeSpace & กล่องความในใจ
                 │    • ส่งประกาศด่วนเข้า LINE
                 │
                 ├─── [ 🎒 นักเรียน ]
                 │    • สแกน QR + ตรวจพิกัด GPS Geofencing
                 │    • Checklist การบ้านวันนี้ (Interactive Task)
                 │    • เกจวัดสิทธิ์สอบ (กฎ 80%) & Streak
                 │    • เช็คอิน Daily Mood & ส่งข้อความลับหาครูที่ปรึกษา
                 │    • ยื่นคำขอลาหยุด
                 │
                 └─── [ 👨‍👩‍👧 ผู้ปกครอง (ผ่าน LINE OA / LIFF) ]
                      • ไทม์ไลน์ติดตามลูก Real-time (ถึง รร. / เข้าแต่ละคาบ)
                      • ดูรายการการบ้านและกำหนดส่งของลูก
                      • ยืนยันการลา / ส่งใบลาแทนลูก
                      • รับประกาศด่วน & การ์ดสรุปเข้าเรียนประจำสัปดาห์
```

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

* **Core Framework:** [Next.js 15 (App Router)](https://nextjs.org/) + React 19 + TypeScript
* **Styling & UI:** [Tailwind CSS](https://tailwindcss.com/) + [Lucide Icons](https://lucide.dev/)
* **Database & ORM:** [Prisma ORM](https://www.prisma.io/) + SQLite (Zero-config local database)
* **Validation:** [Zod Contract Validation](https://zod.dev/)
* **Security & Tokens:** HMAC rotating tokens, Haversine Geofencing Algorithm
* **Interactivity:** Canvas QR Generator, Canvas Confetti

---

## 🚀 ขั้นตอนการติดตั้งและรันในเครื่อง (Installation & Setup)

### 1. Clone Repository
```bash
git clone https://github.com/Jakkapon-Dev/MyStudentRoom.git
cd MyStudentRoom
```

### 2. ติดตั้ง Dependencies
```bash
npm install
```

### 3. สร้างฐานข้อมูลและ Seed ข้อมูลตัวอย่าง
```bash
npx prisma db push
node prisma/seed.js
```

### 4. รัน Development Server
```bash
npm run dev
```

เปิดเบราว์เซอร์ไปที่: **`http://localhost:3000`**

---

## 👥 บัญชีและบทบาทสำหรับทดสอบ (Demo Accounts)

ระบบมี **Universal Demo Role Switcher** อยู่ที่แถบด้านบนสุด สามารถคลิกสลับบทบาทได้ทันที:

| บทบาท | ชื่อผู้ใช้ | รายละเอียดการทดสอบ |
|---|---|---|
| 👨‍🏫 **Teacher** | อ.สมศรี รักษ์เรียน | อาจารย์ประจำชั้น ม.4/1, ครูวิชาคณิตศาสตร์, คุม Dynamic QR, เรดาร์การบ้าน, อนุมัติใบลา |
| 🎒 **Student** | นาย ชัยวัฒน์ ภักดี | นักเรียน ม.4/1 (STU40101), สแกน QR, Checklist การบ้าน, เช็คสิทธิ์สอบ 80%, Streak 🔥 18 วัน |
| 👨‍👩‍👧 **Parent** | คุณแม่ สมใจ ภักดี | ผู้ปกครองของ นาย ชัยวัฒน์, ดู Live Timeline, ดูการบ้านลูก, ยืนยันใบลา |
| 🏫 **Admin** | อาจารย์ วิชัย มั่นคง | ฝ่ายวิชาการและทะเบียน, ดู Overview Metrics, Export รายงาน Excel/CSV |

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
