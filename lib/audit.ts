import { prisma } from "./prisma";

export interface LogAuditOptions {
  userId?: string | null;
  userName?: string | null;
  action: "create" | "update" | "delete" | "status_change" | "export" | "login" | "verify" | "restore";
  entity: string;
  entityId?: string | null;
  details?: string;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress?: string;
}

export async function logAudit({
  userId,
  userName,
  action,
  entity,
  entityId,
  details,
  oldValue,
  newValue,
  ipAddress,
}: LogAuditOptions) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        userName: userName || "System",
        action,
        entity,
        entityId: entityId || null,
        details: details || null,
        oldValue: oldValue ? JSON.stringify(oldValue) : null,
        newValue: newValue ? JSON.stringify(newValue) : null,
        ipAddress: ipAddress || null,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
}
