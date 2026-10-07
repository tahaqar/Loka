import { getCurrentUser, getUserWithPermissions } from "./auth";

const ACTION_ALIASES: Record<string, string[]> = {
  read: ["view", "read"],
  view: ["view", "read"],
  create: ["create", "add"],
  add: ["create", "add"],
  edit: ["edit", "update"],
  update: ["edit", "update"],
  delete: ["delete", "remove"],
  remove: ["delete", "remove"],
  export: ["export"],
};

export async function hasPermission(action: string, module: string): Promise<boolean> {
  const session = await getCurrentUser();
  if (!session) return false;

  // Admin has blanket access to all actions and modules
  if (session.roleName === "admin") return true;

  const user = await getUserWithPermissions(session.userId);
  if (!user || !user.isActive) return false;

  const candidateActions = ACTION_ALIASES[action.toLowerCase()] || [action.toLowerCase()];

  return user.role.permissions.some((rp) => {
    const pName = rp.permission.name.toLowerCase();
    if (pName === `${module}:*` || pName === "*") return true;
    return candidateActions.some((act) => pName === `${module}:${act}`);
  });
}

export async function requirePermission(action: string, module: string) {
  const allowed = await hasPermission(action, module);
  if (!allowed) {
    throw new Error(`Unauthorized: Missing permission ${module}:${action}`);
  }
}

export async function getBranchScope(userSession: { roleName: string; branchId?: string | null }) {
  // Admin and Headquarter can see all branches if no branch filter is applied
  if (userSession.roleName === "admin") {
    return null; // No restriction by default, can query any branch
  }
  return userSession.branchId || null;
}
