import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateDynamicToken } from "@/lib/qr-crypto";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId");
    const targetRoom = searchParams.get("targetRoom");

    const where: any = {};
    if (teacherId) {
      where.course = { teacherId };
    } else if (targetRoom) {
      where.course = { targetRoom };
    }

    const sessions = await prisma.classSession.findMany({
      where,
      include: {
        course: {
          include: {
            teacher: true,
          },
        },
        attendances: {
          include: {
            student: true,
          },
        },
      },
      orderBy: { periodNumber: "asc" },
    });

    // Refresh dynamic tokens for active sessions
    const enriched = sessions.map((session) => {
      if (session.status === "ACTIVE") {
        const { token, expiresAt, timeRemainingSec } = generateDynamicToken(session.id);
        return {
          ...session,
          currentDynamicToken: token,
          tokenExpiresAt: expiresAt,
          timeRemainingSec,
        };
      }
      return session;
    });

    return NextResponse.json({ success: true, data: enriched });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch class sessions" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, action, pinCode } = body;

    if (!sessionId || !action) {
      return NextResponse.json({ success: false, error: "Missing sessionId or action" }, { status: 400 });
    }

    let updatedSession;
    if (action === "START") {
      const { token, expiresAt } = generateDynamicToken(sessionId);
      updatedSession = await prisma.classSession.update({
        where: { id: sessionId },
        data: {
          status: "ACTIVE",
          qrToken: token,
          qrExpiresAt: new Date(expiresAt),
          pinCode: pinCode || Math.floor(1000 + Math.random() * 9000).toString(),
        },
        include: { course: true },
      });
    } else if (action === "CLOSE") {
      updatedSession = await prisma.classSession.update({
        where: { id: sessionId },
        data: {
          status: "CLOSED",
        },
        include: { course: true },
      });
    } else if (action === "ROTATE_TOKEN") {
      const { token, expiresAt, timeRemainingSec } = generateDynamicToken(sessionId);
      return NextResponse.json({
        success: true,
        data: { token, expiresAt, timeRemainingSec },
      });
    }

    return NextResponse.json({ success: true, data: updatedSession });
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update session" },
      { status: 500 }
    );
  }
}
