import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { TimeLimitFieldComponent } from './time-limit-field.component';

describe('TimeLimitFieldComponent', () => {
  function create(seconds: number | null = null) {
    TestBed.configureTestingModule({
      imports: [TimeLimitFieldComponent],
      providers: [provideTranslateService({ lang: 'es' })],
    });
    const fixture = TestBed.createComponent(TimeLimitFieldComponent);
    fixture.componentRef.setInput('seconds', seconds);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance as any };
  }

  it('creates', () => {
    const { component } = create();
    expect(component).toBeTruthy();
  });

  it('displayValue is null when seconds is null', () => {
    const { component } = create(null);
    expect(component.displayValue).toBeNull();
  });

  it('onValueBlur emits seconds when unit is seconds', () => {
    const { component } = create();
    let emitted: number | null | undefined;
    component.secondsChange.subscribe((v: number | null) => (emitted = v));
    component.onValueBlur({ target: { value: '45' } } as unknown as FocusEvent);
    expect(emitted).toBe(45);
  });

  it('onValueBlur converts to seconds when unit is minutes', () => {
    const { component } = create();
    component.onUnitChange({ target: { value: 'minutes' } } as unknown as Event);
    let emitted: number | null | undefined;
    component.secondsChange.subscribe((v: number | null) => (emitted = v));
    component.onValueBlur({ target: { value: '2' } } as unknown as FocusEvent);
    expect(emitted).toBe(120);
  });

  it('onValueBlur with empty value emits null when a limit was previously set', () => {
    const { component } = create(90);
    let emitted: number | null | undefined;
    component.secondsChange.subscribe((v: number | null) => (emitted = v));
    component.onValueBlur({ target: { value: '' } } as unknown as FocusEvent);
    expect(emitted).toBeNull();
  });

  it('onValueBlur does not emit when the value is unchanged', () => {
    const { component } = create(45);
    let emitted: number | null | undefined;
    component.secondsChange.subscribe((v: number | null) => (emitted = v));
    component.onValueBlur({ target: { value: '45' } } as unknown as FocusEvent);
    expect(emitted).toBeUndefined();
  });

  it('auto-detects the minutes unit for a clean multiple of 60', () => {
    const { component } = create(120);
    expect(component.unit()).toBe('minutes');
    expect(component.displayValue).toBe(2);
  });

  it('auto-detects the seconds unit otherwise', () => {
    const { component } = create(45);
    expect(component.unit()).toBe('seconds');
    expect(component.displayValue).toBe(45);
  });
});
