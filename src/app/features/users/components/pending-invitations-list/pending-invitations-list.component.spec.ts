import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideTranslateService } from '@ngx-translate/core';
import { PendingInvitationsListComponent, relativeTimeParts } from './pending-invitations-list.component';
import { UsersService } from '../../services/users.service';
import { UserRole } from '../../../../core/models/user.model';
import { PendingInvitation } from '../../models/user-management.model';

describe('relativeTimeParts', () => {
  const now = new Date('2026-01-10T12:00:00Z').getTime();

  it('returns "now" for less than a minute', () => {
    expect(relativeTimeParts(new Date(now - 30_000).toISOString(), now)).toEqual({ unit: 'now', count: 0 });
  });

  it('returns singular minute', () => {
    expect(relativeTimeParts(new Date(now - 60_000).toISOString(), now)).toEqual({ unit: 'minute', count: 1 });
  });

  it('returns plural minutes', () => {
    expect(relativeTimeParts(new Date(now - 5 * 60_000).toISOString(), now)).toEqual({ unit: 'minutes', count: 5 });
  });

  it('returns singular hour', () => {
    expect(relativeTimeParts(new Date(now - 60 * 60_000).toISOString(), now)).toEqual({ unit: 'hour', count: 1 });
  });

  it('returns plural hours', () => {
    expect(relativeTimeParts(new Date(now - 3 * 60 * 60_000).toISOString(), now)).toEqual({ unit: 'hours', count: 3 });
  });

  it('returns singular day', () => {
    expect(relativeTimeParts(new Date(now - 24 * 60 * 60_000).toISOString(), now)).toEqual({ unit: 'day', count: 1 });
  });

  it('returns plural days', () => {
    expect(relativeTimeParts(new Date(now - 3 * 24 * 60 * 60_000).toISOString(), now)).toEqual({ unit: 'days', count: 3 });
  });
});

const INVITATION: PendingInvitation = {
  id: 'i1', email: 'nuevo@empresa.com', role: UserRole.EDITOR,
  expiresAt: new Date(Date.now() + 2 * 60 * 60_000).toISOString(),
  createdAt: new Date(Date.now() - 60 * 60_000).toISOString(),
};

describe('PendingInvitationsListComponent', () => {
  let component: PendingInvitationsListComponent;
  let fixture: ComponentFixture<PendingInvitationsListComponent>;
  let mockService: { inviteUser: ReturnType<typeof vi.fn>; cancelInvitation: ReturnType<typeof vi.fn> };

  function setup(invitations: PendingInvitation[] = [INVITATION]) {
    mockService = {
      inviteUser: vi.fn().mockReturnValue(of({ ...INVITATION, id: 'i2' })),
      cancelInvitation: vi.fn().mockReturnValue(of(undefined)),
    };
    TestBed.configureTestingModule({
      imports: [PendingInvitationsListComponent],
      providers: [
        provideTranslateService({ lang: 'es' }),
        { provide: UsersService, useValue: mockService },
      ],
    });
    fixture = TestBed.createComponent(PendingInvitationsListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('invitations', invitations);
    fixture.detectChanges();
  }

  it('flags an invitation expiring within 12h', () => {
    setup([{ ...INVITATION, expiresAt: new Date(Date.now() + 2 * 60 * 60_000).toISOString() }]);
    expect(component['isExpiringSoon'](component.invitations()[0])).toBe(true);
    expect(component['isExpired'](component.invitations()[0])).toBe(false);
  });

  it('flags an expired invitation', () => {
    setup([{ ...INVITATION, expiresAt: new Date(Date.now() - 1000).toISOString() }]);
    expect(component['isExpired'](component.invitations()[0])).toBe(true);
    expect(component['isExpiringSoon'](component.invitations()[0])).toBe(false);
  });

  it('does not flag an invitation with plenty of time left', () => {
    setup([{ ...INVITATION, expiresAt: new Date(Date.now() + 40 * 60 * 60_000).toISOString() }]);
    expect(component['isExpired'](component.invitations()[0])).toBe(false);
    expect(component['isExpiringSoon'](component.invitations()[0])).toBe(false);
  });

  it('resends and emits the renewed invitation', () => {
    setup();
    let emitted: PendingInvitation | undefined;
    component.resent.subscribe((i) => (emitted = i));

    component['resend'](INVITATION);

    expect(mockService.inviteUser).toHaveBeenCalledWith({ email: INVITATION.email, role: INVITATION.role });
    expect(emitted?.id).toBe('i2');
    expect(component['resendingId']()).toBeNull();
  });

  it('cancels and emits the cancelled id', () => {
    setup();
    let emitted: string | undefined;
    component.cancelled.subscribe((id) => (emitted = id));

    component['confirmCancel']('i1');
    component['cancelInvitation']();

    expect(mockService.cancelInvitation).toHaveBeenCalledWith('i1');
    expect(emitted).toBe('i1');
    expect(component['pendingCancelId']()).toBeNull();
  });

  it('shows the backend error message when cancel fails', () => {
    mockService = {
      inviteUser: vi.fn(),
      cancelInvitation: vi.fn().mockReturnValue(throwError(() => ({ error: { message: 'No se pudo cancelar' } }))),
    };
    TestBed.configureTestingModule({
      imports: [PendingInvitationsListComponent],
      providers: [provideTranslateService({ lang: 'es' }), { provide: UsersService, useValue: mockService }],
    });
    fixture = TestBed.createComponent(PendingInvitationsListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('invitations', [INVITATION]);
    fixture.detectChanges();

    component['confirmCancel']('i1');
    component['cancelInvitation']();

    expect(component['actionError']()).toBe('No se pudo cancelar');
  });
});
