import { TestBed } from '@angular/core/testing';
import { DrawerComponent } from './drawer.component';

describe('DrawerComponent', () => {
  it('should instantiate', () => {
    TestBed.configureTestingModule({});
    const component = TestBed.runInInjectionContext(() => new DrawerComponent());
    expect(component).toBeTruthy();
  });
});
