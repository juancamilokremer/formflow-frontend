import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { ConvocatoriaDetailComponent } from './convocatoria-detail.component';
import { ConvocatoriaService } from '../../services/convocatoria.service';
import { CategoryService } from '../../../../core/services/category.service';
import { FormsService } from '../../../forms/services/forms.service';
import { Candidate, ConvocatoriaDetail } from '../../models/convocatoria.model';
import { Category } from '../../../../core/models/category.model';
import { Form } from '../../../forms/models/form.model';

const DRAFT_CONVOCATORIA: ConvocatoriaDetail = {
  id: 'c1', tenantId: 't1', formId: null, name: 'RRHH', type: 'CANDIDATES', status: 'DRAFT',
  categoryWeights: [], scoringConfig: { aptoMin: 70, revisarMin: 50 },
  startDate: null, endDate: null, createdAt: '', updatedAt: '', candidates: [],
};

function buildComponent(options: {
  convocatoria?: ConvocatoriaDetail;
  updateImpl?: ReturnType<typeof vi.fn>;
  getByIdImpl?: ReturnType<typeof vi.fn>;
} = {}) {
  const initial = options.convocatoria ?? DRAFT_CONVOCATORIA;
  const mockConvocatoriaService = {
    getById: options.getByIdImpl ?? vi.fn().mockReturnValue(of(initial)),
    update: options.updateImpl ?? vi.fn().mockReturnValue(of(initial)),
    delete: vi.fn().mockReturnValue(of(undefined)),
  };
  const mockCategoryService = { getAll: vi.fn().mockReturnValue(of([] as Category[])) };
  const mockFormsService = {
    getAll: vi.fn().mockReturnValue(of([] as Form[])),
    getById: vi.fn().mockReturnValue(of({ sections: [] } as unknown as Form)),
  };
  const mockRouter = { navigate: vi.fn() };

  TestBed.configureTestingModule({
    imports: [ConvocatoriaDetailComponent],
    providers: [
      provideRouter([]),
      provideTranslateService({ lang: 'es' }),
      { provide: ConvocatoriaService, useValue: mockConvocatoriaService },
      { provide: CategoryService, useValue: mockCategoryService },
      { provide: FormsService, useValue: mockFormsService },
      { provide: Router, useValue: mockRouter },
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'c1' } } } },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(ConvocatoriaDetailComponent);
  fixture.detectChanges();
  return { component: fixture.componentInstance, mockConvocatoriaService, mockRouter };
}

describe('ConvocatoriaDetailComponent', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
  });

  it('hydrates from getById and seeds weights/thresholds', () => {
    const withWeights: ConvocatoriaDetail = {
      ...DRAFT_CONVOCATORIA,
      categoryWeights: [{ categoryId: 'cat1', weight: 60 }],
      scoringConfig: { aptoMin: 80, revisarMin: 40 },
    };
    const { component } = buildComponent({ convocatoria: withWeights });

    expect(component['convocatoria']()).toEqual(withWeights);
    expect(component['weights']()).toEqual({ cat1: 60 });
    expect(component['aptoMin']()).toBe(80);
    expect(component['revisarMin']()).toBe(40);
    expect(component['loading']()).toBe(false);
  });

  it('isDraft reflects the convocatoria status', () => {
    const { component } = buildComponent({ convocatoria: { ...DRAFT_CONVOCATORIA, status: 'ACTIVE' } });
    expect(component['isDraft']()).toBe(false);
  });

  it('debounces weights/thresholds changes into a single update() call', () => {
    vi.useFakeTimers();
    const { component, mockConvocatoriaService } = buildComponent();

    component['onWeightsChanged']({ cat1: 40 });
    component['onWeightsChanged']({ cat1: 60 });
    component['onThresholdsChanged']({ aptoMin: 75, revisarMin: 45 });

    expect(mockConvocatoriaService.update).not.toHaveBeenCalled();
    vi.advanceTimersByTime(600);

    expect(mockConvocatoriaService.update).toHaveBeenCalledTimes(1);
    expect(mockConvocatoriaService.update).toHaveBeenCalledWith('c1', {
      name: 'RRHH',
      formId: undefined,
      categoryWeights: [{ categoryId: 'cat1', weight: 60 }],
      scoringConfig: { aptoMin: 75, revisarMin: 45 },
    });
  });

  it('onNameBlur persists immediately when the name changed', () => {
    const { component, mockConvocatoriaService } = buildComponent();
    const input = document.createElement('input');
    input.value = 'Nuevo nombre';

    component['onNameBlur']({ target: input } as unknown as FocusEvent);

    expect(mockConvocatoriaService.update).toHaveBeenCalledWith('c1', expect.objectContaining({ name: 'Nuevo nombre' }));
  });

  it('onNameBlur does nothing when the name is unchanged', () => {
    const { component, mockConvocatoriaService } = buildComponent();
    const input = document.createElement('input');
    input.value = 'RRHH';

    component['onNameBlur']({ target: input } as unknown as FocusEvent);

    expect(mockConvocatoriaService.update).not.toHaveBeenCalled();
  });

  it('onCandidateAdded appends the candidate to the local list', () => {
    const { component } = buildComponent();
    const candidate: Candidate = {
      id: 'cand1', convocatoriaId: 'c1', name: 'Ana', email: 'ana@x.com', token: 't',
      status: 'INVITED', responseId: null, scores: null, invitedAt: null, respondedAt: null, createdAt: '',
    };

    component['onCandidateAdded'](candidate);

    expect(component['convocatoria']()?.candidates).toEqual([candidate]);
  });

  it('onLaunched replaces the local convocatoria with the launched detail', () => {
    const { component } = buildComponent();
    const launched: ConvocatoriaDetail = { ...DRAFT_CONVOCATORIA, status: 'ACTIVE' };

    component['onLaunched'](launched);

    expect(component['convocatoria']()).toEqual(launched);
  });

  it('confirmDelete deletes and navigates to the list', () => {
    const { component, mockConvocatoriaService, mockRouter } = buildComponent();

    component['confirmDelete']();

    expect(mockConvocatoriaService.delete).toHaveBeenCalledWith('c1');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/', 'convocatorias']);
  });
});
