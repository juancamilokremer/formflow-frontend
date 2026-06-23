import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { MultiplePropertiesComponent } from './multiple-properties.component';

const MOCK_Q = {
  id: '1', type: 'multiple' as const, title: 'Q', description: null,
  position: 0, required: false, categoryId: null,
  config: { options: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }] },
};

describe('MultiplePropertiesComponent', () => {
  let component: MultiplePropertiesComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiplePropertiesComponent],
      providers: [provideTranslateService({ lang: 'es' })],
    }).compileComponents();
    const fixture = TestBed.createComponent(MultiplePropertiesComponent);
    fixture.componentRef.setInput('question', MOCK_Q);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates', () => expect(component).toBeTruthy());

  it('loads 2 options from config', () => {
    expect((component as any).localOptions()).toHaveSize(2);
  });

  it('removes an option and emits', () => {
    const spy = spyOn(component.changed, 'emit');
    (component as any).removeOption('a');
    expect((component as any).localOptions()).toHaveSize(1);
    expect(spy).toHaveBeenCalled();
  });
});
