import { TestBed } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  it('should instantiate', () => {
    TestBed.configureTestingModule({});
    const component = TestBed.runInInjectionContext(() => new EmptyStateComponent());
    expect(component).toBeTruthy();
  });
});
