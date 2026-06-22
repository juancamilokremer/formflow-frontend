import { TestBed } from '@angular/core/testing';
import { SearchInputComponent } from './search-input.component';

describe('SearchInputComponent', () => {
  it('should instantiate', () => {
    TestBed.configureTestingModule({});
    const component = TestBed.runInInjectionContext(() => new SearchInputComponent());
    expect(component).toBeTruthy();
  });

  it('onInput() should emit the input value', () => {
    TestBed.configureTestingModule({});
    const component = TestBed.runInInjectionContext(() => new SearchInputComponent());
    const emitted: string[] = [];
    component.searched.subscribe((v) => emitted.push(v));
    const event = { target: { value: 'clima' } } as unknown as Event;
    (component as unknown as { onInput(e: Event): void }).onInput(event);
    expect(emitted).toEqual(['clima']);
  });
});
