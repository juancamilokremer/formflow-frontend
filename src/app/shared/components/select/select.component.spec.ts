import { TestBed } from '@angular/core/testing';
import { SelectComponent } from './select.component';

describe('SelectComponent', () => {
  it('should instantiate', () => {
    TestBed.configureTestingModule({});
    const component = TestBed.runInInjectionContext(() => new SelectComponent());
    expect(component).toBeTruthy();
  });

  it('onChange() should emit the selected value', () => {
    TestBed.configureTestingModule({});
    const component = TestBed.runInInjectionContext(() => new SelectComponent());
    const emitted: string[] = [];
    component.changed.subscribe((v) => emitted.push(v));
    const event = { target: { value: 'DRAFT' } } as unknown as Event;
    (component as unknown as { onChange(e: Event): void }).onChange(event);
    expect(emitted).toEqual(['DRAFT']);
  });
});
