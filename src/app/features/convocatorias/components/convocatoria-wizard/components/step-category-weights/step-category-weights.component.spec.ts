import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { StepCategoryWeightsComponent } from './step-category-weights.component';
import { Category } from '../../../../models/category.model';

const categories: Category[] = [
  { id: 'c1', name: 'Técnicas', color: '#4F46E5', description: null, createdAt: '', updatedAt: '' },
  { id: 'c2', name: 'Blandas', color: '#7C3AED', description: null, createdAt: '', updatedAt: '' },
];

async function create(weights: Record<string, number> = {}, loading = false) {
  await TestBed.configureTestingModule({
    imports: [StepCategoryWeightsComponent],
    providers: [provideTranslateService({ lang: 'es' })],
  }).compileComponents();

  const fixture = TestBed.createComponent(StepCategoryWeightsComponent);
  fixture.componentRef.setInput('categories', categories);
  fixture.componentRef.setInput('weights', weights);
  fixture.componentRef.setInput('loading', loading);
  return fixture.componentInstance;
}

describe('StepCategoryWeightsComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  describe('totalWeight / sumValid / isSkipped', () => {
    it('sums the weight values', async () => {
      const c = await create({ c1: 40, c2: 35 });
      expect(c['totalWeight']()).toBe(75);
    });

    it('is valid when the sum is exactly 100', async () => {
      const c = await create({ c1: 40, c2: 60 });
      expect(c['sumValid']()).toBe(true);
      expect(c['isSkipped']()).toBe(false);
    });

    it('is skipped (not invalid) when all weights are 0', async () => {
      const c = await create({ c1: 0, c2: 0 });
      expect(c['isSkipped']()).toBe(true);
      expect(c['sumValid']()).toBe(false);
    });

    it('is neither valid nor skipped for an intermediate sum', async () => {
      const c = await create({ c1: 40, c2: 40 });
      expect(c['sumValid']()).toBe(false);
      expect(c['isSkipped']()).toBe(false);
    });
  });

  describe('onWeightInput', () => {
    it('updates only the given category and preserves the others', async () => {
      const c = await create({ c1: 40, c2: 35 });
      let emitted: Record<string, number> | undefined;
      c.weightsChanged.subscribe((w) => (emitted = w));

      c['onWeightInput']('c1', 50);

      expect(emitted).toEqual({ c1: 50, c2: 35 });
    });

    it('clamps values above 100', async () => {
      const c = await create({ c1: 40 });
      let emitted: Record<string, number> | undefined;
      c.weightsChanged.subscribe((w) => (emitted = w));

      c['onWeightInput']('c1', 150);

      expect(emitted?.['c1']).toBe(100);
    });

    it('clamps NaN (empty input) to 0', async () => {
      const c = await create({ c1: 40 });
      let emitted: Record<string, number> | undefined;
      c.weightsChanged.subscribe((w) => (emitted = w));

      c['onWeightInput']('c1', NaN);

      expect(emitted?.['c1']).toBe(0);
    });
  });
});
