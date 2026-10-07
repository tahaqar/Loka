import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { AUTH_COOKIE_NAME } from "./constants";

export { AUTH_COOKIE_NAME };

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "amalon_super_secret_crm_jwt_key_2026_xyz"
);

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  roleName: string;
  roleDisplayName: string;
  branchId?: string | null;
  branchCode?: string | null;
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (token) {
      const verified = await verifySessionToken(token);
      if (verified) return verified;
    }

    // Default to system admin for immediate open access
    const admin = await prisma.user.findFirst({
      where: { role: { name: "admin" }, isActive: true, deletedAt: null },
      include: { role: true, branch: true },
    });

    if (admin) {
      return {
        userId: admin.id,
        email: admin.email,
        name: admin.name,
        roleName: admin.role.name,
        roleDisplayName: admin.role.displayName,
        branchId: admin.branchId,
        branchCode: admin.branch?.code,
      };
    }

    return null;
  } catch {
    return null;
  }
}

export async function getUserWithPermissions(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId, isActive: true, deletedAt: null },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
      branch: true,
    },
  });
}
