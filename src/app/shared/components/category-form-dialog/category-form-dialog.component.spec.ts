import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { CategoryFormDialogComponent } from './category-form-dialog.component';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';

const MOCK_CATEGORY: Category = {
  id: 'c1', name: 'Técnicas', color: '#4F46E5', description: 'Competencias técnicas',
  createdAt: '', updatedAt: '',
};

function buildComponent(overrides: { create?: unknown; update?: unknown } = {}) {
  const mockCategoryService = {
    create: overrides.create ?? vi.fn().mockReturnValue(of(MOCK_CATEGORY)),
    update: overrides.update ?? vi.fn().mockReturnValue(of(MOCK_CATEGORY)),
  };

  TestBed.overrideProvider(CategoryService, { useValue: mockCategoryService });
  const fixture = TestBed.createComponent(CategoryFormDialogComponent);
  return { fixture, component: fixture.componentInstance, mockCategoryService };
}

describe('CategoryFormDialogComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryFormDialogComponent],
      providers: [provideTranslateService({ lang: 'es' })],
    }).compileComponents();
  });

  describe('prefill on open', () => {
    it('starts blank in create mode', () => {
      const { fixture, component } = buildComponent();
      fixture.componentRef.setInput('isOpen', true);
      fixture.componentRef.setInput('category', null);
      fixture.detectChanges();

      expect(component['isEditMode']()).toBe(false);
      expect(component['name']()).toBe('');
      expect(component['color']()).toBe('#4F46E5');
    });

    it('prefills from the category input in edit mode', () => {
      const { fixture, component } = buildComponent();
      fixture.componentRef.setInput('isOpen', true);
      fixture.componentRef.setInput('category', MOCK_CATEGORY);
      fixture.detectChanges();

      expect(component['isEditMode']()).toBe(true);
      expect(component['name']()).toBe('Técnicas');
      expect(component['color']()).toBe('#4F46E5');
      expect(component['description']()).toBe('Competencias técnicas');
    });
  });

  describe('validation', () => {
    it('canSubmit is false with an empty name', () => {
      const { fixture, component } = buildComponent();
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();
      component['name'].set('');
      expect(component['canSubmit']()).toBe(false);
    });

    it('canSubmit is false with an invalid hex color', () => {
      const { fixture, component } = buildComponent();
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();
      component['name'].set('RRHH');
      component['color'].set('not-a-color');
      expect(component['colorValid']()).toBe(false);
      expect(component['canSubmit']()).toBe(false);
    });

    it('canSubmit is true with a valid name and color', () => {
      const { fixture, component } = buildComponent();
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();
      component['name'].set('RRHH');
      component['color'].set('#123ABC');
      expect(component['canSubmit']()).toBe(true);
    });
  });

  describe('submit', () => {
    it('calls create() with the trimmed payload in create mode', () => {
      const { fixture, component, mockCategoryService } = buildComponent();
      fixture.componentRef.setInput('isOpen', true);
      fixture.componentRef.setInput('category', null);
      fixture.detectChanges();
      component['name'].set('  RRHH  ');
      component['color'].set('#123ABC');
      component['description'].set('  algo  ');

      let emitted: Category | undefined;
      component.saved.subscribe((c) => (emitted = c));
      component['submit']();

      expect(mockCategoryService.create).toHaveBeenCalledWith({
        name: 'RRHH', color: '#123ABC', description: 'algo',
      });
      expect(emitted).toEqual(MOCK_CATEGORY);
    });

    it('calls update() with the category id in edit mode', () => {
      const { fixture, component, mockCategoryService } = buildComponent();
      fixture.componentRef.setInput('isOpen', true);
      fixture.componentRef.setInput('category', MOCK_CATEGORY);
      fixture.detectChanges();
      component['name'].set('Nuevo nombre');

      component['submit']();

      expect(mockCategoryService.update).toHaveBeenCalledWith('c1', {
        name: 'Nuevo nombre', color: '#4F46E5', description: 'Competencias técnicas',
      });
    });

    it('sends null description when left blank', () => {
      const { fixture, component, mockCategoryService } = buildComponent();
      fixture.componentRef.setInput('isOpen', true);
      fixture.componentRef.setInput('category', null);
      fixture.detectChanges();
      component['name'].set('RRHH');
      component['description'].set('   ');

      component['submit']();

      expect(mockCategoryService.create).toHaveBeenCalledWith({
        name: 'RRHH', color: '#4F46E5', description: null,
      });
    });

    it('sets error_duplicate_name on a 409 response', () => {
      const create = vi.fn().mockReturnValue(throwError(() => ({ status: 409 })));
      const { fixture, component } = buildComponent({ create });
      fixture.componentRef.setInput('isOpen', true);
      fixture.componentRef.setInput('category', null);
      fixture.detectChanges();
      component['name'].set('RRHH');

      component['submit']();

      expect(component['errorKey']()).toBe('categories.dialog.error_duplicate_name');
      expect(component['saving']()).toBe(false);
    });

    it('sets error_generic on any other failure', () => {
      const create = vi.fn().mockReturnValue(throwError(() => ({ status: 500 })));
      const { fixture, component } = buildComponent({ create });
      fixture.componentRef.setInput('isOpen', true);
      fixture.componentRef.setInput('category', null);
      fixture.detectChanges();
      component['name'].set('RRHH');

      component['submit']();

      expect(component['errorKey']()).toBe('categories.dialog.error_generic');
    });

    it('does nothing when the form is invalid', () => {
      const { fixture, component, mockCategoryService } = buildComponent();
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();
      component['name'].set('');

      component['submit']();

      expect(mockCategoryService.create).not.toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    it('emits cancelled when not saving', () => {
      const { fixture, component } = buildComponent();
      fixture.detectChanges();
      let emitted = false;
      component.cancelled.subscribe(() => (emitted = true));

      component['cancel']();

      expect(emitted).toBe(true);
    });

    it('does not emit cancelled while saving', () => {
      const { fixture, component } = buildComponent();
      fixture.detectChanges();
      component['saving'].set(true);
      let emitted = false;
      component.cancelled.subscribe(() => (emitted = true));

      component['cancel']();

      expect(emitted).toBe(false);
    });
  });
});
