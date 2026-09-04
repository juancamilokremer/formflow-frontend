import { FormBuilderComponent } from './form-builder.component';
import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Category } from '../../../../core/models/category.model';
import { CategoryService } from '../../../../core/services/category.service';
import { FormsService } from '../../services/forms.service';
import { ConvocatoriaService } from '../../../convocatorias/services/convocatoria.service';
import { ConvocatoriaDetail } from '../../../convocatorias/models/convocatoria.model';
import { FormDetail, FormQuestion, FormSection } from '../../models/form.model';

const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Técnicas', color: '#4F46E5', description: null, createdAt: '', updatedAt: '' },
];

const MOCK_SECTION: FormSection = { id: 's1', title: 'Sección 1', position: 1, questions: [] };

const MOCK_QUESTION: FormQuestion = {
  id: 'q1', type: 'text', title: 'Q', description: null,
  position: 0, required: false, categoryId: null, config: {}, timeLimitSeconds: null,
};

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

const MOCK_CONVOCATORIA: ConvocatoriaDetail = {
  id: 'conv1', tenantId: 't1', name: 'RRHH', type: 'CANDIDATES', status: 'DRAFT',
  scoringConfig: { aptoMin: 70, revisarMin: 50 },
  startDate: null, endDate: null, createdAt: '', updatedAt: '', candidates: [], forms: [],
};

function buildComponent(formResult: 'ok' | 'error' = 'ok', convocatoriaDetail: ConvocatoriaDetail = MOCK_CONVOCATORIA) {
  const mockFormsService = {
    getById:       vi.fn().mockReturnValue(formResult === 'ok' ? of(MOCK_FORM) : throwError(() => new Error())),
    update:        vi.fn().mockReturnValue(of(undefined)),
    updateStatus:  vi.fn().mockImplementation((_id: string, status: string) => of({ ...MOCK_FORM, status })),
    createSection: vi.fn().mockReturnValue(of({ id: 's2', title: 'Nueva sección', position: 2, questions: [] } satisfies FormSection)),
    updateSection: vi.fn().mockReturnValue(of({ ...MOCK_SECTION, title: 'Renombrada' } satisfies FormSection)),
    deleteSection: vi.fn().mockReturnValue(of(undefined)),
    addQuestion: vi.fn().mockReturnValue(of(MOCK_QUESTION)),
    deleteQuestion: vi.fn().mockReturnValue(of(undefined)),
    updateQuestion: vi.fn().mockReturnValue(of(MOCK_QUESTION)),
    reorderQuestions: vi.fn().mockReturnValue(of(undefined)),
    reorderSections: vi.fn().mockReturnValue(of(undefined)),
    remove: vi.fn().mockReturnValue(of(undefined)),
    generateVersion: vi.fn().mockReturnValue(of({ ...MOCK_FORM, id: 'f2', status: 'DRAFT' })),
    duplicate: vi.fn().mockReturnValue(of({ ...MOCK_FORM, id: 'f3', status: 'DRAFT' })),
    getVersionHistory: vi.fn().mockReturnValue(of([
      { id: 'f1', version: 1, status: 'DRAFT', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    ])),
  };

  const mockCategoryService = {
    getAll: vi.fn().mockReturnValue(of(MOCK_CATEGORIES)),
  };

  const mockConvocatoriaService = {
    getById: vi.fn().mockReturnValue(of(convocatoriaDetail)),
    addForm: vi.fn().mockReturnValue(of({
      id: 'cf1', formId: 'f1', weight: 100, categoryWeights: [], minScore: null, position: 0,
    })),
  };

  TestBed.overrideProvider(FormsService, { useValue: mockFormsService });
  TestBed.overrideProvider(CategoryService, { useValue: mockCategoryService });
  TestBed.overrideProvider(ConvocatoriaService, { useValue: mockConvocatoriaService });
  const fixture = TestBed.createComponent(FormBuilderComponent);
  fixture.componentRef.setInput('id', 'f1');
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance, mockFormsService, mockCategoryService, mockConvocatoriaService };
}

