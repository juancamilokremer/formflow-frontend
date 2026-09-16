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
            paramMap: { get: () => 'f1' },
            queryParamMap: { get: (key: string) => queryParams[key] ?? null },
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
    it('navigates to the form builder when there is no convocatoriaId in the query params', () => {
      const { component, mockRouter } = buildComponent();
      component['goBack']();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['forms', 'f1', 'edit']);
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
      // Regression: the builder re-reads convocatoriaId/kind fresh from its own route's
      // query params on construction. If "Salir" dropped them, a round trip through the
      // preview made the builder "forget" it belongs to a convocatoria/encuesta — the
      // topbar fell back to a generic link, and the pending attach-on-return never fired.
      it('carries convocatoriaId back to the builder so it does not forget its convocatoria', () => {
        const { component, mockRouter } = buildComponent({ convocatoriaId: 'conv1' });
        component['goBack']();
        expect(mockRouter.navigate).toHaveBeenCalledWith(
          ['forms', 'f1', 'edit'],
          { queryParams: { convocatoriaId: 'conv1', kind: null } },
        );
      });

      it('carries convocatoriaId and kind back to the builder for an encuesta', () => {
        const { component, mockRouter } = buildComponent({ convocatoriaId: 'conv1', kind: 'encuestas' });
        component['goBack']();
        expect(mockRouter.navigate).toHaveBeenCalledWith(
          ['forms', 'f1', 'edit'],
          { queryParams: { convocatoriaId: 'conv1', kind: 'encuestas' } },
        );
      });
    });
  });
});
