import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearTokens, getAccessToken, getRefreshToken, storeTokens } from './tokenStore';

describe('tokenStore', () => {
  beforeEach(() => {
    clearTokens();
    sessionStorage.clear();
  });

  afterEach(() => {
    clearTokens();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('keeps access tokens in memory and refresh tokens for the current tab session', () => {
    storeTokens('access-secret', 'refresh-secret');
    expect(getAccessToken()).toBe('access-secret');
    expect(getRefreshToken()).toBe('refresh-secret');
    expect(sessionStorage.getItem('car-rental.refresh-token')).toBe('refresh-secret');
    expect(sessionStorage.getItem('car-rental.access-token')).toBeNull();
  });

  it('clears both token stores on logout', () => {
    storeTokens('access-secret', 'refresh-secret');
    clearTokens();
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });
});
