import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CheckinSchema } from "@/lib/types";
import { verifyDynamicToken } from "@/lib/qr-crypto";
import { isWithinClassroomRadius } from "@/lib/geo";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");
    const studentId = searchParams.get("studentId");

    const where: any = {};
    if (sessionId) where.sessionId = sessionId;
    if (studentId) where.studentId = studentId;

    const records = await prisma.attendanceRecord.findMany({
      where,
      include: {
        student: true,
        session: {
          include: {
            course: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: records });
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch attendance records" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = CheckinSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid payload" },
        { status: 400 }
      );
    }

    const { sessionId, studentId, token, pinCode, method, latitude, longitude, note } = parsed.data;

    // 1. Fetch Session and Course
    const session = await prisma.classSession.findUnique({
      where: { id: sessionId },
      include: { course: true },
    });

    if (!session) {
      return NextResponse.json({ success: false, error: "ไม่พบคลาสเรียนนี้ในระบบ" }, { status: 404 });
    }

    if (session.status === "CLOSED") {
      return NextResponse.json({ success: false, error: "คลาสเรียนนี้ปิดการเช็คชื่อแล้ว" }, { status: 400 });
    }

    // 2. Validate QR Token or PIN Code
    if (method === "QR") {
      if (!token) {
        return NextResponse.json({ success: false, error: "ไม่พบรหัส QR Token" }, { status: 400 });
      }
      const isValid = verifyDynamicToken(sessionId, token);
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: "QR Code หมดอายุแล้ว กรุณาสแกนรหัสใหม่จากหน้าจออาจารย์" },
          { status: 400 }
        );
      }
    } else if (method === "PIN") {
      if (!pinCode || pinCode !== session.pinCode) {
        return NextResponse.json({ success: false, error: "รหัส PIN ไม่ถูกต้อง" }, { status: 400 });
      }
    }

    // 3. Validate GPS Geofencing if coordinates provided
    if (latitude && longitude && session.course.latitude && session.course.longitude) {
      const geoCheck = isWithinClassroomRadius(
        latitude,
        longitude,
        session.course.latitude,
        session.course.longitude,
        session.course.radiusM,
        25 // 25m grace buffer
      );

      if (!geoCheck.isInside) {
        return NextResponse.json(
          {
            success: false,
            error: `คุณอยู่นอกพื้นที่ห้องเรียน (${geoCheck.distanceMeters} เมตร จากอาคารเรียน อนุญาตไม่เกิน ${geoCheck.maxAllowedMeters} เมตร)`,
          },
          { status: 400 }
        );
      }
    }

    // 4. Calculate Attendance Status based on time
    // If check-in is after start time + 15 mins -> LATE
    const now = new Date();
    let status = "PRESENT";

    // Parse start time (e.g. "08:30")
    const [startH, startM] = session.startTime.split(":").map(Number);
    const sessionStart = new Date(session.sessionDate);
    sessionStart.setHours(startH || 8, startM || 30, 0, 0);

    const diffMinutes = Math.floor((now.getTime() - sessionStart.getTime()) / 60000);
    if (diffMinutes > 15 && diffMinutes <= 45) {
      status = "LATE";
    } else if (diffMinutes > 45) {
      status = "ABSENT";
    }

    // 5. Upsert Attendance Record inside transaction and increment student streak
    const record = await prisma.$transaction(async (tx) => {
      const existing = await tx.attendanceRecord.findUnique({
        where: {
          sessionId_studentId: { sessionId, studentId },
        },
      });

      const updated = await tx.attendanceRecord.upsert({
        where: {
          sessionId_studentId: { sessionId, studentId },
        },
        create: {
          sessionId,
          studentId,
          status,
          method,
          latitude,
          longitude,
          note,
          checkinTime: now,
        },
        update: {
          status,
          method,
          latitude,
          longitude,
          note,
          checkinTime: now,
        },
        include: {
          student: true,
          session: {
            include: { course: true },
          },
        },
      });

      // Update student points and streak if not already checked in
      if (!existing && status === "PRESENT") {
        await tx.user.update({
          where: { id: studentId },
          data: {
            streakDays: { increment: 1 },
            points: { increment: 10 },
          },
        });
      }

      return updated;
    });

    return NextResponse.json({
      success: true,
      message: `เช็คชื่อสำเร็จ (${status === "PRESENT" ? "มาตรงเวลา" : status === "LATE" ? "มาสาย" : "บันทึกข้อมูลเรียบร้อย"})`,
      data: record,
    });
  } catch (error: any) {
    console.error("Check-in error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process check-in" },
      { status: 500 }
    );
  }
}

// Teacher Fast Roll-call update (Present, Late, Leave, Absent)
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, studentId, status, note } = body;

    if (!sessionId || !studentId || !status) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const record = await prisma.attendanceRecord.upsert({
      where: {
        sessionId_studentId: { sessionId, studentId },
      },
      create: {
        sessionId,
        studentId,
        status,
        method: "MANUAL",
        note,
        checkinTime: new Date(),
      },
      update: {
        status,
        method: "MANUAL",
        note,
        checkinTime: new Date(),
      },
      include: {
        student: true,
      },
    });

    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error("Error updating roll-call status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update attendance status" },
      { status: 500 }
    );
  }
}
