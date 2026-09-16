import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { EncuestaCreateComponent } from './encuesta-create.component';
import { ConvocatoriaService } from '../../../convocatorias/services/convocatoria.service';
import { ConvocatoriaDetail } from '../../../convocatorias/models/convocatoria.model';

const MOCK_ENCUESTA: ConvocatoriaDetail = {
  id: 'e1', tenantId: 't1', name: 'Clima laboral', type: 'REGISTRATION', status: 'DRAFT',
  scoringConfig: { aptoMin: 70, revisarMin: 50 },
  startDate: null, endDate: null, createdAt: '', updatedAt: '', candidates: [], forms: [],
};

function buildComponent(
  createImpl?: ReturnType<typeof vi.fn>,
  queryParams: Record<string, string> = {},
) {
  const mockConvocatoriaService = { create: createImpl ?? vi.fn().mockReturnValue(of(MOCK_ENCUESTA)) };
  const mockRouter = { navigate: vi.fn() };

  TestBed.configureTestingModule({
    imports: [EncuestaCreateComponent],
    providers: [
      provideTranslateService({ lang: 'es' }),
      { provide: ConvocatoriaService, useValue: mockConvocatoriaService },
      { provide: Router, useValue: mockRouter },
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            queryParamMap: { get: (key: string) => queryParams[key] ?? null },
          },
        },
      },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(EncuestaCreateComponent);
  fixture.detectChanges();
  return { component: fixture.componentInstance, mockConvocatoriaService, mockRouter };
}

describe('EncuestaCreateComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('isValid requires a non-empty name', () => {
    const { component } = buildComponent();
    expect(component['isValid']()).toBe(false);
    component['onNameChanged']('Clima laboral');
    expect(component['isValid']()).toBe(true);
  });

  it('does nothing when invalid', () => {
    const { component, mockConvocatoriaService } = buildComponent();
    component['submit']();
    expect(mockConvocatoriaService.create).not.toHaveBeenCalled();
  });

  it('creates the encuesta with a fixed REGISTRATION type and navigates to its detail route', () => {
    const { component, mockConvocatoriaService, mockRouter } = buildComponent();
    component['onNameChanged']('  Clima laboral  ');

    component['submit']();

    expect(mockConvocatoriaService.create).toHaveBeenCalledWith({ name: 'Clima laboral', type: 'REGISTRATION' });
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/', 'encuestas', 'e1']);
  });

  it('sets createError when the create call fails', () => {
    const { component } = buildComponent(vi.fn().mockReturnValue(throwError(() => new Error('boom'))));
    component['onNameChanged']('Clima laboral');

    component['submit']();

    expect(component['createError']()).toBe(true);
    expect(component['creating']()).toBe(false);
  });

  it('prefills name from the ?name query param (arriving from CreateFormDialogComponent)', () => {
    const { component } = buildComponent(undefined, { name: 'Clima 2026' });
    expect(component['name']()).toBe('Clima 2026');
  });

  it('defaults to an empty name without query params', () => {
    const { component } = buildComponent();
    expect(component['name']()).toBe('');
  });
});
