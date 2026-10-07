import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET() {
  try {
    const [students, applications, universities, tasks, payments] = await Promise.all([
      prisma.student.findMany({
        where: { deletedAt: { not: null } },
        select: { id: true, studentCode: true, fullNameAr: true, deletedAt: true },
      }),
      prisma.application.findMany({
        where: { deletedAt: { not: null } },
        select: { id: true, applicationCode: true, deletedAt: true },
      }),
      prisma.university.findMany({
        where: { deletedAt: { not: null } },
        select: { id: true, nameAr: true, nameEn: true, deletedAt: true },
      }),
      prisma.task.findMany({
        where: { deletedAt: { not: null } },
        select: { id: true, title: true, deletedAt: true },
      }),
      prisma.payment.findMany({
        where: { deletedAt: { not: null } },
        select: { id: true, receiptNumber: true, amount: true, deletedAt: true },
      }),
    ]);

    const items = [
      ...students.map((s) => ({ id: s.id, entity: "Student", label: `${s.fullNameAr} (${s.studentCode})`, deletedAt: s.deletedAt })),
      ...applications.map((a) => ({ id: a.id, entity: "Application", label: `طلب تقديم (${a.applicationCode})`, deletedAt: a.deletedAt })),
      ...universities.map((u) => ({ id: u.id, entity: "University", label: u.nameAr, deletedAt: u.deletedAt })),
      ...tasks.map((t) => ({ id: t.id, entity: "Task", label: t.title, deletedAt: t.deletedAt })),
      ...payments.map((p) => ({ id: p.id, entity: "Payment", label: `سند قبض (${p.receiptNumber}) - $${p.amount}`, deletedAt: p.deletedAt })),
    ];

    items.sort((a, b) => new Date(b.deletedAt!).getTime() - new Date(a.deletedAt!).getTime());

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Get trash error:", error);
    return NextResponse.json({ error: "Failed to load trash" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Restore an entity
  try {
    const session = await getCurrentUser();
    const body = await req.json();
    const { id, entity } = body;

    if (!id || !entity) {
      return NextResponse.json({ error: "Id and entity are required" }, { status: 400 });
    }

    const modelName = entity.charAt(0).toLowerCase() + entity.slice(1);
    const client = (prisma as any)[modelName];

    if (!client) {
      return NextResponse.json({ error: "Invalid entity" }, { status: 400 });
    }

    const restored = await client.update({
      where: { id },
      data: { deletedAt: null },
    });

    await logAudit({
      userId: session?.userId,
      userName: session?.name,
      action: "restore",
      entity,
      entityId: id,
    });

    return NextResponse.json({ success: true, restored });
  } catch (error) {
    console.error("Restore error:", error);
    return NextResponse.json({ error: "Failed to restore item" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  // Permanent purge
  try {
    const session = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const entity = searchParams.get("entity");

    if (!id || !entity) {
      return NextResponse.json({ error: "Id and entity are required" }, { status: 400 });
    }

    const modelName = entity.charAt(0).toLowerCase() + entity.slice(1);
    const client = (prisma as any)[modelName];

    if (!client) {
      return NextResponse.json({ error: "Invalid entity" }, { status: 400 });
    }

    await client.delete({ where: { id } });

    await logAudit({
      userId: session?.userId,
      userName: session?.name,
      action: "delete",
      entity,
      entityId: id,
      details: "Permanent delete",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Permanent delete error:", error);
    return NextResponse.json({ error: "Failed to permanently delete item" }, { status: 500 });
  }
}
