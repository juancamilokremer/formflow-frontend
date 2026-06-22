import { TestBed } from '@angular/core/testing';
import { AlertDialogComponent } from './alert-dialog.component';

describe('AlertDialogComponent', () => {
  it('should instantiate', () => {
    TestBed.configureTestingModule({});
    const component = TestBed.runInInjectionContext(() => new AlertDialogComponent());
    expect(component).toBeTruthy();
  });
});
