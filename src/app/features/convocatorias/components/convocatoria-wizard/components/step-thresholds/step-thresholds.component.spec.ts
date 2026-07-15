import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { StepThresholdsComponent } from './step-thresholds.component';

async function create(aptoMin = 70, revisarMin = 50) {
  await TestBed.configureTestingModule({
    imports: [StepThresholdsComponent],
    providers: [provideTranslateService({ lang: 'es' })],
  }).compileComponents();

  const fixture = TestBed.createComponent(StepThresholdsComponent);
  fixture.componentRef.setInput('aptoMin', aptoMin);
  fixture.componentRef.setInput('revisarMin', revisarMin);
  return fixture.componentInstance;
}

describe('StepThresholdsComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  describe('zone widths', () => {
    it('computes the three zone widths from the thresholds', async () => {
      const c = await create(70, 50);
      expect(c['noAptoZoneWidth']()).toBe(50);
      expect(c['revisarZoneWidth']()).toBe(20);
      expect(c['aptoZoneWidth']()).toBe(30);
    });
  });

  describe('onRevisarInput', () => {
    it('clamps revisarMin below aptoMin when dragged past it', async () => {
      const c = await create(70, 50);
      let emitted: { aptoMin: number; revisarMin: number } | undefined;
      c.thresholdsChanged.subscribe((e) => (emitted = e));

      c['onRevisarInput'](85);

      expect(emitted).toEqual({ aptoMin: 70, revisarMin: 69 });
    });

    it('passes the value through unclamped when below aptoMin', async () => {
      const c = await create(70, 50);
      let emitted: { aptoMin: number; revisarMin: number } | undefined;
      c.thresholdsChanged.subscribe((e) => (emitted = e));

      c['onRevisarInput'](40);

      expect(emitted).toEqual({ aptoMin: 70, revisarMin: 40 });
    });
  });

  describe('onAptoInput', () => {
    it('clamps revisarMin down when aptoMin is dragged below it', async () => {
      const c = await create(70, 50);
      let emitted: { aptoMin: number; revisarMin: number } | undefined;
      c.thresholdsChanged.subscribe((e) => (emitted = e));

      c['onAptoInput'](45);

      expect(emitted).toEqual({ aptoMin: 45, revisarMin: 44 });
    });

    it('leaves revisarMin untouched when it is still below the new aptoMin', async () => {
      const c = await create(70, 50);
      let emitted: { aptoMin: number; revisarMin: number } | undefined;
      c.thresholdsChanged.subscribe((e) => (emitted = e));

      c['onAptoInput'](80);

      expect(emitted).toEqual({ aptoMin: 80, revisarMin: 50 });
    });
  });
});
