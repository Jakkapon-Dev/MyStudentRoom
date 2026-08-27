import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const targetRoom = searchParams.get("targetRoom") || "ม.4/1";
    const teacherId = searchParams.get("teacherId");

    // Fetch assignments for this room created today or active
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const roomAssignments = await prisma.homeworkAssignment.findMany({
      where: {
        targetRoom,
        createdAt: {
          gte: today,
        },
      },
      include: {
        course: true,
        teacher: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch teacher's own history if teacherId provided
    let myHistory: any[] = [];
    if (teacherId) {
      myHistory = await prisma.homeworkAssignment.findMany({
        where: { teacherId },
        include: { course: true },
        orderBy: { createdAt: "desc" },
        take: 15,
      });
    }

    const count = roomAssignments.length;
    let loadLevel: "LIGHT" | "MODERATE" | "OVERLOAD" = "LIGHT";
    let loadMessage = "วันนี้ยังไม่มีการบ้าน หรือมีน้อย — สามารถสั่งงานได้ตามปกติ";
    let loadColor = "emerald";

    if (count === 2) {
      loadLevel = "MODERATE";
      loadMessage = `วันนี้ห้อง ${targetRoom} มีการบ้านแล้ว 2 วิชา — แนะนำให้สั่งงานขนาดเล็ก หรือให้เวลาทำในคาบ`;
      loadColor = "amber";
    } else if (count >= 3) {
      loadLevel = "OVERLOAD";
      loadMessage = `⚠️ แจ้งเตือน: วันนี้มีภาระการบ้านแล้ว ${count} วิชา — ควรหลีกเลี่ยงการสั่งงานหนักเพิ่ม หรือขยายเวลาส่ง`;
      loadColor = "rose";
    }

    return NextResponse.json({
      success: true,
      data: {
        todayAssignments: roomAssignments,
        homeworkCount: count,
        loadLevel,
        loadMessage,
        loadColor,
        myHistory,
      },
    });
  } catch (error) {
    console.error("Error fetching homework radar:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch homework data" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      courseId,
      targetRoom = "ม.4/1",
      title,
      description,
      dueDate,
      dueLabel,
      estimatedMin,
      teacherId,
    } = body;

    if (!courseId || !teacherId) {
      return NextResponse.json(
        { success: false, error: "Missing courseId or teacherId" },
        { status: 400 }
      );
    }

    // Flexible title fallback (if teacher just wants to log quickly)
    const finalTitle = title?.trim() || "มีการบ้านประจำคาบเรียน";

    const assignment = await prisma.homeworkAssignment.create({
      data: {
        courseId,
        targetRoom,
        title: finalTitle,
        description: description?.trim() || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        dueLabel: dueLabel || "ส่งในคาบถัดไป",
        estimatedMin: estimatedMin ? Number(estimatedMin) : null,
        teacherId,
      },
      include: {
        course: true,
        teacher: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "บันทึกการบ้านลงในเรดาร์ห้องเรียนเรียบร้อยแล้ว",
      data: assignment,
    });
  } catch (error: any) {
    console.error("Error creating homework:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create homework" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
    }

    await prisma.homeworkAssignment.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "ลบรายการการบ้านเรียบร้อยแล้ว" });
  } catch (error) {
    console.error("Error deleting homework:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete homework" },
      { status: 500 }
    );
  }
}
