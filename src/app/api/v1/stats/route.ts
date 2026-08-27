import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode"); // "overview" | "student" | "parent-feed"
    const studentId = searchParams.get("studentId");
    const parentId = searchParams.get("parentId");

    if (mode === "student" && studentId) {
      // 1. Calculate 80% Rule & Course Attendance stats for student
      const student = await prisma.user.findUnique({
        where: { id: studentId },
        include: {
          attendances: {
            include: {
              session: {
                include: { course: true },
              },
            },
          },
          gateRecords: {
            orderBy: { timestamp: "desc" },
            take: 5,
          },
          leaveRequests: true,
          moodLogs: {
            orderBy: { date: "desc" },
            take: 1,
          },
        },
      });

      if (!student) {
        return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
      }

      // Fetch all courses for this student's room
      const courses = await prisma.course.findMany({
        where: student.studentRoom ? { targetRoom: student.studentRoom } : {},
        include: {
          teacher: true,
          sessions: {
            include: {
              attendances: {
                where: { studentId },
              },
            },
          },
        },
      });

      // Calculate stats per course (Assuming total 20 periods per semester)
      const totalSemesterPeriods = 20;
      const courseStats = courses.map((course) => {
        let presentCount = 0;
        let lateCount = 0;
        let leaveCount = 0;
        let absentCount = 0;

        course.sessions.forEach((sess) => {
          const att = sess.attendances[0];
          if (att) {
            if (att.status === "PRESENT") presentCount++;
            else if (att.status === "LATE") lateCount++;
            else if (att.status === "LEAVE") leaveCount++;
            else if (att.status === "ABSENT") absentCount++;
          }
        });

        // 3 Late = 1 Absent rule or standard percentage
        const effectiveAttended = presentCount + (lateCount * 0.75) + leaveCount;
        const totalPast = course.sessions.length || 1;
        const currentPercentage = Math.round((effectiveAttended / totalPast) * 100);
        
        // Allowed max absence = 20% of 20 = 4 times
        const maxAllowedAbsence = Math.floor(totalSemesterPeriods * 0.2);
        const remainingAbsenceQuota = Math.max(0, maxAllowedAbsence - absentCount);
        const isAtRisk = remainingAbsenceQuota <= 1 || currentPercentage < 80;

        return {
          courseId: course.id,
          code: course.code,
          name: course.name,
          teacherName: course.teacher.name,
          room: course.room,
          presentCount,
          lateCount,
          leaveCount,
          absentCount,
          currentPercentage,
          remainingAbsenceQuota,
          isAtRisk,
          totalPast,
        };
      });

      // Fetch Today's Prep Checklist
      const prepItems = await prisma.classPrep.findMany({
        where: student.studentRoom ? { targetRoom: student.studentRoom } : {},
      });

      return NextResponse.json({
        success: true,
        data: {
          student,
          courseStats,
          prepItems,
        },
      });
    }

    if (mode === "parent-feed" && parentId) {
      // Find parent's children
      const links = await prisma.parentStudentLink.findMany({
        where: { parentId },
        include: {
          student: {
            include: {
              gateRecords: {
                orderBy: { timestamp: "desc" },
                take: 2,
              },
              attendances: {
                include: {
                  session: {
                    include: { course: { include: { teacher: true } } },
                  },
                },
                orderBy: { createdAt: "desc" },
                take: 10,
              },
              leaveRequests: {
                orderBy: { createdAt: "desc" },
                take: 5,
              },
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          children: links.map((l) => l.student),
        },
      });
    }

    // Default: School-wide Overview Stats for Admin Dashboard
    const totalStudents = await prisma.user.count({ where: { role: "STUDENT" } });
    const totalTeachers = await prisma.user.count({ where: { role: "TEACHER" } });
    const totalCourses = await prisma.course.count();
    const activeSessions = await prisma.classSession.count({ where: { status: "ACTIVE" } });
    const pendingLeaves = await prisma.leaveRequest.count({ where: { teacherStatus: "PENDING" } });

    // Recent attendances across the school
    const recentAttendances = await prisma.attendanceRecord.findMany({
      include: {
        student: true,
        session: {
          include: { course: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 15,
    });

    const studentList = await prisma.user.findMany({
      where: { role: "STUDENT" },
      include: {
        attendances: true,
        leaveRequests: true,
        moodLogs: {
          orderBy: { date: "desc" },
          take: 1,
        },
      },
      orderBy: { code: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalStudents,
          totalTeachers,
          totalCourses,
          activeSessions,
          pendingLeaves,
          overallAttendanceRate: 94, // Percentage
        },
        recentAttendances,
        studentList,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
