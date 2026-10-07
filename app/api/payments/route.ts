import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      where: { deletedAt: null },
      include: {
        student: { select: { id: true, studentCode: true, fullNameAr: true } },
        receiver: { select: { name: true } },
      },
      orderBy: { paymentDate: "desc" },
    });

    const contracts = await prisma.contract.findMany({
      where: { deletedAt: null },
      include: {
        student: { select: { id: true, studentCode: true, fullNameAr: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalCollected = payments.reduce((acc, p) => acc + (p.baseAmount || 0), 0);
    const totalRemaining = contracts.reduce((acc, c) => acc + (c.remainingAmount || 0), 0);

    return NextResponse.json({ payments, contracts, totalCollected, totalRemaining });
  } catch (error) {
    console.error("Get payments error:", error);
    return NextResponse.json({ error: "Failed to load payments" }, { status: 500 });
  }
}
