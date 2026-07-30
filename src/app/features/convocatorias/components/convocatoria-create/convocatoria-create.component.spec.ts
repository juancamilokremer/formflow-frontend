import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ConvocatoriaCreateComponent } from './convocatoria-create.component';
import { ConvocatoriaService } from '../../services/convocatoria.service';
import { ConvocatoriaDetail } from '../../models/convocatoria.model';

const MOCK_CONVOCATORIA: ConvocatoriaDetail = {
  id: 'c1', tenantId: 't1', name: 'RRHH', type: 'CANDIDATES', status: 'DRAFT',
  scoringConfig: { aptoMin: 70, revisarMin: 50 },
  startDate: null, endDate: null, createdAt: '', updatedAt: '', candidates: [], forms: [],
};

function buildComponent(createImpl?: ReturnType<typeof vi.fn>) {
  const mockConvocatoriaService = { create: createImpl ?? vi.fn().mockReturnValue(of(MOCK_CONVOCATORIA)) };
  const mockRouter = { navigate: vi.fn() };

  TestBed.configureTestingModule({
    imports: [ConvocatoriaCreateComponent],
    providers: [
      provideTranslateService({ lang: 'es' }),
      { provide: ConvocatoriaService, useValue: mockConvocatoriaService },
      { provide: Router, useValue: mockRouter },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(ConvocatoriaCreateComponent);
  fixture.detectChanges();
  return { component: fixture.componentInstance, mockConvocatoriaService, mockRouter };
}

describe('ConvocatoriaCreateComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('isValid requires a non-empty name', () => {
    const { component } = buildComponent();
    expect(component['isValid']()).toBe(false);
    component['onBasicInfoChanged']({ name: 'RRHH', processType: 'CANDIDATES' });
    expect(component['isValid']()).toBe(true);
  });

  it('does nothing when invalid', () => {
    const { component, mockConvocatoriaService } = buildComponent();
    component['submit']();
    expect(mockConvocatoriaService.create).not.toHaveBeenCalled();
  });

  it('creates the convocatoria and navigates to its detail route', () => {
    const { component, mockConvocatoriaService, mockRouter } = buildComponent();
    component['onBasicInfoChanged']({ name: '  RRHH  ', processType: 'DIAGNOSTIC' });

    component['submit']();

    expect(mockConvocatoriaService.create).toHaveBeenCalledWith({ name: 'RRHH', type: 'DIAGNOSTIC' });
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/', 'convocatorias', 'c1']);
  });

  it('sets createError when the create call fails', () => {
    const { component } = buildComponent(vi.fn().mockReturnValue(throwError(() => new Error('boom'))));
    component['onBasicInfoChanged']({ name: 'RRHH', processType: 'CANDIDATES' });

    component['submit']();

    expect(component['createError']()).toBe(true);
    expect(component['creating']()).toBe(false);
  });
});
