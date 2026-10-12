import type { AuthUser, Role } from './session';

export interface JwtClaims {
  sub: string;
  uniqueName: string;
  roles: Role[];
  expiresAtUtc?: Date;
}

const VALID_ROLES = new Set<Role>(['Admin', 'BranchManager', 'Employee', 'Customer']);

function decodeBase64Url(value: string): string {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const bytes = Uint8Array.from(atob(base64 + padding), (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function parseRoles(value: unknown): Role[] {
  const values = typeof value === 'string' ? [value] : Array.isArray(value) ? value : [];
  return [...new Set(values.filter((role): role is Role => VALID_ROLES.has(role as Role)))];
}

export function decodeJwtClaims(token: string): JwtClaims | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[1]) return null;

    const payload: unknown = JSON.parse(decodeBase64Url(parts[1]));
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;

    const record = payload as Record<string, unknown>;
    if (typeof record.sub !== 'string' || !record.sub) return null;
    if (typeof record.unique_name !== 'string' || !record.unique_name.trim()) return null;

    const expiresAtUtc =
      typeof record.exp === 'number' && Number.isFinite(record.exp)
        ? new Date(record.exp * 1000)
        : undefined;

    return {
      sub: record.sub,
      uniqueName: record.unique_name.trim(),
      roles: parseRoles(record.role),
      expiresAtUtc,
    };
  } catch {
    return null;
  }
}

export function userFromAccessToken(token: string): AuthUser | null {
  const claims = decodeJwtClaims(token);
  if (!claims) return null;
  return { id: claims.sub, username: claims.uniqueName, roles: claims.roles };
}