describe('FormBuilderComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormBuilderComponent],
      providers: [
        provideRouter([]),
        provideTranslateService({ lang: 'es' }),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => 'f1' }, queryParamMap: { get: () => null } } },
        },
      ],
    }).compileComponents();
  });

  it('loads the form on init', () => {
    const { component } = buildComponent();
    expect((component as any).form()).toEqual(MOCK_FORM);
    expect((component as any).loading()).toBe(false);
  });

  it('loads categories on init', () => {
    const { component } = buildComponent();
    expect((component as any).categories()).toEqual(MOCK_CATEGORIES);
  });

  it('onCategoryCreated appends the category to the signal', () => {
    const { component } = buildComponent();
    const newCategory: Category = {
      id: 'cat-2', name: 'Blandas', color: '#10B981', description: null, createdAt: '', updatedAt: '',
    };
    (component as any).onCategoryCreated(newCategory);
    expect((component as any).categories()).toEqual([...MOCK_CATEGORIES, newCategory]);
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

  it('onPublishClicked activates a DRAFT form', () => {
    const { component, mockFormsService } = buildComponent();
    (component as any).onPublishClicked();
    expect(mockFormsService.updateStatus).toHaveBeenCalledWith('f1', 'ACTIVE');
    expect((component as any).form()!.status).toBe('ACTIVE');
  });

  it('onPublishClicked archives an ACTIVE form', () => {
    const { component, mockFormsService } = buildComponent();
    (component as any).form.update((f: FormDetail) => ({ ...f, status: 'ACTIVE' }));
    (component as any).onPublishClicked();
    expect(mockFormsService.updateStatus).toHaveBeenCalledWith('f1', 'ARCHIVED');
    expect((component as any).form()!.status).toBe('ARCHIVED');
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

  describe('isLocked', () => {
    it('is true for an ACTIVE CANDIDATES form', () => {
      const { component } = buildComponent();
      (component as any).form.update((f: FormDetail) => ({ ...f, status: 'ACTIVE', type: 'CANDIDATES' }));
      expect((component as any).isLocked()).toBe(true);
    });

    it('is true for an ARCHIVED DIAGNOSTIC form', () => {
      const { component } = buildComponent();
      (component as any).form.update((f: FormDetail) => ({ ...f, status: 'ARCHIVED', type: 'DIAGNOSTIC' }));
      expect((component as any).isLocked()).toBe(true);
    });

    it('is false for a DRAFT form regardless of type', () => {
      const { component } = buildComponent();
      (component as any).form.update((f: FormDetail) => ({ ...f, status: 'DRAFT', type: 'CANDIDATES' }));
      expect((component as any).isLocked()).toBe(false);
    });

    it('is false for a REGISTRATION form regardless of status', () => {
      const { component } = buildComponent();
      (component as any).form.update((f: FormDetail) => ({ ...f, status: 'ACTIVE', type: 'REGISTRATION' }));
      expect((component as any).isLocked()).toBe(false);
      (component as any).form.update((f: FormDetail) => ({ ...f, status: 'ARCHIVED', type: 'REGISTRATION' }));
      expect((component as any).isLocked()).toBe(false);
    });
  });

  describe('locked guards', () => {
    function lockForm(component: any): void {
      component.form.update((f: FormDetail) => ({ ...f, status: 'ACTIVE', type: 'CANDIDATES' }));
    }

    it('onSectionAdded does not call createSection when locked', () => {
      const { component, mockFormsService } = buildComponent();
      lockForm(component);
      (component as any).onSectionAdded('Nueva sección');
      expect(mockFormsService.createSection).not.toHaveBeenCalled();
    });

    it('onSectionDeleted does not call deleteSection when locked', () => {
      const { component, mockFormsService } = buildComponent();
      lockForm(component);
      (component as any).onSectionDeleted('s1');
      expect(mockFormsService.deleteSection).not.toHaveBeenCalled();
    });

    it('onTypeSelected does not call addQuestion when locked', () => {
      const { component, mockFormsService } = buildComponent();
      lockForm(component);
      (component as any).onTypeSelected('text');
      expect(mockFormsService.addQuestion).not.toHaveBeenCalled();
    });

    it('onQuestionDeleted does not call deleteQuestion when locked', () => {
      const { component, mockFormsService } = buildComponent();
      lockForm(component);
      (component as any).onQuestionDeleted({ sectionId: 's1', questionId: 'q1' });
      expect(mockFormsService.deleteQuestion).not.toHaveBeenCalled();
    });
  });

  describe('actionError', () => {
    it('is set when createSection fails', () => {
      const { component, mockFormsService } = buildComponent();
      mockFormsService.createSection.mockReturnValue(throwError(() => new Error()));
      (component as any).onSectionAdded('Nueva sección');
      expect((component as any).actionError()).toBe('builder.error.section_create');
    });

    it('is set when deleteSection fails', () => {
      const { component, mockFormsService } = buildComponent();
      mockFormsService.deleteSection.mockReturnValue(throwError(() => new Error()));
      (component as any).onSectionDeleted('s1');
      expect((component as any).actionError()).toBe('builder.error.section_delete');
    });

    it('is set when addQuestion fails', () => {
      const { component, mockFormsService } = buildComponent();
      mockFormsService.addQuestion.mockReturnValue(throwError(() => new Error()));
      (component as any).onTypeSelected('text');
      expect((component as any).actionError()).toBe('builder.error.question_create');
    });

    it('is set when deleteQuestion fails', () => {
      const { component, mockFormsService } = buildComponent();
      mockFormsService.deleteQuestion.mockReturnValue(throwError(() => new Error()));
      (component as any).onQuestionDeleted({ sectionId: 's1', questionId: 'q1' });
      expect((component as any).actionError()).toBe('builder.error.question_delete');
    });
  });

  describe('time limit', () => {
    it('saveQuestionChange (via onQuestionChanged) includes timeLimitSeconds in the update request', () => {
      const { component, mockFormsService } = buildComponent();
      (component as any).form.update((f: FormDetail) => ({
        ...f,
        sections: [{ ...f.sections[0], questions: [MOCK_QUESTION] }],
      }));
      (component as any).selectedQuestionId.set('q1');

      (component as any).onQuestionChanged({ timeLimitSeconds: 30 });

      expect(mockFormsService.updateQuestion).toHaveBeenCalledWith(
        'f1', 's1', 'q1',
        expect.objectContaining({ timeLimitSeconds: 30 }),
      );
    });

    it('onFormTimeLimitChanged calls formsService.update with the new value', () => {
      const { component, mockFormsService } = buildComponent();

      (component as any).onFormTimeLimitChanged(600);

      expect(mockFormsService.update).toHaveBeenCalledWith('f1', 'Mi formulario', null, 600);
      expect((component as any).form()!.timeLimitSeconds).toBe(600);
    });
  });

  describe('reloading when the id input changes (Angular reuses this component across /forms/:id/edit navigations)', () => {
    it('re-fetches the form and resets selection state when id() changes', () => {
      const { fixture, component, mockFormsService } = buildComponent();
      expect(mockFormsService.getById).toHaveBeenCalledWith('f1');
      expect((component as any).form()!.id).toBe('f1');

      (component as any).selectedQuestionId.set('q1');
      (component as any).drawerOpen.set(true);
      (component as any).actionError.set('builder.error.load');

      const otherForm = { ...MOCK_FORM, id: 'f9', status: 'ARCHIVED' as const };
      mockFormsService.getById.mockReturnValue(of(otherForm));
      fixture.componentRef.setInput('id', 'f9');
      fixture.detectChanges();

      expect(mockFormsService.getById).toHaveBeenCalledWith('f9');
      expect((component as any).form()!.id).toBe('f9');
      expect((component as any).selectedQuestionId()).toBeNull();
      expect((component as any).drawerOpen()).toBe(false);
      expect((component as any).actionError()).toBeNull();
    });
  });

  describe('onGenerateVersion', () => {
    it('calls generateVersion and navigates to the new form builder on success', () => {
      const { component, mockFormsService } = buildComponent();
      const router = TestBed.inject(Router);
      const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

      (component as any).onGenerateVersion();

      expect(mockFormsService.generateVersion).toHaveBeenCalledWith('f1');
      expect(navigateSpy).toHaveBeenCalledWith(['forms', 'f2', 'edit']);
    });

    it('sets actionError when generateVersion fails', () => {
      const { component, mockFormsService } = buildComponent();
      mockFormsService.generateVersion.mockReturnValue(throwError(() => new Error()));

      (component as any).onGenerateVersion();

      expect((component as any).actionError()).toBe('builder.error.version_generate');
    });
  });

  describe('onDuplicate', () => {
    it('calls duplicate and navigates to the new form builder on success', () => {
      const { component, mockFormsService } = buildComponent();
      const router = TestBed.inject(Router);
      const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

      (component as any).onDuplicate();

      expect(mockFormsService.duplicate).toHaveBeenCalledWith('f1');
      expect(navigateSpy).toHaveBeenCalledWith(['forms', 'f3', 'edit']);
    });

    it('sets actionError when duplicate fails', () => {
      const { component, mockFormsService } = buildComponent();
      mockFormsService.duplicate.mockReturnValue(throwError(() => new Error()));

      (component as any).onDuplicate();

      expect((component as any).actionError()).toBe('builder.error.duplicate');
    });
  });

  describe('version history', () => {
    it('onHistoryClicked loads the history and opens the drawer', () => {
      const { component, mockFormsService } = buildComponent();

      (component as any).onHistoryClicked();

      expect(mockFormsService.getVersionHistory).toHaveBeenCalledWith('f1');
      expect((component as any).versionHistory()).toHaveLength(1);
      expect((component as any).historyDrawerOpen()).toBe(true);
    });

    it('onHistoryClicked sets actionError when the request fails', () => {
      const { component, mockFormsService } = buildComponent();
      mockFormsService.getVersionHistory.mockReturnValue(throwError(() => new Error()));

      (component as any).onHistoryClicked();

      expect((component as any).actionError()).toBe('builder.error.history_load');
      expect((component as any).historyDrawerOpen()).toBe(false);
    });

    it('onVersionSelected closes the drawer and navigates to the selected form', () => {
      const { component } = buildComponent();
      const router = TestBed.inject(Router);
      const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      (component as any).historyDrawerOpen.set(true);

      (component as any).onVersionSelected('f9');

      expect((component as any).historyDrawerOpen()).toBe(false);
      expect(navigateSpy).toHaveBeenCalledWith(['forms', 'f9', 'edit']);
    });
  });
});

describe('FormBuilderComponent with convocatoriaId in query params', () => {
  const mockRouter = { navigate: vi.fn() };

  beforeEach(async () => {
    mockRouter.navigate.mockClear();
    await TestBed.configureTestingModule({
      imports: [FormBuilderComponent],
      providers: [
        provideRouter([]),
        provideTranslateService({ lang: 'es' }),
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: () => 'f1' },
              queryParamMap: { get: (key: string) => ({ convocatoriaId: 'conv1' } as Record<string, string>)[key] ?? null },
            },
          },
        },
      ],
    }).compileComponents();
  });

  it('onReturnToConvocatoria attaches the form, navigates to the convocatoria, and does not delete anything', () => {
    const { component, mockConvocatoriaService, mockFormsService } = buildComponent();

    (component as any).onReturnToConvocatoria();

    expect(mockConvocatoriaService.getById).toHaveBeenCalledWith('conv1');
    expect(mockConvocatoriaService.addForm).toHaveBeenCalledWith('conv1', {
      formId: 'f1',
      weight: 100,
      categoryWeights: [],
      minScore: null,
    });
    expect(mockFormsService.remove).not.toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/', 'convocatorias', 'conv1']);
  });

  it('onReturnToConvocatoria does not re-attach a form that is already in the convocatoria, just navigates back', () => {
    const alreadyAttached: ConvocatoriaDetail = {
      ...MOCK_CONVOCATORIA,
      forms: [{ id: 'cf1', formId: 'f1', weight: 100, categoryWeights: [], minScore: null, position: 0 }],
    };
    const { component, mockConvocatoriaService } = buildComponent('ok', alreadyAttached);

    (component as any).onReturnToConvocatoria();

    expect(mockConvocatoriaService.getById).toHaveBeenCalledWith('conv1');
    expect(mockConvocatoriaService.addForm).not.toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/', 'convocatorias', 'conv1']);
  });
});
