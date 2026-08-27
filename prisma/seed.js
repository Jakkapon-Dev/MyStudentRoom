const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Clearing existing database...');
  await prisma.attendanceRecord.deleteMany();
  await prisma.classSession.deleteMany();
  await prisma.homeworkAssignment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.gateRecord.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.moodLog.deleteMany();
  await prisma.safeMessage.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.classPrep.deleteMany();
  await prisma.parentStudentLink.deleteMany();
  await prisma.user.deleteMany();

  console.log('👤 Creating Users (Admin, Teachers, Students, Parents)...');

  // 1. Admin
  const admin = await prisma.user.create({
    data: {
      id: 'admin_1',
      code: 'ADM001',
      name: 'อาจารย์ วิชัย มั่นคง (ฝ่ายวิชาการ)',
      email: 'academic@mystudentroom.edu',
      role: 'ADMIN',
      phone: '081-111-2233',
    },
  });

  // 2. Teachers
  const teacherSomsri = await prisma.user.create({
    data: {
      id: 'teacher_somsri',
      code: 'TCH101',
      name: 'อ.สมศรี รักษ์เรียน',
      email: 'somsri@mystudentroom.edu',
      role: 'TEACHER',
      phone: '089-222-3344',
      advisorRoom: 'ม.4/1',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
  });

  const teacherPrasert = await prisma.user.create({
    data: {
      id: 'teacher_prasert',
      code: 'TCH102',
      name: 'อ.ประเสริฐ ชำนาญคิด',
      email: 'prasert@mystudentroom.edu',
      role: 'TEACHER',
      phone: '086-333-4455',
      advisorRoom: 'ม.4/2',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  // 3. Students
  const student1 = await prisma.user.create({
    data: {
      id: 'student_chaiwat',
      code: 'STU40101',
      name: 'นาย ชัยวัฒน์ ภักดี',
      email: 'chaiwat.p@mystudentroom.edu',
      role: 'STUDENT',
      studentRoom: 'ม.4/1',
      phone: '091-888-0001',
      streakDays: 18,
      points: 240,
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    },
  });

  const student2 = await prisma.user.create({
    data: {
      id: 'student_kanda',
      code: 'STU40102',
      name: 'น.ส. กานดา วงศ์สว่าง',
      email: 'kanda.w@mystudentroom.edu',
      role: 'STUDENT',
      studentRoom: 'ม.4/1',
      phone: '091-888-0002',
      streakDays: 14,
      points: 190,
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    },
  });

  const student3 = await prisma.user.create({
    data: {
      id: 'student_phumiphat',
      code: 'STU40103',
      name: 'นาย ภูมิพัฒน์ เจริญสุข',
      email: 'phumiphat.c@mystudentroom.edu',
      role: 'STUDENT',
      studentRoom: 'ม.4/1',
      phone: '091-888-0003',
      streakDays: 2,
      points: 70,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  });

  const student4 = await prisma.user.create({
    data: {
      id: 'student_nalinrat',
      code: 'STU40104',
      name: 'น.ส. นลินรัตน์ ศรีสุข',
      email: 'nalinrat.s@mystudentroom.edu',
      role: 'STUDENT',
      studentRoom: 'ม.4/1',
      phone: '091-888-0004',
      streakDays: 9,
      points: 130,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
  });

  const student5 = await prisma.user.create({
    data: {
      id: 'student_thanakorn',
      code: 'STU40105',
      name: 'นาย ธนกร มั่นคง',
      email: 'thanakorn.m@mystudentroom.edu',
      role: 'STUDENT',
      studentRoom: 'ม.4/1',
      phone: '091-888-0005',
      streakDays: 6,
      points: 95,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
  });

  // 4. Parents
  const parent1 = await prisma.user.create({
    data: {
      id: 'parent_somjai',
      code: 'PAR001',
      name: 'คุณแม่ สมใจ ภักดี',
      email: 'somjai.parent@gmail.com',
      role: 'PARENT',
      phone: '081-999-1122',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    },
  });

  const parent2 = await prisma.user.create({
    data: {
      id: 'parent_wiroj',
      code: 'PAR002',
      name: 'คุณพ่อ วิโรจน์ เจริญสุข',
      email: 'wiroj.parent@gmail.com',
      role: 'PARENT',
      phone: '081-999-3344',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    },
  });

  // Link Parents to Students
  await prisma.parentStudentLink.createMany({
    data: [
      { parentId: parent1.id, studentId: student1.id, relationship: 'MOTHER' },
      { parentId: parent2.id, studentId: student3.id, relationship: 'FATHER' },
    ],
  });

  console.log('📚 Creating Courses and Sessions...');

  const mathCourse = await prisma.course.create({
    data: {
      id: 'course_math101',
      code: 'MATH101',
      name: 'คณิตศาสตร์เพิ่มเติม (ม.4/1)',
      room: 'อาคาร 3 ห้อง 302',
      targetRoom: 'ม.4/1',
      latitude: 13.7563,
      longitude: 100.5018,
      radiusM: 60,
      teacherId: teacherSomsri.id,
    },
  });

  const sciCourse = await prisma.course.create({
    data: {
      id: 'course_sci102',
      code: 'SCI102',
      name: 'วิทยาศาสตร์กายภาพ (ม.4/1)',
      room: 'อาคาร 4 ห้อง LAB-1',
      targetRoom: 'ม.4/1',
      latitude: 13.7565,
      longitude: 100.5020,
      radiusM: 60,
      teacherId: teacherPrasert.id,
    },
  });

  // Create Today's Sessions
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const mathSession = await prisma.classSession.create({
    data: {
      id: 'session_math_today',
      courseId: mathCourse.id,
      sessionDate: today,
      periodNumber: 1,
      startTime: '08:30',
      endTime: '09:20',
      status: 'ACTIVE',
      qrToken: 'MSR-7F8A-9C21',
      pinCode: '4829',
    },
  });

  const sciSession = await prisma.classSession.create({
    data: {
      id: 'session_sci_today',
      courseId: sciCourse.id,
      sessionDate: today,
      periodNumber: 2,
      startTime: '09:30',
      endTime: '10:20',
      status: 'SCHEDULED',
      pinCode: '5912',
    },
  });

  console.log('📝 Creating Homework Assignments for Homework Radar...');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  await prisma.homeworkAssignment.createMany({
    data: [
      {
        courseId: sciCourse.id,
        targetRoom: 'ม.4/1',
        title: 'สรุปผลการทดลองเคมีเรื่องพันธะเคมี 1 หน้า',
        description: 'ทำลงในสมุดแบบฝึกหัดวิทยาศาสตร์',
        dueDate: tomorrow,
        dueLabel: 'ส่งพรุ่งนี้ก่อน 08:30 น.',
        estimatedMin: 25,
        teacherId: teacherPrasert.id,
        createdAt: new Date(Date.now() - 30 * 60000), // 30 mins ago
      },
    ],
  });

  console.log('🚪 Creating Gate Records (Morning Arrival)...');
  const morningTime = new Date();
  morningTime.setHours(7, 42, 0, 0);

  await prisma.gateRecord.createMany({
    data: [
      { studentId: student1.id, gateType: 'IN', gateName: 'ประตู 1 (หน้าโรงเรียน)', timestamp: morningTime },
      { studentId: student2.id, gateType: 'IN', gateName: 'ประตู 1 (หน้าโรงเรียน)', timestamp: new Date(morningTime.getTime() + 5 * 60000) },
      { studentId: student4.id, gateType: 'IN', gateName: 'ประตู 2 (ฝั่งลานจอดรถ)', timestamp: new Date(morningTime.getTime() + 12 * 60000) },
      { studentId: student5.id, gateType: 'IN', gateName: 'ประตู 1 (หน้าโรงเรียน)', timestamp: new Date(morningTime.getTime() + 15 * 60000) },
    ],
  });

  console.log('📝 Creating Attendance Records for Math session...');
  const checkinTime1 = new Date();
  checkinTime1.setHours(8, 31, 0, 0);

  await prisma.attendanceRecord.createMany({
    data: [
      {
        sessionId: mathSession.id,
        studentId: student1.id,
        status: 'PRESENT',
        checkinTime: checkinTime1,
        method: 'QR',
        latitude: 13.75631,
        longitude: 100.50182,
      },
      {
        sessionId: mathSession.id,
        studentId: student2.id,
        status: 'PRESENT',
        checkinTime: new Date(checkinTime1.getTime() + 2 * 60000),
        method: 'QR',
        latitude: 13.75629,
        longitude: 100.50179,
      },
      {
        sessionId: mathSession.id,
        studentId: student4.id,
        status: 'LATE',
        checkinTime: new Date(checkinTime1.getTime() + 18 * 60000),
        method: 'PIN',
        latitude: 13.75635,
        longitude: 100.50185,
        note: 'ติดกิจกรรมชุมนุมมาสาย',
      },
    ],
  });

  console.log('💌 Creating Leave Request & SafeMessages...');
  await prisma.leaveRequest.create({
    data: {
      id: 'leave_nalinrat_1',
      studentId: student4.id,
      leaveType: 'SICK',
      startDate: tomorrow,
      endDate: tomorrow,
      reason: 'มีไข้สูงและปวดศีรษะ พบแพทย์ที่ รพ.จุฬาฯ',
      attachmentUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500&auto=format&fit=crop&q=80',
      parentApproved: true,
      parentNote: 'คุณแม่ยืนยัน น้องมีไข้ 38.5 องศาค่ะ',
      parentApprovedAt: new Date(),
      teacherStatus: 'APPROVED',
      teacherNote: 'อนุมัติการลา พักผ่อนให้หายไวๆ นะคะ',
    },
  });

  await prisma.leaveRequest.create({
    data: {
      id: 'leave_phumiphat_1',
      studentId: student3.id,
      leaveType: 'BUSINESS',
      startDate: tomorrow,
      endDate: tomorrow,
      reason: 'ต้องไปร่วมงานทำบุญครบรอบของครอบครัวที่ต่างจังหวัด',
      parentApproved: false,
      teacherStatus: 'PENDING',
    },
  });

  // SafeSpace Messages
  await prisma.safeMessage.create({
    data: {
      id: 'msg_thanakorn_1',
      studentId: student5.id,
      advisorId: teacherSomsri.id,
      category: 'STRESS',
      content: 'อาจารย์ครับ ช่วงนี้ผมรู้สึกเครียดเรื่องสอบเก็บคะแนนมาก นอนไม่ค่อยหลับ อยากขอคำแนะนำวิธีแบ่งเวลาอ่านหนังสือหน่อยครับ',
      requestMeet: true,
      reply: 'ยินดีเลยจ้ะธนกร พักเที่ยงนี้ 12:30 น. แวะมาคุยที่ห้องพักครู 305 ได้เลยนะ ครูเตรียมคำแนะนำไว้ให้แล้ว ไม่ต้องกังวลนะ',
      repliedAt: new Date(),
      isRead: true,
    },
  });

  // Mood Logs
  await prisma.moodLog.createMany({
    data: [
      { studentId: student1.id, mood: 'HAPPY', note: 'พร้อมเรียนมาก เช้านี้อากาศดี' },
      { studentId: student2.id, mood: 'HAPPY', note: 'ทำการบ้านคณิตเสร็จแล้ว' },
      { studentId: student3.id, mood: 'TIRED', note: 'นอนดึก ตื่นเช้าไม่ทัน' },
      { studentId: student5.id, mood: 'STRESSED', note: 'กังวลเรื่องสอบ' },
    ],
  });

  // Announcements
  await prisma.announcement.createMany({
    data: [
      {
        title: '📢 ประกาศด่วน: ขอให้นักเรียน ม.4/1 สวมชุดพละในวันพรุ่งนี้',
        content: 'เนื่องจากมีกิจกรรมทดสอบสมรรถภาพทางกายในคาบเรียนที่ 4 จึงขอให้นักเรียนทุกคนสวมชุดพละและรองเท้าผ้าใบให้เรียบร้อยค่ะ',
        priority: 'URGENT',
        targetRoom: 'ม.4/1',
        senderName: 'อ.สมศรี รักษ์เรียน (ครูประจำชั้น ม.4/1)',
        readCount: 28,
      },
    ],
  });

  console.log('✅ Database re-seeded successfully with Homework Radar data!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
