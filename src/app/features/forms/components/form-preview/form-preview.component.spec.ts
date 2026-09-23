import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { FormPreviewComponent } from './form-preview.component';
import { FormsService } from '../../services/forms.service';
import { ConditionEngineService } from '../../services/condition-engine.service';
import { FormDetail } from '../../models/form.model';

const MOCK_FORM: FormDetail = {
  id: 'f1', name: 'Mi formulario', description: null, type: 'CANDIDATES', status: 'DRAFT',
  version: 1, sectionCount: 0, responseCount: 0, lastResponseAt: null, createdAt: '', updatedAt: '',
  sections: [], timeLimitSeconds: null,
};

function buildComponent(queryParams: Record<string, string> = {}) {
  const mockFormsService = { getById: vi.fn().mockReturnValue(of(MOCK_FORM)) };
  const mockConditionEngine = { isVisible: vi.fn().mockReturnValue(true) };
  const mockRouter = { navigate: vi.fn() };

  TestBed.configureTestingModule({
    imports: [FormPreviewComponent],
    providers: [
      provideTranslateService({ lang: 'es' }),
      { provide: FormsService, useValue: mockFormsService },
      { provide: ConditionEngineService, useValue: mockConditionEngine },
      { provide: Router, useValue: mockRouter },
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            paramMap: { get: (key: string) => ({ id: 'f1', containerId: 'conv1' } as Record<string, string>)[key] ?? null },
            queryParamMap: { get: (key: string) => queryParams[key] ?? null },
            data: { containerKind: queryParams['kind'] ?? 'convocatorias' },
          },
        },
      },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(FormPreviewComponent);
  fixture.detectChanges();
  return { component: fixture.componentInstance, mockRouter };
}

describe('FormPreviewComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('loads the form on init', () => {
    const { component } = buildComponent();
    expect(component['form']()).toEqual(MOCK_FORM);
    expect(component['loading']()).toBe(false);
  });

  describe('goBack', () => {
    it('navigates back to the builder under the container when there is no tab', () => {
      const { component, mockRouter } = buildComponent();
      component['goBack']();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/', 'convocatorias', 'conv1', 'formularios', 'f1']);
    });

    describe('opened from the container card (tab present) — returns to the container', () => {
      it('navigates back to the convocatoria, carrying the tab', () => {
        const { component, mockRouter } = buildComponent({ convocatoriaId: 'conv1', tab: 'formularios' });
        component['goBack']();
        expect(mockRouter.navigate).toHaveBeenCalledWith(
          ['/', 'convocatorias', 'conv1'],
          { queryParams: { tab: 'formularios' } },
        );
      });

      it('navigates back to the encuesta, carrying the tab', () => {
        const { component, mockRouter } = buildComponent({ convocatoriaId: 'conv1', kind: 'encuestas', tab: 'formularios' });
        component['goBack']();
        expect(mockRouter.navigate).toHaveBeenCalledWith(
          ['/', 'encuestas', 'conv1'],
          { queryParams: { tab: 'formularios' } },
        );
      });
    });

    describe('opened from within the builder itself (no tab) — returns to the builder', () => {
      // The container lives in the route itself, so a round trip through the preview can no
      // longer make the builder "forget" which convocatoria/encuesta it belongs to — there
      // is nothing to carry and nothing to drop.
      it('returns to the builder under the convocatoria', () => {
        const { component, mockRouter } = buildComponent();
        component['goBack']();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/', 'convocatorias', 'conv1', 'formularios', 'f1']);
      });

      it('returns to the builder under the encuesta', () => {
        const { component, mockRouter } = buildComponent({ kind: 'encuestas' });
        component['goBack']();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/', 'encuestas', 'conv1', 'formularios', 'f1']);
      });
    });
  });
});
