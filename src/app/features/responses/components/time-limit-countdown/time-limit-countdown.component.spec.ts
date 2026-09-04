import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { TimeLimitCountdownComponent } from './time-limit-countdown.component';

describe('TimeLimitCountdownComponent', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      imports: [TimeLimitCountdownComponent],
      providers: [provideTranslateService({ lang: 'es' })],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function create(totalSeconds: number) {
    const fixture = TestBed.createComponent(TimeLimitCountdownComponent);
    fixture.componentRef.setInput('totalSeconds', totalSeconds);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance as any };
  }

  it('starts in the preview phase with remaining set to the total', () => {
    const { component } = create(30);
    expect(component.phase()).toBe('preview');
    expect(component.remaining()).toBe(30);
  });

  it('moves to running after the 3-second preview', () => {
    const { component } = create(30);
    vi.advanceTimersByTime(3000);
    expect(component.phase()).toBe('running');
    expect(component.remaining()).toBe(30);
  });

  it('decrements remaining once per second while running', () => {
    const { component } = create(30);
    vi.advanceTimersByTime(3000);
    vi.advanceTimersByTime(1000);
    expect(component.remaining()).toBe(29);
    vi.advanceTimersByTime(2000);
    expect(component.remaining()).toBe(27);
  });

  it('reaches the expired phase at zero and stays at zero', () => {
    const { component } = create(2);
    vi.advanceTimersByTime(3000 + 2000);
    expect(component.phase()).toBe('expired');
    expect(component.remaining()).toBe(0);
    vi.advanceTimersByTime(5000);
    expect(component.remaining()).toBe(0);
    expect(component.phase()).toBe('expired');
  });

  it('colorState is green above 50% remaining', () => {
    const { component } = create(20);
    expect(component.colorState()).toBe('green');
  });

  it('colorState is yellow between 20% and 50% remaining', () => {
    const { component } = create(20);
    vi.advanceTimersByTime(3000 + 13000);
    expect(component.remaining()).toBe(7);
    expect(component.colorState()).toBe('yellow');
  });

  it('colorState is red at or below 20% remaining', () => {
    const { component } = create(20);
    vi.advanceTimersByTime(3000 + 17000);
    expect(component.remaining()).toBe(3);
    expect(component.colorState()).toBe('red');
  });

  it('showSecondsCountdown becomes true only once remaining is 10 or less', () => {
    const { component } = create(15);
    vi.advanceTimersByTime(3000);
    expect(component.showSecondsCountdown()).toBe(false);
    vi.advanceTimersByTime(5000);
    expect(component.remaining()).toBe(10);
    expect(component.showSecondsCountdown()).toBe(true);
  });

  it('clears its timers on destroy without throwing', () => {
    const { fixture } = create(30);
    expect(() => fixture.destroy()).not.toThrow();
  });
});
