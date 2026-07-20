import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideTranslateService } from '@ngx-translate/core';
import { Category } from '../../../../../core/models/category.model';
import { CategorySelectorComponent } from './category-selector.component';

const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Técnicas', color: '#4F46E5', description: null, createdAt: '', updatedAt: '' },
];

const MOCK_NEW_CATEGORY: Category = {
  id: 'cat-2', name: 'Blandas', color: '#10B981', description: null, createdAt: '', updatedAt: '',
};

@Component({
  template: `<app-category-selector [categories]="categories" [selectedCategoryId]="selectedCategoryId" (categoryChange)="lastChange = $event" (categoryCreated)="lastCreated = $event" />`,
  imports: [CategorySelectorComponent],
})
class HostComponent {
  categories: Category[] = MOCK_CATEGORIES;
  selectedCategoryId: string | null = null;
  lastChange?: string | null;
  lastCreated?: Category;
}

describe('CategorySelectorComponent', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideTranslateService({ lang: 'es' })],
    });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const selectorEl = fixture.debugElement.query(By.directive(CategorySelectorComponent));
    const selector    = selectorEl.componentInstance as CategorySelectorComponent;
    return { fixture, host: fixture.componentInstance, selector };
  }

  it('emits the selected categoryId', () => {
    const { host, selector } = setup();
    const event = { target: { value: 'cat-1' } } as unknown as Event;
    selector['onChange'](event);
    expect(host.lastChange).toBe('cat-1');
  });

  it('emits null when "sin categoría" is selected', () => {
    const { host, selector } = setup();
    const event = { target: { value: '' } } as unknown as Event;
    selector['onChange'](event);
    expect(host.lastChange).toBeNull();
  });

  it('opens the create-category dialog instead of emitting when "__new__" is selected', () => {
    const { host, selector } = setup();
    const event = { target: { value: '__new__' } } as unknown as Event;
    selector['onChange'](event);
    expect(selector['dialogOpen']()).toBe(true);
    expect(host.lastChange).toBeUndefined();
  });

  it('closes the dialog and emits categoryCreated + categoryChange when a category is created', () => {
    const { host, selector } = setup();
    selector['dialogOpen'].set(true);
    selector['onCategoryCreated'](MOCK_NEW_CATEGORY);
    expect(selector['dialogOpen']()).toBe(false);
    expect(host.lastCreated).toEqual(MOCK_NEW_CATEGORY);
    expect(host.lastChange).toBe('cat-2');
  });

  it('closes the dialog on cancel without emitting', () => {
    const { host, selector } = setup();
    selector['dialogOpen'].set(true);
    selector['onDialogCancelled']();
    expect(selector['dialogOpen']()).toBe(false);
    expect(host.lastChange).toBeUndefined();
    expect(host.lastCreated).toBeUndefined();
  });
});
