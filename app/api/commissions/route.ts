import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const commissions = await prisma.universityCommission.findMany({
      where: { deletedAt: null },
      include: {
        university: { select: { id: true, nameAr: true, nameEn: true } },
        application: {
          select: {
            id: true,
            applicationCode: true,
            student: { select: { id: true, fullNameAr: true, studentCode: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const unreceivedTotal = commissions
      .filter((c) => c.status !== "received")
      .reduce((acc, c) => acc + (c.commissionAmount - c.amountReceived), 0);

    return NextResponse.json({ commissions, unreceivedTotal });
  } catch (error) {
    console.error("Get commissions error:", error);
    return NextResponse.json({ error: "Failed to load commissions" }, { status: 500 });
  }
}
