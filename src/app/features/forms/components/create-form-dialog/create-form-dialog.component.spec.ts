import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CreateFormDialogComponent } from './create-form-dialog.component';
import { FormsService } from '../../services/forms.service';
import { Form } from '../../models/form.model';

const mockForm: Form = {
  id: 'new-id', name: 'Test', description: null,
  type: 'CANDIDATES', status: 'DRAFT', version: 1,
  sectionCount: 0, responseCount: 0, lastResponseAt: null,
  createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z',
};

function setup() {
  const mockCreate = vi.fn();
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(), provideHttpClientTesting(),
      { provide: FormsService, useValue: { create: mockCreate } },
    ],
  });
  const component = TestBed.runInInjectionContext(() => new CreateFormDialogComponent());
  return { component, mockCreate };
}

describe('CreateFormDialogComponent', () => {
  it('should instantiate', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('selectType() should update type signal', () => {
    const { component } = setup();
    component['selectType']('DIAGNOSTIC');
    expect(component['type']()).toBe('DIAGNOSTIC');
  });

  it('submit() should do nothing when name is empty', () => {
    const { component, mockCreate } = setup();
    component['name'].set('  ');
    component['submit']();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('submit() should call service and emit created on success', () => {
    const { component, mockCreate } = setup();
    mockCreate.mockReturnValue(of(mockForm));
    const emitted: Form[] = [];
    component.created.subscribe((f) => emitted.push(f));
    component['name'].set('Mi formulario');
    component['submit']();
    expect(mockCreate).toHaveBeenCalledWith({ name: 'Mi formulario', type: 'CANDIDATES' });
    expect(emitted).toHaveLength(1);
    expect(emitted[0].id).toBe('new-id');
    expect(component['creating']()).toBe(false);
    expect(component['name']()).toBe('');
  });

  it('submit() should reset creating on error', () => {
    const { component, mockCreate } = setup();
    mockCreate.mockReturnValue(throwError(() => new Error('fail')));
    component['name'].set('Fallo');
    component['submit']();
    expect(component['creating']()).toBe(false);
  });

  it('cancel() should emit cancelled and reset state', () => {
    const { component } = setup();
    let emitted = false;
    component.cancelled.subscribe(() => { emitted = true; });
    component['name'].set('some text');
    component['cancel']();
    expect(emitted).toBe(true);
    expect(component['name']()).toBe('');
  });

  it('cancel() should not emit while creating', () => {
    const { component } = setup();
    let emitted = false;
    component.cancelled.subscribe(() => { emitted = true; });
    component['creating'].set(true);
    component['cancel']();
    expect(emitted).toBe(false);
  });
});
