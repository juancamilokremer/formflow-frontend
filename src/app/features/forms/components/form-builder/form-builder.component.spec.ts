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
import { FormDetail, FormSection } from '../../models/form.model';

const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Técnicas', color: '#4F46E5', description: null, createdAt: '', updatedAt: '' },
];

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

const MOCK_CONVOCATORIA: ConvocatoriaDetail = {
  id: 'conv1', tenantId: 't1', formId: null, name: 'RRHH', type: 'CANDIDATES', status: 'DRAFT',
  categoryWeights: [{ categoryId: 'cat-1', weight: 100 }], scoringConfig: { aptoMin: 70, revisarMin: 50 },
  startDate: null, endDate: null, createdAt: '', updatedAt: '', candidates: [],
};

function buildComponent(formResult: 'ok' | 'error' = 'ok') {
  const mockFormsService = {
    getById:       vi.fn().mockReturnValue(formResult === 'ok' ? of(MOCK_FORM) : throwError(() => new Error())),
    update:        vi.fn().mockReturnValue(of(undefined)),
    updateStatus:  vi.fn().mockImplementation((_id: string, status: string) => of({ ...MOCK_FORM, status })),
    createSection: vi.fn().mockReturnValue(of({ id: 's2', title: 'Nueva sección', position: 2, questions: [] } satisfies FormSection)),
    updateSection: vi.fn().mockReturnValue(of({ ...MOCK_SECTION, title: 'Renombrada' } satisfies FormSection)),
    deleteSection: vi.fn().mockReturnValue(of(undefined)),
    remove: vi.fn().mockReturnValue(of(undefined)),
  };

  const mockCategoryService = {
    getAll: vi.fn().mockReturnValue(of(MOCK_CATEGORIES)),
  };

  const mockConvocatoriaService = {
    getById: vi.fn().mockReturnValue(of(MOCK_CONVOCATORIA)),
    update: vi.fn().mockReturnValue(of(MOCK_CONVOCATORIA)),
  };

  TestBed.overrideProvider(FormsService, { useValue: mockFormsService });
  TestBed.overrideProvider(CategoryService, { useValue: mockCategoryService });
  TestBed.overrideProvider(ConvocatoriaService, { useValue: mockConvocatoriaService });
  const fixture = TestBed.createComponent(FormBuilderComponent);
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
    expect(mockConvocatoriaService.update).toHaveBeenCalledWith('conv1', {
      name: 'RRHH',
      formId: 'f1',
      categoryWeights: [{ categoryId: 'cat-1', weight: 100 }],
      scoringConfig: { aptoMin: 70, revisarMin: 50 },
    });
    expect(mockFormsService.remove).not.toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/', 'convocatorias', 'conv1']);
  });
});

describe('FormBuilderComponent with convocatoriaId and replacesFormId in query params', () => {
  const mockRouter = { navigate: vi.fn() };
  const queryParams: Record<string, string> = { convocatoriaId: 'conv1', replacesFormId: 'f9' };

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
              queryParamMap: { get: (key: string) => queryParams[key] ?? null },
            },
          },
        },
      ],
    }).compileComponents();
  });

  it('deletes the replaced form after successfully attaching the new one', () => {
    const { component, mockFormsService } = buildComponent();

    (component as any).onReturnToConvocatoria();

    expect(mockFormsService.remove).toHaveBeenCalledWith('f9');
  });
});
