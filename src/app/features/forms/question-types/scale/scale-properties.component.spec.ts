import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { ScalePropertiesComponent } from './scale-properties.component';

const MOCK_Q = {
  id: '1', type: 'scale' as const, title: 'Q', description: null,
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
    const spy = spyOn(component.changed, 'emit');
    (component as any).onScaleSizeChange({ target: { value: '10' } } as unknown as Event);
    expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({ config: jasmine.objectContaining({ max: 10 }) }));
  });
});
