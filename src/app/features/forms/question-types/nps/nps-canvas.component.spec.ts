import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { FormQuestion } from '../../models/form.model';
import { NpsCanvasComponent } from './nps-canvas.component';

const MOCK_Q: FormQuestion = {
  id: '1', type: 'nps', title: 'NPS', description: null,
  position: 0, required: false, categoryId: null,
  config: { minLabel: 'Nada probable', maxLabel: 'Muy probable' },
};

describe('NpsCanvasComponent', () => {
  let component: NpsCanvasComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NpsCanvasComponent],
      providers: [provideTranslateService({ lang: 'es' })],
    }).compileComponents();
    const fixture = TestBed.createComponent(NpsCanvasComponent);
    fixture.componentRef.setInput('question', MOCK_Q);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates', () => expect(component).toBeTruthy());

  it('exposes scores 0-10', () => {
    expect((component as any).scores).toHaveLength(11);
    expect((component as any).scores[0]).toBe(0);
    expect((component as any).scores[10]).toBe(10);
  });

  it('assigns detractor class for 0-6', () => {
    for (let i = 0; i <= 6; i++) {
      expect((component as any).zoneClass(i)).toBe('nps-btn--detractor');
    }
  });

  it('assigns passive class for 7-8', () => {
    expect((component as any).zoneClass(7)).toBe('nps-btn--passive');
    expect((component as any).zoneClass(8)).toBe('nps-btn--passive');
  });

  it('assigns promoter class for 9-10', () => {
    expect((component as any).zoneClass(9)).toBe('nps-btn--promoter');
    expect((component as any).zoneClass(10)).toBe('nps-btn--promoter');
  });

  it('reads minLabel and maxLabel from config', () => {
    expect((component as any).minLabel()).toBe('Nada probable');
    expect((component as any).maxLabel()).toBe('Muy probable');
  });
});
