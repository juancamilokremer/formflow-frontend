import { TestBed, ComponentFixture } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { provideTranslateService } from '@ngx-translate/core';
import { UpgradeRequestModalComponent } from './upgrade-request-modal.component';
import { PlanUpgradeService } from '../../services/plan-upgrade.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { Plan } from '../../../../core/models/tenant.model';
import { User, UserRole } from '../../../../core/models/user.model';

const mockUser: User = {
  id: '1', tenantId: 't1', tenantName: 'Acme', tenantPlan: 'STARTER',
  email: 'juan@acme.com', firstName: 'Juan', lastName: 'Kremer',
  role: UserRole.TENANT_ADMIN, emailVerified: true,
};

describe('UpgradeRequestModalComponent', () => {
  let component: UpgradeRequestModalComponent;
  let fixture: ComponentFixture<UpgradeRequestModalComponent>;
  let mockService: { requestUpgrade: ReturnType<typeof vi.fn> };

  function setup(targetPlan: Plan | null = Plan.PRO) {
    mockService = { requestUpgrade: vi.fn().mockReturnValue(of(undefined)) };

    TestBed.configureTestingModule({
      imports: [UpgradeRequestModalComponent],
      providers: [
        provideTranslateService({ lang: 'es' }),
        { provide: PlanUpgradeService, useValue: mockService },
        { provide: AuthService, useValue: { currentUser: signal(mockUser) } },
      ],
    });

    fixture = TestBed.createComponent(UpgradeRequestModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('targetPlan', targetPlan);
    fixture.detectChanges();
  }

  it('prefills requester name and email from the current user when it opens', () => {
    setup();
    expect(component['requesterName']()).toBe('Juan Kremer');
    expect(component['requesterEmail']()).toBe('juan@acme.com');
  });

  it('resets the message and status fields when it opens', () => {
    setup();
    expect(component['message']()).toBe('');
    expect(component['sentState']()).toBe(false);
    expect(component['errorMessage']()).toBeNull();
  });

  it('cannot submit without a target plan', () => {
    setup(null);
    expect(component['canSubmit']()).toBe(false);
  });

  it('requests the upgrade and emits sent', () => {
    setup(Plan.PRO);
    component['message'].set('Necesitamos reportes avanzados');
    let sentEmitted = false;
    component.sent.subscribe(() => (sentEmitted = true));

    component['submit']();

    expect(mockService.requestUpgrade).toHaveBeenCalledWith({
      requestedPlan: Plan.PRO,
      message: 'Necesitamos reportes avanzados',
    });
    expect(sentEmitted).toBe(true);
    expect(component['sentState']()).toBe(true);
  });

  it('sends an undefined message when left blank', () => {
    setup(Plan.PRO);
    component['submit']();
    expect(mockService.requestUpgrade).toHaveBeenCalledWith({
      requestedPlan: Plan.PRO,
      message: undefined,
    });
  });

  it('shows the backend error message when the request fails', () => {
    mockService = {
      requestUpgrade: vi.fn().mockReturnValue(
        throwError(() => ({ error: { message: 'No se pudo enviar la solicitud' } })),
      ),
    };
    TestBed.configureTestingModule({
      imports: [UpgradeRequestModalComponent],
      providers: [
        provideTranslateService({ lang: 'es' }),
        { provide: PlanUpgradeService, useValue: mockService },
        { provide: AuthService, useValue: { currentUser: signal(mockUser) } },
      ],
    });
    fixture = TestBed.createComponent(UpgradeRequestModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('targetPlan', Plan.PRO);
    fixture.detectChanges();

    component['submit']();

    expect(component['errorMessage']()).toBe('No se pudo enviar la solicitud');
    expect(component['sending']()).toBe(false);
  });

  it('does not cancel while sending', () => {
    setup();
    component['sending'].set(true);
    let cancelled = false;
    component.cancelled.subscribe(() => (cancelled = true));
    component['cancel']();
    expect(cancelled).toBe(false);
  });
});
