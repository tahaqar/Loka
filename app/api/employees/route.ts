import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      include: {
        role: true,
        branch: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const branches = await prisma.branch.findMany({
      where: { deletedAt: null },
      include: {
        _count: { select: { users: true, students: true } },
      },
      orderBy: { isHeadquarter: "desc" },
    });

    return NextResponse.json({ users, branches });
  } catch (error) {
    console.error("Get employees error:", error);
    return NextResponse.json({ error: "Failed to load employees" }, { status: 500 });
  }
}
