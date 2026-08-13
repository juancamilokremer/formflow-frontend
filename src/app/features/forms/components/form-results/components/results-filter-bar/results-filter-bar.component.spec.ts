import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { ResultsFilterBarComponent } from './results-filter-bar.component';
import { DateRangeFilter } from '../../../../models/form-response.model';

describe('ResultsFilterBarComponent', () => {
  let component: ResultsFilterBarComponent;
  let fixture: ComponentFixture<ResultsFilterBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultsFilterBarComponent],
      providers: [provideTranslateService({ lang: 'es' })],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultsFilterBarComponent);
    component = fixture.componentInstance;
  });

  function emissions(): DateRangeFilter[] {
    const emitted: DateRangeFilter[] = [];
    component.rangeChange.subscribe((r) => emitted.push(r));
    return emitted;
  }

  it('emits the 7d preset on init, with "to" defaulting to today', () => {
    const emitted = emissions();
    fixture.detectChanges();
    expect(emitted).toHaveLength(1);
    expect(emitted[0].from).toBeDefined();
    expect(emitted[0].to).toBeDefined();
    expect((component as any).activePreset()).toBe('7d');
  });

  describe('selectPreset', () => {
    it('switches to "all" and emits an open-ended range', () => {
      const emitted = emissions();
      fixture.detectChanges();
      (component as any).selectPreset('all');
      expect((component as any).activePreset()).toBe('all');
      expect(emitted[emitted.length - 1]).toEqual({ from: undefined, to: undefined });
    });

    it('switches to "30d" and fills both the from and to fields', () => {
      fixture.detectChanges();
      (component as any).selectPreset('30d');
      expect((component as any).activePreset()).toBe('30d');
      expect((component as any).form.value.from).not.toBe('');
      expect((component as any).form.value.to).not.toBe('');
    });
  });

  describe('custom range', () => {
    it('clears the active preset and emits the custom range when a date field changes', () => {
      const emitted = emissions();
      fixture.detectChanges();
      (component as any).form.setValue({ from: '2026-08-01', to: '2026-08-06' });
      expect((component as any).activePreset()).toBeNull();
      const last = emitted[emitted.length - 1];
      expect(last.from).toBe(new Date('2026-08-01T00:00:00').toISOString());
      expect(last.to).toBe(new Date('2026-08-06T23:59:59.999').toISOString());
    });

    it('emits undefined bounds for empty date fields', () => {
      const emitted = emissions();
      fixture.detectChanges();
      (component as any).form.setValue({ from: '', to: '' });
      const last = emitted[emitted.length - 1];
      expect(last).toEqual({ from: undefined, to: undefined });
    });
  });
});
