import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateAnnouncementSchema } from "@/lib/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const targetRoom = searchParams.get("targetRoom");

    const where: any = {};
    if (targetRoom) {
      where.OR = [{ targetRoom: "ALL" }, { targetRoom }];
    }

    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: announcements });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = CreateAnnouncementSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid announcement payload" },
        { status: 400 }
      );
    }

    const announcement = await prisma.announcement.create({
      data: parsed.data,
    });

    return NextResponse.json({
      success: true,
      message: "บรอดแคสต์ประกาศด่วนถึงนักเรียนและผู้ปกครองเรียบร้อยแล้ว",
      data: announcement,
    });
  } catch (error: any) {
    console.error("Error creating announcement:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create announcement" },
      { status: 500 }
    );
  }
}

// Increment read count
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { announcementId } = body;

    if (!announcementId) {
      return NextResponse.json({ success: false, error: "Missing announcementId" }, { status: 400 });
    }

    const updated = await prisma.announcement.update({
      where: { id: announcementId },
      data: { readCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating read count:", error);
    return NextResponse.json({ success: false, error: "Failed to update read count" }, { status: 500 });
  }
}
