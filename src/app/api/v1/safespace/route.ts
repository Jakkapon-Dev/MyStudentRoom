import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateSafeMessageSchema, MoodCheckinSchema } from "@/lib/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const advisorId = searchParams.get("advisorId");
    const type = searchParams.get("type"); // "messages" | "moods"

    if (type === "moods") {
      const moods = await prisma.moodLog.findMany({
        where: studentId ? { studentId } : {},
        include: { student: true },
        orderBy: { date: "desc" },
        take: 30,
      });
      return NextResponse.json({ success: true, data: moods });
    }

    // Default fetch SafeMessages
    const where: any = {};
    if (studentId) where.studentId = studentId;
    if (advisorId) where.advisorId = advisorId;

    const messages = await prisma.safeMessage.findMany({
      where,
      include: {
        student: true,
        advisor: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    console.error("Error fetching safespace data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch safespace data" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "MOOD") {
      const parsed = MoodCheckinSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ success: false, error: "Invalid mood payload" }, { status: 400 });
      }
      const mood = await prisma.moodLog.create({
        data: {
          studentId: parsed.data.studentId,
          mood: parsed.data.mood,
          note: parsed.data.note,
        },
      });
      return NextResponse.json({ success: true, data: mood, message: "บันทึกอารมณ์เรียบร้อยแล้ว" });
    }

    // Otherwise create SafeMessage
    const parsed = CreateSafeMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid message payload" },
        { status: 400 }
      );
    }

    const message = await prisma.safeMessage.create({
      data: {
        studentId: parsed.data.studentId,
        advisorId: parsed.data.advisorId,
        category: parsed.data.category,
        content: parsed.data.content,
        requestMeet: parsed.data.requestMeet,
      },
      include: {
        student: true,
        advisor: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "ส่งข้อความถึงอาจารย์ที่ปรึกษาเรียบร้อยแล้ว (ข้อมูลถูกเก็บเป็นความลับ 100%)",
      data: message,
    });
  } catch (error: any) {
    console.error("Error creating safe message:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send message" },
      { status: 500 }
    );
  }
}

// Advisor reply
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { messageId, reply } = body;

    if (!messageId || !reply) {
      return NextResponse.json({ success: false, error: "Missing messageId or reply" }, { status: 400 });
    }

    const updated = await prisma.safeMessage.update({
      where: { id: messageId },
      data: {
        reply,
        repliedAt: new Date(),
        isRead: true,
      },
      include: { student: true },
    });

    return NextResponse.json({ success: true, data: updated, message: "ส่งข้อความตอบกลับนักเรียนเรียบร้อยแล้ว" });
  } catch (error) {
    console.error("Error replying to safe message:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reply to safe message" },
      { status: 500 }
    );
  }
}
