# 🏫 MyStudentRoom — Smart Attendance & Parent Tracking Platform

> **Next-Gen Smart Attendance, Classroom Management, Advisor SafeSpace & Parent LINE Integration Platform**  
> *Engineered with Next.js 15, TypeScript, Tailwind CSS, Prisma ORM, and SQLite.*

---

## 🌟 Key Features

### 1. 👨‍🏫 Teacher Hub (`/teacher`)
* **Dynamic Live QR Code:** Rotates security hash token every 8 seconds with countdown timer to prevent proxy check-in / photo sharing.
* **Fast Roll-Call Grid:** 1-click status change (`[Present]`, `[Late]`, `[Leave]`, `[Absent]`) with instant count ticker.
* **Advisor SafeSpace Inbox:** Private, confidential message box for students seeking advice, with direct reply & meeting scheduler.
* **Leave Requests Queue:** View student leave reasons and medical certificate proofs with 1-click approval.
* **Instant LINE Broadcaster:** Broadcast urgent alerts directly to parents and students.

### 2. 🎒 Student Mobile Portal (`/student`)
* **Smart Check-in:** In-browser QR Token scanner + Geofencing validation ensuring student is physically inside classroom radius.
* **80% Rule Exam Meter:** Real-time calculator tracking attendance percentage, remaining absence quota, and at-risk exam warnings.
* **Daily Mood Check-in:** Morning well-being meter (`😄 Fresh`, `😐 Normal`, `😫 Tired`, `😢 Stressed`).
* **Confidential SafeSpace Box:** Encrypted message portal directly to the classroom advisor.
* **On-time Streak & Gamification:** Consecutive on-time attendance streak counter (🔥) and behavioral points.

### 3. 👨‍👩‍👧 Parent LINE LIFF Portal (`/parent`)
* **Live Daily Timeline:** Real-time chronological tracking of arrival at school gate and period-by-period classroom check-ins.
* **Leave Confirmation & Submission:** Parents can confirm child-submitted leaves or submit direct absence notices.
* **Urgent School Announcements:** Broadcast stream with read receipts.
* **Interactive LINE Flex Cards:** Simulated preview of official LINE notifications.

### 4. 🏫 Academic Admin Dashboard (`/admin`)
* **School-wide Overview:** Total students, attendance rate %, active sessions, and pending leaves.
* **Student Attendance Roster:** Searchable directory with streak records and exam eligibility.
* **Export Reports:** Export to Excel / CSV and printable PDF sheet view.

---

## 🛠️ Technology Stack

* **Framework:** [Next.js 15](https://nextjs.org/) (App Router, React 19, TypeScript)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [Lucide Icons](https://lucide.dev/)
* **Database & ORM:** [Prisma ORM](https://www.prisma.io/) with SQLite
* **Validation:** [Zod](https://zod.dev/)
* **Security & Tokens:** HMAC rotating tokens, Haversine Geofencing

---

## 🚀 Getting Started Locally

### Prerequisites
* Node.js 18.17+ or 20+
* npm or pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Jakkapon-Dev/MyStudentRoom.git
   cd MyStudentRoom
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Initialize Database & Seed Data:**
   ```bash
   npx prisma db push
   node prisma/seed.js
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```

5. **Open in Browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🎛️ Demo Role Switcher

Use the top navigation bar to switch personas in 1-click:
* 👨‍🏫 **Teacher:** อ.สมศรี รักษ์เรียน (Advisor ม.4/1)
* 🎒 **Student:** นาย ชัยวัฒน์ ภักดี (STU40101)
* 👨‍👩‍👧 **Parent:** คุณแม่ สมใจ ภักดี (Parent of ชัยวัฒน์)
* 🏫 **Admin:** อาจารย์ วิชัย มั่นคง (Academic Dept)

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
