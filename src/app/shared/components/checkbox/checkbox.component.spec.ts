import { TestBed } from '@angular/core/testing';
import { CheckboxComponent } from './checkbox.component';

describe('CheckboxComponent', () => {
  it('should instantiate', () => {
    TestBed.configureTestingModule({});
    const component = TestBed.runInInjectionContext(() => new CheckboxComponent());
    expect(component).toBeTruthy();
  });

  it('onChange() should emit the new checked state', () => {
    TestBed.configureTestingModule({});
    const component = TestBed.runInInjectionContext(() => new CheckboxComponent());
    const emitted: boolean[] = [];
    component.changed.subscribe((v) => emitted.push(v));
    const event = { target: { checked: true } } as unknown as Event;
    (component as unknown as { onChange(e: Event): void }).onChange(event);
    expect(emitted).toEqual([true]);
  });
});
