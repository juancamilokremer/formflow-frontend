import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { ConvocatoriaCardComponent } from './convocatoria-card.component';
import { ConvocatoriaSummary } from '../../models/convocatoria.model';

const base: ConvocatoriaSummary = {
  id: 'conv-1',
  name: 'Analista de RRHH',
  status: 'ACTIVE',
  candidateCount: 10,
  respondedCount: 7,
  startDate: '2026-07-01T00:00:00Z',
  endDate: null,
  createdAt: '2026-06-01T00:00:00Z',
};

async function create(override: Partial<ConvocatoriaSummary> = {}) {
  await TestBed.configureTestingModule({
    imports: [ConvocatoriaCardComponent],
    providers: [provideTranslateService({ lang: 'es' })],
  }).compileComponents();

  const fixture = TestBed.createComponent(ConvocatoriaCardComponent);
  fixture.componentRef.setInput('convocatoria', { ...base, ...override });
  return fixture.componentInstance;
}

describe('ConvocatoriaCardComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  describe('progressPercent', () => {
    it('calculates percentage correctly', async () => {
      const c = await create({ candidateCount: 10, respondedCount: 7 });
      expect(c['progressPercent']()).toBe(70);
    });

    it('returns 0 when no candidates', async () => {
      const c = await create({ candidateCount: 0, respondedCount: 0 });
      expect(c['progressPercent']()).toBe(0);
    });

    it('rounds to nearest integer', async () => {
      const c = await create({ candidateCount: 3, respondedCount: 1 });
      expect(c['progressPercent']()).toBe(33);
    });
  });

  describe('status computed', () => {
    it('isActive is true for ACTIVE', async () => {
      const c = await create({ status: 'ACTIVE' });
      expect(c['isActive']()).toBe(true);
      expect(c['isDraft']()).toBe(false);
      expect(c['isClosed']()).toBe(false);
    });

    it('isDraft is true for DRAFT', async () => {
      const c = await create({ status: 'DRAFT' });
      expect(c['isDraft']()).toBe(true);
    });

    it('isClosed is true for CLOSED', async () => {
      const c = await create({ status: 'CLOSED' });
      expect(c['isClosed']()).toBe(true);
    });
  });

  describe('outputs', () => {
    it('emits convocatoria id on onViewDetail', async () => {
      const c = await create();
      let emitted: string | undefined;
      c.viewDetail.subscribe((id) => (emitted = id));
      c['onViewDetail']();
      expect(emitted).toBe('conv-1');
    });

    it('emits convocatoria id on onClose', async () => {
      const c = await create();
      let emitted: string | undefined;
      c.close.subscribe((id) => (emitted = id));
      c['onClose']();
      expect(emitted).toBe('conv-1');
    });

    it('emits convocatoria id on onDelete', async () => {
      const c = await create();
      let emitted: string | undefined;
      c.delete.subscribe((id) => (emitted = id));
      c['onDelete']();
      expect(emitted).toBe('conv-1');
    });
  });
});
