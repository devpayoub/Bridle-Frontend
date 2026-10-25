import type { Role } from "@/lib/api/types";

/**
 * Role → capability map.
 *
 * Mirrors `ROLE_CAPABILITIES` in `backend/apps/organizations/context.py`. This is
 * a *presentation* aid only: the API enforces every capability server-side, so a
 * drift bug can hide a button but never grant access.
 */
export const CAPABILITIES = [
  "organization:read",
  "organization:write",
  "organization:delete",
  "member:read",
  "member:write",
  "assistant:read",
  "assistant:write",
  "policy:read",
  "policy:write",
  "policy:evaluate",
  "knowledge:read",
  "knowledge:write",
  "apikey:read",
  "apikey:write",
  "conversation:read",
  "conversation:delete",
  "chat:write",
  "usage:read",
  "audit:read",
  "billing:read",
] as const;

export type Capability = (typeof CAPABILITIES)[number];

const READ_ONLY: Capability[] = [
  "organization:read",
  "assistant:read",
  "policy:read",
  "knowledge:read",
  "conversation:read",
  "apikey:read",
];

const MEMBER: Capability[] = [...READ_ONLY, "usage:read", "billing:read", "chat:write"];

const DEVELOPER: Capability[] = [
  ...MEMBER,
  "assistant:write",
  "policy:write",
  "policy:evaluate",
  "knowledge:write",
  "apikey:write",
  "conversation:delete",
];

const ADMIN: Capability[] = [...DEVELOPER, "organization:write", "member:read", "member:write", "audit:read"];

const OWNER: Capability[] = [...ADMIN, "organization:delete"];

export const ROLE_CAPABILITIES: Record<Role, Capability[]> = {
  READ_ONLY,
  MEMBER,
  DEVELOPER,
  ADMIN,
  OWNER,
};

export function capabilitiesForRole(role: Role | null | undefined): Capability[] {
  if (!role) return [];
  return ROLE_CAPABILITIES[role] ?? [];
}

export function roleCan(role: Role | null | undefined, capability: Capability): boolean {
  return capabilitiesForRole(role).includes(capability);
}

export const ROLE_LABELS: Record<Role, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  DEVELOPER: "Developer",
  MEMBER: "Member",
  READ_ONLY: "Read only",
};

/** Roles that can be assigned to a member (ownership is transferred separately). */
export const ASSIGNABLE_ROLES: Role[] = ["ADMIN", "DEVELOPER", "MEMBER", "READ_ONLY"];
