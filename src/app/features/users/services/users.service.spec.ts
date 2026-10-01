import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { UsersService } from './users.service';
import { UserRole } from '../../../core/models/user.model';
import { TenantUsage, Plan } from '../../../core/models/tenant.model';
import { PendingInvitation, TeamMember } from '../models/user-management.model';

const mockMember: TeamMember = {
  id: 'u1', email: 'ada@empresa.com', firstName: 'Ada', lastName: 'QA',
  role: UserRole.EDITOR, active: true, emailVerified: true, createdAt: '2026-01-01T00:00:00Z',
};

const mockInvitation: PendingInvitation = {
  id: 'i1', email: 'nuevo@empresa.com', role: UserRole.VIEWER,
  expiresAt: '2026-01-03T00:00:00Z', createdAt: '2026-01-01T00:00:00Z',
};

const mockUsage: TenantUsage = {
  plan: Plan.FREE, formsUsed: 1, formsLimit: 2, responsesThisMonth: 10, responsesLimit: 50,
  usersCount: 1, usersLimit: 1, canExportExcel: false,
};

describe('UsersService', () => {
  let service: UsersService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UsersService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('listUsers() GETs /users and returns the data', () => {
    let result: TeamMember[] | undefined;
    service.listUsers().subscribe((r) => (result = r));

    http.expectOne((r) => r.url.endsWith('/users') && r.method === 'GET')
      .flush({ success: true, data: [mockMember] });

    expect(result).toEqual([mockMember]);
  });

  it('inviteUser() POSTs to /users/invite and returns the created invitation', () => {
    const request = { email: 'nuevo@empresa.com', role: UserRole.VIEWER };
    let result: PendingInvitation | undefined;
    service.inviteUser(request).subscribe((r) => (result = r));

    const req = http.expectOne((r) => r.url.endsWith('/users/invite') && r.method === 'POST');
    expect(req.request.body).toEqual(request);
    req.flush({ success: true, data: mockInvitation });

    expect(result).toEqual(mockInvitation);
  });

  it('listInvitations() GETs /users/invitations and returns the data', () => {
    let result: PendingInvitation[] | undefined;
    service.listInvitations().subscribe((r) => (result = r));

    http.expectOne((r) => r.url.endsWith('/users/invitations') && r.method === 'GET')
      .flush({ success: true, data: [mockInvitation] });

    expect(result).toEqual([mockInvitation]);
  });

  it('cancelInvitation() DELETEs /users/invitations/{id}', () => {
    service.cancelInvitation('i1').subscribe();

    http.expectOne((r) => r.url.endsWith('/users/invitations/i1') && r.method === 'DELETE')
      .flush({ success: true, data: null });
  });

  it('changeRole() PUTs the role to /users/{id}/role', () => {
    service.changeRole('u1', UserRole.VIEWER).subscribe();

    const req = http.expectOne((r) => r.url.endsWith('/users/u1/role') && r.method === 'PUT');
    expect(req.request.body).toEqual({ role: UserRole.VIEWER });
    req.flush({ success: true, data: { ...mockMember, role: UserRole.VIEWER } });
  });

  it('revokeAccess() DELETEs /users/{id}', () => {
    service.revokeAccess('u1').subscribe();

    http.expectOne((r) => r.url.endsWith('/users/u1') && r.method === 'DELETE')
      .flush({ success: true, data: null });
  });

  it('getUsage() GETs /tenant/usage and returns the data', () => {
    let result: TenantUsage | undefined;
    service.getUsage().subscribe((u) => (result = u));

    http.expectOne((r) => r.url.endsWith('/tenant/usage') && r.method === 'GET')
      .flush({ success: true, data: mockUsage });

    expect(result).toEqual(mockUsage);
  });
});
