import { describe, expect, it } from 'vitest';
import { landingFor } from './landing';
import { navFor } from './navigation';

describe('role navigation', () => {
  it('shows customer areas only to customers', () => {
    expect(navFor(['Customer']).map(({ path }) => path)).toEqual([
      '/vehicles',
      '/reservations',
      '/rentals',
      '/payments',
    ]);
  });

  it('combines access for users with multiple roles', () => {
    const paths = navFor(['Employee', 'BranchManager']).map(({ path }) => path);
    expect(paths).toContain('/staff/contracts');
    expect(paths).toContain('/admin/fleet');
  });

  it('uses a role appropriate landing route and defaults safely', () => {
    expect(landingFor(['Admin'])).toBe('/admin/fleet');
    expect(landingFor(['Customer'])).toBe('/vehicles');
    expect(landingFor([])).toBe('/login');
  });
});
