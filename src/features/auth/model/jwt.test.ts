import { describe, expect, it } from 'vitest';
import { decodeJwtClaims, userFromAccessToken } from './jwt';

function jwt(payload: Record<string, unknown>): string {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  const encoded = btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return 'eyJhbGciOiJub25lIn0.' + encoded + '.unsigned';
}

describe('JWT display claim decoder', () => {
  it('reads a single role claim and identity fields', () => {
    const user = userFromAccessToken(
      jwt({ sub: '42', unique_name: 'customer-42', role: 'Customer', exp: 1900000000 }),
    );
    expect(user).toEqual({ id: '42', username: 'customer-42', roles: ['Customer'] });
  });

  it('reads repeated roles serialized as an array and ignores unknown roles', () => {
    const claims = decodeJwtClaims(
      jwt({
        sub: '7',
        unique_name: 'operator',
        role: ['Admin', 'Employee', 'Root'],
      }),
    );
    expect(claims?.roles).toEqual(['Admin', 'Employee']);
  });

  it('fails safely for malformed tokens and missing identity claims', () => {
    expect(decodeJwtClaims('not-a-jwt')).toBeNull();
    expect(decodeJwtClaims(jwt({ unique_name: 'missing-sub' }))).toBeNull();
    expect(decodeJwtClaims(jwt({ sub: '1', unique_name: '   ' }))).toBeNull();
  });
});
