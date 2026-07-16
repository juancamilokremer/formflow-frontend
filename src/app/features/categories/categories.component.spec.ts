import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { CategoriesComponent } from './categories.component';
import { CategoryService } from './services/category.service';
import { Category } from './models/category.model';

const CATEGORIES: Category[] = [
  { id: 'c1', name: 'Técnicas', color: '#4F46E5', description: null, createdAt: '', updatedAt: '' },
  { id: 'c2', name: 'Blandas', color: '#7C3AED', description: null, createdAt: '', updatedAt: '' },
];

function buildComponent(getAllResult: 'ok' | 'error' = 'ok') {
  const mockCategoryService = {
    getAll: vi.fn().mockReturnValue(
      getAllResult === 'ok' ? of(CATEGORIES) : throwError(() => new Error()),
    ),
  };

  TestBed.overrideProvider(CategoryService, { useValue: mockCategoryService });
  const fixture = TestBed.createComponent(CategoriesComponent);
  fixture.detectChanges();
  return { component: fixture.componentInstance, mockCategoryService };
}

describe('CategoriesComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriesComponent],
      providers: [provideTranslateService({ lang: 'es' })],
    }).compileComponents();
  });

  it('loads categories on init', () => {
    const { component } = buildComponent();
    expect(component['categories']()).toEqual(CATEGORIES);
    expect(component['loading']()).toBe(false);
  });

  it('sets loadError on failure', () => {
    const { component } = buildComponent('error');
    expect(component['loadError']()).toBe(true);
    expect(component['loading']()).toBe(false);
  });

  describe('dialog open/close', () => {
    it('openCreateDialog clears editingCategory and opens the dialog', () => {
      const { component } = buildComponent();
      component['editingCategory'].set(CATEGORIES[0]);
      component['openCreateDialog']();
      expect(component['editingCategory']()).toBeNull();
      expect(component['dialogOpen']()).toBe(true);
    });

    it('openEditDialog sets editingCategory and opens the dialog', () => {
      const { component } = buildComponent();
      component['openEditDialog'](CATEGORIES[0]);
      expect(component['editingCategory']()).toEqual(CATEGORIES[0]);
      expect(component['dialogOpen']()).toBe(true);
    });
  });

  describe('onSaved', () => {
    it('prepends the new category when creating', () => {
      const { component } = buildComponent();
      component['openCreateDialog']();
      const created: Category = { id: 'c3', name: 'Nueva', color: '#000000', description: null, createdAt: '', updatedAt: '' };

      component['onSaved'](created);

      expect(component['categories']()[0]).toEqual(created);
      expect(component['categories']().length).toBe(3);
      expect(component['dialogOpen']()).toBe(false);
    });

    it('replaces the edited category in place', () => {
      const { component } = buildComponent();
      component['openEditDialog'](CATEGORIES[0]);
      const updated: Category = { ...CATEGORIES[0], name: 'Renombrada' };

      component['onSaved'](updated);

      expect(component['categories']().find((c) => c.id === 'c1')?.name).toBe('Renombrada');
      expect(component['categories']().length).toBe(2);
    });
  });

  it('onDeleted removes the category from the list', () => {
    const { component } = buildComponent();
    component['onDeleted']('c1');
    expect(component['categories']().map((c) => c.id)).toEqual(['c2']);
  });
});
