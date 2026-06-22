import { TestBed } from '@angular/core/testing';
import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  it('should instantiate', () => {
    TestBed.configureTestingModule({});
    const component = TestBed.runInInjectionContext(() => new ConfirmDialogComponent());
    expect(component).toBeTruthy();
  });
});
