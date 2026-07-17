import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { Category } from '../../../../categories/models/category.model';
import { CategoryService } from '../../../../categories/services/category.service';
import { CategorySelectorComponent } from './category-selector.component';

const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Técnicas', color: '#4F46E5', description: null, createdAt: '', updatedAt: '' },
];

const MOCK_NEW_CATEGORY: Category = {
  id: 'cat-2', name: 'Blandas', color: '#10B981', description: null, createdAt: '', updatedAt: '',
};

@Component({
  template: `<app-category-selector [selectedCategoryId]="selectedCategoryId" (categoryChange)="last = $event" />`,
  imports: [CategorySelectorComponent],
})
class HostComponent {
  selectedCategoryId: string | null = null;
  last?: string | null;
}

describe('CategorySelectorComponent', () => {
  function setup(getAll = vi.fn().mockReturnValue(of(MOCK_CATEGORIES))) {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideTranslateService({ lang: 'es' })],
    });
    TestBed.overrideProvider(CategoryService, { useValue: { getAll } });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const selectorEl = fixture.debugElement.query(By.directive(CategorySelectorComponent));
    const selector    = selectorEl.componentInstance as CategorySelectorComponent;
    return { fixture, host: fixture.componentInstance, selector };
  }

  it('loads categories from CategoryService on init', () => {
    const { selector } = setup();
    expect(selector['categories']()).toEqual(MOCK_CATEGORIES);
  });

  it('emits the selected categoryId', () => {
    const { host, selector } = setup();
    const event = { target: { value: 'cat-1' } } as unknown as Event;
    selector['onChange'](event);
    expect(host.last).toBe('cat-1');
  });

  it('emits null when "sin categoría" is selected', () => {
    const { host, selector } = setup();
    const event = { target: { value: '' } } as unknown as Event;
    selector['onChange'](event);
    expect(host.last).toBeNull();
  });

  it('opens the create-category dialog instead of emitting when "__new__" is selected', () => {
    const { host, selector } = setup();
    const event = { target: { value: '__new__' } } as unknown as Event;
    selector['onChange'](event);
    expect(selector['dialogOpen']()).toBe(true);
    expect(host.last).toBeUndefined();
  });

  it('appends the created category, closes the dialog, and emits its id', () => {
    const { host, selector } = setup();
    selector['dialogOpen'].set(true);
    selector['onCategoryCreated'](MOCK_NEW_CATEGORY);
    expect(selector['categories']()).toEqual([...MOCK_CATEGORIES, MOCK_NEW_CATEGORY]);
    expect(selector['dialogOpen']()).toBe(false);
    expect(host.last).toBe('cat-2');
  });

  it('closes the dialog on cancel without emitting', () => {
    const { host, selector } = setup();
    selector['dialogOpen'].set(true);
    selector['onDialogCancelled']();
    expect(selector['dialogOpen']()).toBe(false);
    expect(host.last).toBeUndefined();
  });
});
