import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { CreateFormDialogComponent } from './create-form-dialog.component';

function buildComponent() {
  const mockRouter = { navigate: vi.fn() };

  TestBed.configureTestingModule({
    imports: [CreateFormDialogComponent],
    providers: [
      provideTranslateService({ lang: 'es' }),
      { provide: Router, useValue: mockRouter },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(CreateFormDialogComponent);
  fixture.detectChanges();
  return { component: fixture.componentInstance, mockRouter };
}

describe('CreateFormDialogComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('does nothing when the name is empty', () => {
    const { component, mockRouter } = buildComponent();
    component['submit']();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('redirects to /convocatorias/new with name+type for CANDIDATES (default)', () => {
    const { component, mockRouter } = buildComponent();
    component['name'].set('RRHH 2026');

    component['submit']();

    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ['/', 'convocatorias', 'new'],
      { queryParams: { name: 'RRHH 2026', type: 'CANDIDATES' } },
    );
  });

  it('redirects to /convocatorias/new with name+type for DIAGNOSTIC', () => {
    const { component, mockRouter } = buildComponent();
    component['name'].set('Clima laboral');
    component['selectType']('DIAGNOSTIC');

    component['submit']();

    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ['/', 'convocatorias', 'new'],
      { queryParams: { name: 'Clima laboral', type: 'DIAGNOSTIC' } },
    );
  });

  it('redirects to /encuestas/new with only name for REGISTRATION', () => {
    const { component, mockRouter } = buildComponent();
    component['name'].set('Encuesta de satisfacción');
    component['selectType']('REGISTRATION');

    component['submit']();

    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ['/', 'encuestas', 'new'],
      { queryParams: { name: 'Encuesta de satisfacción' } },
    );
  });

  it('resets name and type back to defaults after submitting', () => {
    const { component } = buildComponent();
    component['name'].set('RRHH 2026');
    component['selectType']('DIAGNOSTIC');

    component['submit']();

    expect(component['name']()).toBe('');
    expect(component['type']()).toBe('CANDIDATES');
  });

  it('cancel resets and emits cancelled', () => {
    const { component } = buildComponent();
    component['name'].set('RRHH 2026');
    let cancelled = false;
    component.cancelled.subscribe(() => (cancelled = true));

    component['cancel']();

    expect(component['name']()).toBe('');
    expect(cancelled).toBe(true);
  });
});
