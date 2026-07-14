import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { provideTranslateService } from '@ngx-translate/core';
import { ConvocatoriasComponent } from './convocatorias.component';
import { ConvocatoriaService } from './services/convocatoria.service';
import { ConvocatoriaSummary } from './models/convocatoria.model';

const mockList: ConvocatoriaSummary[] = [
  { id: '1', name: 'Proceso A', status: 'ACTIVE',  candidateCount: 10, respondedCount: 7, startDate: null, endDate: null, createdAt: '2026-06-01T00:00:00Z' },
  { id: '2', name: 'Proceso B', status: 'DRAFT',   candidateCount: 0,  respondedCount: 0, startDate: null, endDate: null, createdAt: '2026-06-15T00:00:00Z' },
  { id: '3', name: 'Proceso C', status: 'CLOSED',  candidateCount: 5,  respondedCount: 5, startDate: null, endDate: null, createdAt: '2026-05-01T00:00:00Z' },
];

function buildSvc(getAll: Observable<unknown> = of(mockList)) {
  return { getAll: vi.fn().mockReturnValue(getAll), close: vi.fn(), delete: vi.fn() };
}

async function create(svc = buildSvc()) {
  await TestBed.configureTestingModule({
    imports: [ConvocatoriasComponent],
    providers: [
      provideRouter([]),
      provideTranslateService({ lang: 'es' }),
      { provide: ConvocatoriaService, useValue: svc },
    ],
  }).compileComponents();

  const component = TestBed.createComponent(ConvocatoriasComponent).componentInstance;
  return { component, svc };
}

describe('ConvocatoriasComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('sets view to ready and loads list on success', async () => {
    const { component } = await create();
    expect(component['view']()).toBe('ready');
    expect(component['convocatorias']().length).toBe(3);
  });

  it('sets view to error on load failure', async () => {
    const { component } = await create(buildSvc(throwError(() => new Error('fail'))));
    expect(component['view']()).toBe('error');
  });

  describe('computed stats', () => {
    it('counts active convocatorias', async () => {
      const { component } = await create();
      expect(component['activeCount']()).toBe(1);
    });

    it('counts draft convocatorias', async () => {
      const { component } = await create();
      expect(component['draftCount']()).toBe(1);
    });

    it('sums total candidates', async () => {
      const { component } = await create();
      expect(component['totalCandidates']()).toBe(15);
    });

    it('sums total responded', async () => {
      const { component } = await create();
      expect(component['totalResponded']()).toBe(12);
    });
  });

  describe('filtered', () => {
    it('returns all when filter is ALL', async () => {
      const { component } = await create();
      expect(component['filtered']().length).toBe(3);
    });

    it('filters by ACTIVE status', async () => {
      const { component } = await create();
      component['statusFilter'].set('ACTIVE');
      expect(component['filtered']().length).toBe(1);
      expect(component['filtered']()[0].name).toBe('Proceso A');
    });

    it('filters by DRAFT status', async () => {
      const { component } = await create();
      component['statusFilter'].set('DRAFT');
      expect(component['filtered']().length).toBe(1);
    });

    it('filters by CLOSED status', async () => {
      const { component } = await create();
      component['statusFilter'].set('CLOSED');
      expect(component['filtered']().length).toBe(1);
    });
  });

  describe('actions', () => {
    it('sets pendingAction on requestClose', async () => {
      const { component } = await create();
      component['requestClose']('1');
      expect(component['pendingAction']()).toEqual({ type: 'close', id: '1', name: 'Proceso A' });
    });

    it('sets pendingAction on requestDelete', async () => {
      const { component } = await create();
      component['requestDelete']('2');
      expect(component['pendingAction']()).toEqual({ type: 'delete', id: '2', name: 'Proceso B' });
    });

    it('clears pendingAction on cancelAction', async () => {
      const { component } = await create();
      component['requestClose']('1');
      component['cancelAction']();
      expect(component['pendingAction']()).toBeNull();
    });

    it('updates status to CLOSED after successful close', async () => {
      const svc = buildSvc();
      svc.close = vi.fn().mockReturnValue(of(undefined));
      const { component } = await create(svc);
      component['requestClose']('1');
      component['confirmAction']();
      expect(component['convocatorias']().find((c) => c.id === '1')?.status).toBe('CLOSED');
    });

    it('removes convocatoria from list after successful delete', async () => {
      const svc = buildSvc();
      svc.delete = vi.fn().mockReturnValue(of(undefined));
      const { component } = await create(svc);
      component['requestDelete']('2');
      component['confirmAction']();
      expect(component['convocatorias']().find((c) => c.id === '2')).toBeUndefined();
    });
  });
});
