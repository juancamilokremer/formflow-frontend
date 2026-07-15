import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { StepFormSelectorComponent } from './step-form-selector.component';
import { Form } from '../../../../../forms/models/form.model';

const forms: Form[] = [
  { id: 'f1', name: 'Evaluación aspirantes', description: null, type: 'CANDIDATES', status: 'ACTIVE', version: 1, sectionCount: 2, responseCount: 0, lastResponseAt: null, createdAt: '', updatedAt: '' },
  { id: 'f2', name: 'Clima laboral', description: null, type: 'DIAGNOSTIC', status: 'ACTIVE', version: 1, sectionCount: 2, responseCount: 0, lastResponseAt: null, createdAt: '', updatedAt: '' },
  { id: 'f3', name: 'Aspirantes (borrador)', description: null, type: 'CANDIDATES', status: 'DRAFT', version: 1, sectionCount: 2, responseCount: 0, lastResponseAt: null, createdAt: '', updatedAt: '' },
];

async function create(processType: 'CANDIDATES' | 'DIAGNOSTIC' = 'CANDIDATES') {
  await TestBed.configureTestingModule({
    imports: [StepFormSelectorComponent],
    providers: [provideTranslateService({ lang: 'es' })],
  }).compileComponents();

  const fixture = TestBed.createComponent(StepFormSelectorComponent);
  fixture.componentRef.setInput('forms', forms);
  fixture.componentRef.setInput('processType', processType);
  fixture.componentRef.setInput('selectedFormId', null);
  return fixture.componentInstance;
}

describe('StepFormSelectorComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  describe('matchingForms', () => {
    it('only includes ACTIVE forms matching the processType', async () => {
      const c = await create('CANDIDATES');
      expect(c['matchingForms']().map((f) => f.id)).toEqual(['f1']);
    });

    it('returns empty when no ACTIVE form matches the type', async () => {
      const c = await create('DIAGNOSTIC');
      const forms2 = forms.filter((f) => f.id !== 'f2');
      const fixture = TestBed.createComponent(StepFormSelectorComponent);
      fixture.componentRef.setInput('forms', forms2);
      fixture.componentRef.setInput('processType', 'DIAGNOSTIC');
      expect(fixture.componentInstance['matchingForms']()).toEqual([]);
    });
  });

  describe('onChange', () => {
    it('emits formSelected when a real form id is chosen', async () => {
      const c = await create('CANDIDATES');
      let emitted: string | undefined;
      c.formSelected.subscribe((id) => (emitted = id));

      c['onChange']('f1');

      expect(emitted).toBe('f1');
    });

    it('does not emit when the placeholder (empty value) is chosen', async () => {
      const c = await create('CANDIDATES');
      let emitted: string | undefined;
      c.formSelected.subscribe((id) => (emitted = id));

      c['onChange']('');

      expect(emitted).toBeUndefined();
    });
  });
});
