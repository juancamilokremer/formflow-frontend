import { SectionCardComponent } from './section-card.component';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { Category } from '../../../../../../core/models/category.model';
import { FormQuestion, FormSection } from '../../../../models/form.model';

const MOCK_SECTION: FormSection = {
  id: 's1',
  title: 'Datos personales',
  position: 1,
  questions: [],
};

const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Técnicas', color: '#4F46E5', description: null, createdAt: '', updatedAt: '' },
];

const MOCK_QUESTION: FormQuestion = {
  id: 'q1', type: 'single', title: 'Q', description: null,
  position: 0, required: false, categoryId: 'cat-1', config: {},
};

describe('SectionCardComponent', () => {
  let fixture: ComponentFixture<SectionCardComponent>;
  let component: SectionCardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionCardComponent],
      providers: [
        provideRouter([]),
        provideTranslateService({ lang: 'es' }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionCardComponent);
    fixture.componentRef.setInput('section', MOCK_SECTION);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('startEdit sets isEditing to true and copies title', () => {
    (component as any).startEdit();
    expect((component as any).isEditing()).toBe(true);
    expect((component as any).editTitle()).toBe('Datos personales');
  });

  it('cancelEdit sets isEditing to false', () => {
    (component as any).startEdit();
    (component as any).cancelEdit();
    expect((component as any).isEditing()).toBe(false);
  });

  it('saveEdit emits sectionUpdated when title changed', () => {
    let emitted: { id: string; title: string } | undefined;
    component.sectionUpdated.subscribe((v) => (emitted = v));

    (component as any).saveEdit('Nuevo título');

    expect(emitted).toEqual({ id: 's1', title: 'Nuevo título' });
    expect((component as any).isEditing()).toBe(false);
  });

  it('saveEdit does not emit when title is unchanged', () => {
    let emitted: unknown;
    component.sectionUpdated.subscribe((v) => (emitted = v));

    (component as any).saveEdit('Datos personales');

    expect(emitted).toBeUndefined();
  });

  it('saveEdit does not emit when title is blank', () => {
    let emitted: unknown;
    component.sectionUpdated.subscribe((v) => (emitted = v));

    (component as any).saveEdit('   ');

    expect(emitted).toBeUndefined();
  });

  it('confirmDelete shows confirm dialog', () => {
    (component as any).confirmDelete();
    expect((component as any).showDeleteConfirm()).toBe(true);
  });

  it('cancelDelete hides confirm dialog', () => {
    (component as any).confirmDelete();
    (component as any).cancelDelete();
    expect((component as any).showDeleteConfirm()).toBe(false);
  });

  it('doDelete emits sectionDeleted with section id', () => {
    let emitted: string | undefined;
    component.sectionDeleted.subscribe((v) => (emitted = v));

    (component as any).doDelete();

    expect(emitted).toBe('s1');
    expect((component as any).showDeleteConfirm()).toBe(false);
  });

  it('onTitleKeydown Enter calls blur on input', () => {
    const input = document.createElement('input');
    const blurSpy = vi.spyOn(input, 'blur');
    (component as any).onTitleKeydown({ key: 'Enter', target: input } as unknown as KeyboardEvent);
    expect(blurSpy).toHaveBeenCalled();
  });

  it('onTitleKeydown Escape cancels edit', () => {
    (component as any).isEditing.set(true);
    const input = document.createElement('input');
    (component as any).onTitleKeydown({ key: 'Escape', target: input } as unknown as KeyboardEvent);
    expect((component as any).isEditing()).toBe(false);
  });

  it('categoryFor returns the matching category', () => {
    fixture.componentRef.setInput('categories', MOCK_CATEGORIES);
    expect((component as any).categoryFor(MOCK_QUESTION)).toEqual(MOCK_CATEGORIES[0]);
  });

  it('categoryFor returns undefined when the question has no categoryId', () => {
    fixture.componentRef.setInput('categories', MOCK_CATEGORIES);
    expect((component as any).categoryFor({ ...MOCK_QUESTION, categoryId: null })).toBeUndefined();
  });

  it('categoryFor returns undefined when no category matches', () => {
    fixture.componentRef.setInput('categories', []);
    expect((component as any).categoryFor(MOCK_QUESTION)).toBeUndefined();
  });
});
