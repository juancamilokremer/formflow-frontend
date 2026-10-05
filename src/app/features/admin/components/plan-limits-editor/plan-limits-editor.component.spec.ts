import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideTranslateService } from '@ngx-translate/core';
import { PlanLimitsEditorComponent } from './plan-limits-editor.component';
import { AdminService } from '../../services/admin.service';
import { PlanLimits } from '../../../../core/models/plan-limits.model';
import { Plan } from '../../../../core/models/tenant.model';

const freeLimits: PlanLimits = {
  plan: Plan.FREE, formsLimit: 2, responsesLimit: 50, usersLimit: 1, convocatoriasLimit: 0, canExportExcel: false,
};
const proLimits: PlanLimits = {
  plan: Plan.PRO, formsLimit: null, responsesLimit: null, usersLimit: null, convocatoriasLimit: null, canExportExcel: true,
};

describe('PlanLimitsEditorComponent', () => {
  let component: PlanLimitsEditorComponent;
  let fixture: ComponentFixture<PlanLimitsEditorComponent>;
  let mockService: { getPlanLimits: ReturnType<typeof vi.fn>; updatePlanLimits: ReturnType<typeof vi.fn> };

  function setup(limits: PlanLimits[] = [freeLimits, proLimits]) {
    mockService = {
      getPlanLimits: vi.fn().mockReturnValue(of(limits)),
      updatePlanLimits: vi.fn().mockReturnValue(of(freeLimits)),
    };
    TestBed.configureTestingModule({
      imports: [PlanLimitsEditorComponent],
      providers: [
        provideTranslateService({ lang: 'es' }),
        { provide: AdminService, useValue: mockService },
      ],
    });
    fixture = TestBed.createComponent(PlanLimitsEditorComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  }

  it('converts each plan\'s limits into editable rows, unlimited when null', () => {
    setup();
    const rows = component['rows']();
    const free = rows.find((r) => r.plan === Plan.FREE)!;
    const pro = rows.find((r) => r.plan === Plan.PRO)!;

    expect(free.forms).toEqual({ value: 2, unlimited: false });
    expect(free.convocatorias).toEqual({ value: 0, unlimited: false });
    expect(pro.forms).toEqual({ value: 0, unlimited: true });
    expect(component['loading']()).toBe(false);
  });

  it('shows a load error when the fetch fails', () => {
    mockService = { getPlanLimits: vi.fn().mockReturnValue(throwError(() => new Error('boom'))), updatePlanLimits: vi.fn() };
    TestBed.configureTestingModule({
      imports: [PlanLimitsEditorComponent],
      providers: [provideTranslateService({ lang: 'es' }), { provide: AdminService, useValue: mockService }],
    });
    fixture = TestBed.createComponent(PlanLimitsEditorComponent);
    component = fixture.componentInstance;
    component.ngOnInit();

    expect(component['loadError']()).toBe(true);
    expect(component['loading']()).toBe(false);
  });

  it('toggles the unlimited flag only for the targeted plan and field', () => {
    setup();
    component['onUnlimitedChange'](Plan.FREE, 'forms', true);

    const rows = component['rows']();
    expect(rows.find((r) => r.plan === Plan.FREE)!.forms.unlimited).toBe(true);
    expect(rows.find((r) => r.plan === Plan.FREE)!.responses.unlimited).toBe(false);
    expect(rows.find((r) => r.plan === Plan.PRO)!.forms.unlimited).toBe(true); // was already unlimited
  });

  it('updates the numeric value, clamping negative input to 0', () => {
    setup();
    component['onValueChange'](Plan.FREE, 'forms', '15');
    expect(component['rows']().find((r) => r.plan === Plan.FREE)!.forms.value).toBe(15);

    component['onValueChange'](Plan.FREE, 'forms', '-5');
    expect(component['rows']().find((r) => r.plan === Plan.FREE)!.forms.value).toBe(0);
  });

  it('toggles canExportExcel', () => {
    setup();
    component['onExportChange'](Plan.FREE, true);
    expect(component['rows']().find((r) => r.plan === Plan.FREE)!.canExportExcel).toBe(true);
  });

  it('save() sends null for unlimited fields and the number otherwise', () => {
    setup();
    component['onUnlimitedChange'](Plan.FREE, 'responses', true);

    component['save'](Plan.FREE);

    expect(mockService.updatePlanLimits).toHaveBeenCalledWith(Plan.FREE, {
      formsLimit: 2, responsesLimit: null, usersLimit: 1, convocatoriasLimit: 0, canExportExcel: false,
    });
  });

  it('save() replaces the row with the server response and marks it saved', () => {
    setup();
    mockService.updatePlanLimits.mockReturnValue(of({ ...freeLimits, formsLimit: 20 }));

    component['save'](Plan.FREE);

    const row = component['rows']().find((r) => r.plan === Plan.FREE)!;
    expect(row.forms.value).toBe(20);
    expect(row.saved).toBe(true);
    expect(row.saving).toBe(false);
  });

  it('save() shows the backend error message on failure', () => {
    setup();
    mockService.updatePlanLimits.mockReturnValue(
      throwError(() => ({ error: { message: 'Límite inválido' } })),
    );

    component['save'](Plan.FREE);

    const row = component['rows']().find((r) => r.plan === Plan.FREE)!;
    expect(row.error).toBe('Límite inválido');
    expect(row.saving).toBe(false);
  });
});
