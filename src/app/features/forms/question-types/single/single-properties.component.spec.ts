import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { SinglePropertiesComponent } from './single-properties.component';

const MOCK_Q = {
  id: '1', type: 'single' as const, title: 'Q', description: null,
  position: 0, required: false, categoryId: null,
  config: { options: [{ id: 'a', label: 'Opción A' }] },
};

describe('SinglePropertiesComponent', () => {
  let component: SinglePropertiesComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SinglePropertiesComponent],
      providers: [provideTranslateService({ lang: 'es' })],
    }).compileComponents();
    const fixture = TestBed.createComponent(SinglePropertiesComponent);
    fixture.componentRef.setInput('question', MOCK_Q);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates', () => expect(component).toBeTruthy());

  it('loads options from question config', () => {
    expect((component as any).localOptions()).toHaveSize(1);
  });

  it('adds an option', () => {
    (component as any).addOption();
    expect((component as any).localOptions()).toHaveSize(2);
  });

  it('removes an option and emits config change', () => {
    const spy = spyOn(component.changed, 'emit');
    (component as any).removeOption('a');
    expect((component as any).localOptions()).toHaveSize(0);
    expect(spy).toHaveBeenCalled();
  });
});
