import { FormBuilderComponent } from './form-builder.component';
import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormsService } from '../../services/forms.service';
import { FormDetail, FormSection } from '../../models/form.model';

const MOCK_SECTION: FormSection = { id: 's1', title: 'Sección 1', position: 1, questions: [] };

const MOCK_FORM: FormDetail = {
  id: 'f1',
  name: 'Mi formulario',
  description: null,
  type: 'CANDIDATES',
  status: 'DRAFT',
  version: 1,
  sectionCount: 1,
  responseCount: 0,
  lastResponseAt: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  sections: [MOCK_SECTION],
  timeLimitSeconds: null,
};

function buildComponent(formResult: 'ok' | 'error' = 'ok') {
  const mockFormsService = {
    getById:       vi.fn().mockReturnValue(formResult === 'ok' ? of(MOCK_FORM) : throwError(() => new Error())),
    update:        vi.fn().mockReturnValue(of(undefined)),
    createSection: vi.fn().mockReturnValue(of({ id: 's2', title: 'Nueva sección', position: 2, questions: [] } satisfies FormSection)),
    updateSection: vi.fn().mockReturnValue(of({ ...MOCK_SECTION, title: 'Renombrada' } satisfies FormSection)),
    deleteSection: vi.fn().mockReturnValue(of(undefined)),
  };

  TestBed.overrideProvider(FormsService, { useValue: mockFormsService });
  const fixture = TestBed.createComponent(FormBuilderComponent);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance, mockFormsService };
}

describe('FormBuilderComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormBuilderComponent],
      providers: [
        provideRouter([]),
        provideTranslateService({ lang: 'es' }),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'f1' } } } },
      ],
    }).compileComponents();
  });

  it('loads the form on init', () => {
    const { component } = buildComponent();
    expect((component as any).form()).toEqual(MOCK_FORM);
    expect((component as any).loading()).toBe(false);
  });

  it('sets loadError on HTTP failure', () => {
    const { component } = buildComponent('error');
    expect((component as any).loadError()).toBe(true);
    expect((component as any).loading()).toBe(false);
  });

  it('onNameChanged calls updateName and updates form signal', () => {
    const { component, mockFormsService } = buildComponent();
    (component as any).onNameChanged('Nuevo nombre');
    expect(mockFormsService.update).toHaveBeenCalledWith('f1', 'Nuevo nombre', null, null);
    expect((component as any).form()!.name).toBe('Nuevo nombre');
  });

  it('onSectionAdded calls createSection and appends to sections', () => {
    const { component, mockFormsService } = buildComponent();
    (component as any).onSectionAdded('Nueva sección');
    expect(mockFormsService.createSection).toHaveBeenCalledWith('f1', { title: 'Nueva sección' });
    expect((component as any).form()!.sections.length).toBe(2);
  });

  it('onSectionUpdated calls updateSection and patches title in sections', () => {
    const { component, mockFormsService } = buildComponent();
    (component as any).onSectionUpdated({ id: 's1', title: 'Renombrada' });
    expect(mockFormsService.updateSection).toHaveBeenCalledWith('f1', 's1', { title: 'Renombrada' });
    expect((component as any).form()!.sections[0].title).toBe('Renombrada');
  });

  it('onSectionDeleted calls deleteSection and removes from sections', () => {
    const { component, mockFormsService } = buildComponent();
    (component as any).onSectionDeleted('s1');
    expect(mockFormsService.deleteSection).toHaveBeenCalledWith('f1', 's1');
    expect((component as any).form()!.sections.length).toBe(0);
  });
});
