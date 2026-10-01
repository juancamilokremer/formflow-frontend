import { isAtUserLimit } from './user-management.model';
import { Plan, TenantUsage } from '../../../core/models/tenant.model';

const BASE_USAGE: TenantUsage = {
  plan: Plan.FREE, formsUsed: 0, formsLimit: 2, responsesThisMonth: 0, responsesLimit: 50,
  usersCount: 1, usersLimit: 1, canExportExcel: false,
};

describe('isAtUserLimit', () => {
  it('is false when usage has not loaded yet', () => {
    expect(isAtUserLimit(null)).toBe(false);
  });

  it('is true when usersCount reaches usersLimit', () => {
    expect(isAtUserLimit({ ...BASE_USAGE, usersCount: 1, usersLimit: 1 })).toBe(true);
  });

  it('is true when usersCount exceeds usersLimit (e.g. a platform account pushed it over)', () => {
    expect(isAtUserLimit({ ...BASE_USAGE, usersCount: 2, usersLimit: 1 })).toBe(true);
  });

  it('is false when there is room left', () => {
    expect(isAtUserLimit({ ...BASE_USAGE, usersCount: 0, usersLimit: 1 })).toBe(false);
  });

  it('is false when the plan has no cap (usersLimit null)', () => {
    expect(isAtUserLimit({ ...BASE_USAGE, usersCount: 99, usersLimit: null })).toBe(false);
  });
});
