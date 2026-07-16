import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { CategoriesListComponent } from './categories-list.component';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category.model';

const CATEGORIES: Category[] = [
  { id: 'c1', name: 'Técnicas', color: '#4F46E5', description: 'Skills', createdAt: '', updatedAt: '' },
  { id: 'c2', name: 'Blandas', color: '#7C3AED', description: null, createdAt: '', updatedAt: '' },
];

function buildComponent(removeImpl?: ReturnType<typeof vi.fn>) {
  const mockCategoryService = {
    remove: removeImpl ?? vi.fn().mockReturnValue(of(undefined)),
  };

  TestBed.overrideProvider(CategoryService, { useValue: mockCategoryService });
  const fixture = TestBed.createComponent(CategoriesListComponent);
  fixture.componentRef.setInput('categories', CATEGORIES);
  fixture.componentRef.setInput('loading', false);
  fixture.componentRef.setInput('loadError', false);
  return { component: fixture.componentInstance, mockCategoryService };
}

describe('CategoriesListComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriesListComponent],
      providers: [provideTranslateService({ lang: 'es' })],
    }).compileComponents();
  });

  describe('filteredCategories', () => {
    it('filters by name, case-insensitive', () => {
      const { component } = buildComponent();
      component['searchQuery'].set('técn');
      expect(component['filteredCategories']().map((c) => c.id)).toEqual(['c1']);
    });

    it('returns everything when the query is empty', () => {
      const { component } = buildComponent();
      expect(component['filteredCategories']().length).toBe(2);
    });
  });

  describe('delete flow', () => {
    it('confirmDelete sets pendingDeleteId and clears any previous error', () => {
      const { component } = buildComponent();
      component['deleteError'].set('categories.actions.delete_error');
      component['confirmDelete']('c1');
      expect(component['pendingDeleteId']()).toBe('c1');
      expect(component['deleteError']()).toBeNull();
    });

    it('cancelDelete clears pendingDeleteId', () => {
      const { component } = buildComponent();
      component['pendingDeleteId'].set('c1');
      component['cancelDelete']();
      expect(component['pendingDeleteId']()).toBeNull();
    });

    it('deleteCategory emits deleted and clears pendingDeleteId on success', () => {
      const { component } = buildComponent();
      component['pendingDeleteId'].set('c1');
      let emitted: string | undefined;
      component.deleted.subscribe((id) => (emitted = id));

      component['deleteCategory']();

      expect(emitted).toBe('c1');
      expect(component['pendingDeleteId']()).toBeNull();
    });

    it('deleteCategory sets delete_conflict on a 409 and does not emit deleted', () => {
      const remove = vi.fn().mockReturnValue(throwError(() => ({ status: 409 })));
      const { component } = buildComponent(remove);
      component['pendingDeleteId'].set('c1');
      let emitted = false;
      component.deleted.subscribe(() => (emitted = true));

      component['deleteCategory']();

      expect(component['deleteError']()).toBe('categories.actions.delete_conflict');
      expect(emitted).toBe(false);
      expect(component['pendingDeleteId']()).toBeNull();
    });

    it('deleteCategory sets delete_error on any other failure', () => {
      const remove = vi.fn().mockReturnValue(throwError(() => ({ status: 500 })));
      const { component } = buildComponent(remove);
      component['pendingDeleteId'].set('c1');

      component['deleteCategory']();

      expect(component['deleteError']()).toBe('categories.actions.delete_error');
    });
  });
});
