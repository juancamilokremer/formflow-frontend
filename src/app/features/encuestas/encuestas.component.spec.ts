import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { provideTranslateService } from '@ngx-translate/core';
import { EncuestasComponent } from './encuestas.component';
import { ConvocatoriaService } from '../convocatorias/services/convocatoria.service';
import { ConvocatoriaSummary } from '../convocatorias/models/convocatoria.model';

const convocatoriaItem: ConvocatoriaSummary =
  { id: '1', name: 'Proceso A', type: 'CANDIDATES', status: 'ACTIVE', candidateCount: 10, respondedCount: 7, startDate: null, endDate: null, createdAt: '2026-06-01T00:00:00Z' };

const mockList: ConvocatoriaSummary[] = [
  { id: '4', name: 'Encuesta X', type: 'REGISTRATION', status: 'ACTIVE', candidateCount: 2, respondedCount: 1, startDate: null, endDate: null, createdAt: '2026-06-20T00:00:00Z' },
  { id: '5', name: 'Encuesta Y', type: 'REGISTRATION', status: 'DRAFT',  candidateCount: 0, respondedCount: 0, startDate: null, endDate: null, createdAt: '2026-06-21T00:00:00Z' },
];

function buildSvc(getAll: Observable<unknown> = of(mockList)) {
  return { getAll: vi.fn().mockReturnValue(getAll), close: vi.fn(), delete: vi.fn() };
}

async function create(svc = buildSvc()) {
  const mockRouter = { navigate: vi.fn() };
  await TestBed.configureTestingModule({
    imports: [EncuestasComponent],
    providers: [
      provideTranslateService({ lang: 'es' }),
      { provide: ConvocatoriaService, useValue: svc },
      { provide: Router, useValue: mockRouter },
    ],
  }).compileComponents();

  const component = TestBed.createComponent(EncuestasComponent).componentInstance;
  return { component, svc, mockRouter };
}

describe('EncuestasComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('sets view to ready and loads list on success', async () => {
    const { component } = await create();
    expect(component['view']()).toBe('ready');
    expect(component['encuestas']().length).toBe(2);
  });

  it('sets view to error on load failure', async () => {
    const { component } = await create(buildSvc(throwError(() => new Error('fail'))));
    expect(component['view']()).toBe('error');
  });

  describe('filtered', () => {
    it('only includes REGISTRATION items in the list', async () => {
      const { component } = await create(buildSvc(of([convocatoriaItem, ...mockList])));
      expect(component['filtered']().length).toBe(2);
      expect(component['filtered']().every((c) => c.type === 'REGISTRATION')).toBe(true);
    });
  });

  describe('navigation', () => {
    it('navigateToNew navigates to the encuesta creation route', async () => {
      const { component, mockRouter } = await create();
      component['navigateToNew']();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/', 'encuestas', 'new']);
    });

    it('navigateToDetail navigates to the encuesta detail route', async () => {
      const { component, mockRouter } = await create();
      component['navigateToDetail']('4');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/', 'encuestas', '4']);
    });
  });

  describe('actions', () => {
    it('sets pendingAction on requestClose', async () => {
      const { component } = await create();
      component['requestClose']('4');
      expect(component['pendingAction']()).toEqual({ type: 'close', id: '4', name: 'Encuesta X' });
    });

    it('updates status to CLOSED after successful close', async () => {
      const svc = buildSvc();
      svc.close = vi.fn().mockReturnValue(of(undefined));
      const { component } = await create(svc);
      component['requestClose']('4');
      component['confirmAction']();
      expect(component['encuestas']().find((c) => c.id === '4')?.status).toBe('CLOSED');
    });

    it('removes encuesta from list after successful delete', async () => {
      const svc = buildSvc();
      svc.delete = vi.fn().mockReturnValue(of(undefined));
      const { component } = await create(svc);
      component['requestDelete']('5');
      component['confirmAction']();
      expect(component['encuestas']().find((c) => c.id === '5')).toBeUndefined();
    });
  });
});
