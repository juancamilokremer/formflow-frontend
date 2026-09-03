import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { PropertiesPanelComponent } from './properties-panel.component';
import { FormQuestion } from '../../../../models/form.model';

const MOCK_QUESTION: FormQuestion = {
  id: 'q1', type: 'text', title: 'Q', description: null,
  position: 0, required: false, categoryId: null, config: {},
};

describe('PropertiesPanelComponent', () => {
  it('should instantiate', async () => {
    await TestBed.configureTestingModule({
      imports: [PropertiesPanelComponent],
      providers: [provideTranslateService({ lang: 'es' })],
    }).compileComponents();
    const fixture = TestBed.createComponent(PropertiesPanelComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('propagates the locked input to the dynamically created properties component', async () => {
    await TestBed.configureTestingModule({
      imports: [PropertiesPanelComponent],
      providers: [provideTranslateService({ lang: 'es' })],
    }).compileComponents();
    const fixture = TestBed.createComponent(PropertiesPanelComponent);
    fixture.componentRef.setInput('question', MOCK_QUESTION);
    fixture.componentRef.setInput('locked', true);
    fixture.detectChanges();

    const compRef = (fixture.componentInstance as any).compRef;
    expect(compRef.instance.locked()).toBe(true);
  });
});
