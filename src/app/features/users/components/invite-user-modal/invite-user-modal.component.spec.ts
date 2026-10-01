import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideTranslateService } from '@ngx-translate/core';
import { InviteUserModalComponent } from './invite-user-modal.component';
import { UsersService } from '../../services/users.service';
import { UserRole } from '../../../../core/models/user.model';
import { Plan, TenantUsage } from '../../../../core/models/tenant.model';
import { PendingInvitation } from '../../models/user-management.model';

const mockInvitation: PendingInvitation = {
  id: 'i1', email: 'nuevo@empresa.com', role: UserRole.EDITOR,
  expiresAt: '2026-01-03T00:00:00Z', createdAt: '2026-01-01T00:00:00Z',
};

const usageAtLimit: TenantUsage = {
  plan: Plan.FREE, formsUsed: 1, formsLimit: 2, responsesThisMonth: 1, responsesLimit: 50,
  usersCount: 1, usersLimit: 1, canExportExcel: false,
};

const usageWithRoom: TenantUsage = { ...usageAtLimit, usersCount: 0, usersLimit: 3 };

describe('InviteUserModalComponent', () => {
  let component: InviteUserModalComponent;
  let fixture: ComponentFixture<InviteUserModalComponent>;
  let mockService: { inviteUser: ReturnType<typeof vi.fn> };

  function setup(usage: TenantUsage | null = usageWithRoom) {
    mockService = { inviteUser: vi.fn().mockReturnValue(of(mockInvitation)) };

    TestBed.configureTestingModule({
      imports: [InviteUserModalComponent],
      providers: [
        provideTranslateService({ lang: 'es' }),
        { provide: UsersService, useValue: mockService },
      ],
    });

    fixture = TestBed.createComponent(InviteUserModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('usage', usage);
    fixture.detectChanges();
  }

  it('resets the form fields when it opens', () => {
    setup();
    expect(component['email']()).toBe('');
    expect(component['role']()).toBe(UserRole.EDITOR);
  });

  it('validates email format', () => {
    setup();
    component['email'].set('not-an-email');
    expect(component['emailValid']()).toBe(false);
    component['email'].set('nuevo@empresa.com');
    expect(component['emailValid']()).toBe(true);
  });

  it('is at limit when usersCount reaches usersLimit', () => {
    setup(usageAtLimit);
    expect(component['atLimit']()).toBe(true);
    expect(component['canSubmit']()).toBe(false);
  });

  it('is not at limit when usersLimit is null (unlimited)', () => {
    setup({ ...usageAtLimit, usersLimit: null });
    expect(component['atLimit']()).toBe(false);
  });

  it('invites the user and emits the created invitation', () => {
    setup();
    component['email'].set('nuevo@empresa.com');
    let emitted: PendingInvitation | undefined;
    component.invited.subscribe((i) => (emitted = i));

    component['submit']();

    expect(mockService.inviteUser).toHaveBeenCalledWith({ email: 'nuevo@empresa.com', role: UserRole.EDITOR });
    expect(emitted).toEqual(mockInvitation);
    expect(component['saved']()).toBe(true);
  });

  it('does not submit when the form is invalid', () => {
    setup();
    component['email'].set('not-an-email');
    component['submit']();
    expect(mockService.inviteUser).not.toHaveBeenCalled();
  });

  it('shows the backend error message when inviting fails', () => {
    mockService = {
      inviteUser: vi.fn().mockReturnValue(throwError(() => ({ error: { message: 'Ya existe una cuenta con ese correo' } }))),
    };
    TestBed.configureTestingModule({
      imports: [InviteUserModalComponent],
      providers: [provideTranslateService({ lang: 'es' }), { provide: UsersService, useValue: mockService }],
    });
    fixture = TestBed.createComponent(InviteUserModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('usage', usageWithRoom);
    fixture.detectChanges();

    component['email'].set('nuevo@empresa.com');
    component['submit']();

    expect(component['errorMessage']()).toBe('Ya existe una cuenta con ese correo');
    expect(component['saving']()).toBe(false);
  });

  it('does not cancel while saving', () => {
    setup();
    component['saving'].set(true);
    let cancelled = false;
    component.cancelled.subscribe(() => (cancelled = true));
    component['cancel']();
    expect(cancelled).toBe(false);
  });
});
