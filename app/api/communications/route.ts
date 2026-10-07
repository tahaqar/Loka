import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const templates = await prisma.messageTemplate.findMany({
      where: { deletedAt: null },
      orderBy: { nameAr: "asc" },
    });

    const communications = await prisma.communication.findMany({
      where: { deletedAt: null },
      include: {
        student: { select: { id: true, studentCode: true, fullNameAr: true } },
        user: { select: { name: true } },
      },
      orderBy: { sentAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ templates, communications });
  } catch (error) {
    console.error("Get communications error:", error);
    return NextResponse.json({ error: "Failed to load communications" }, { status: 500 });
  }
}
