import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateLeaveSchema } from "@/lib/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const advisorRoom = searchParams.get("advisorRoom");

    const where: any = {};
    if (studentId) {
      where.studentId = studentId;
    } else if (advisorRoom) {
      where.student = { studentRoom: advisorRoom };
    }

    const leaves = await prisma.leaveRequest.findMany({
      where,
      include: {
        student: {
          include: {
            parentOf: {
              include: { parent: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: leaves });
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leave requests" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = CreateLeaveSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid leave payload" },
        { status: 400 }
      );
    }

    const { studentId, leaveType, startDate, endDate, reason, attachmentUrl, isParentDirect } = parsed.data;

    const leave = await prisma.leaveRequest.create({
      data: {
        studentId,
        leaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        attachmentUrl: attachmentUrl || "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500&auto=format&fit=crop&q=80",
        parentApproved: isParentDirect ? true : false,
        parentApprovedAt: isParentDirect ? new Date() : null,
        parentNote: isParentDirect ? "ผู้ปกครองยื่นคำร้องด้วยตนเองผ่าน LINE Portal" : null,
        teacherStatus: "PENDING",
      },
      include: {
        student: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: isParentDirect ? "ส่งใบลาถึงคุณครูเรียบร้อยแล้ว" : "ส่งคำขอลาเรียบร้อย (รอผู้ปกครองกดยืนยัน)",
      data: leave,
    });
  } catch (error: any) {
    console.error("Error creating leave request:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit leave request" },
      { status: 500 }
    );
  }
}

// Action updates: Parent confirmation or Teacher approval
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { leaveId, action, note } = body;

    if (!leaveId || !action) {
      return NextResponse.json({ success: false, error: "Missing leaveId or action" }, { status: 400 });
    }

    let updateData: any = {};

    if (action === "PARENT_CONFIRM") {
      updateData = {
        parentApproved: true,
        parentApprovedAt: new Date(),
        parentNote: note || "ผู้ปกครองกดยืนยันรับทราบการลาแล้ว",
      };
    } else if (action === "TEACHER_APPROVE") {
      updateData = {
        teacherStatus: "APPROVED",
        teacherNote: note || "อนุมัติการลา",
      };
    } else if (action === "TEACHER_REJECT") {
      updateData = {
        teacherStatus: "REJECTED",
        teacherNote: note || "ไม่อนุมัติการลา กรุณาติดต่อครูประจำชั้น",
      };
    }

    const updated = await prisma.leaveRequest.update({
      where: { id: leaveId },
      data: updateData,
      include: { student: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating leave:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update leave request" },
      { status: 500 }
    );
  }
}
