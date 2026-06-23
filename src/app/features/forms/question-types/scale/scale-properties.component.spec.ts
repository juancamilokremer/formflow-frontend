import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { FormQuestion } from '../../models/form.model';
import { ScalePropertiesComponent } from './scale-properties.component';

const MOCK_Q: FormQuestion = {
  id: '1', type: 'scale', title: 'Q', description: null,
  position: 0, required: false, categoryId: null,
  config: { min: 1, max: 5, minLabel: '', maxLabel: '', scoringType: 'none' },
};

describe('ScalePropertiesComponent', () => {
  let component: ScalePropertiesComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScalePropertiesComponent],
      providers: [provideTranslateService({ lang: 'es' })],
    }).compileComponents();
    const fixture = TestBed.createComponent(ScalePropertiesComponent);
    fixture.componentRef.setInput('question', MOCK_Q);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates', () => expect(component).toBeTruthy());

  it('reads scale max from config', () => {
    expect((component as any).scaleMax()).toBe(5);
  });

  it('emits config change when scale size changes', () => {
    let emitted: Partial<FormQuestion> | undefined;
    component.changed.subscribe((v) => (emitted = v));
    (component as any).onScaleSizeChange({ target: { value: '10' } } as unknown as Event);
    expect((emitted?.config as any)?.max).toBe(10);
  });
});
