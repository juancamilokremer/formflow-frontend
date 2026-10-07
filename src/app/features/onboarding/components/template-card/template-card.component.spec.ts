import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { TemplateCardComponent } from './template-card.component';
import { ONBOARDING_TEMPLATES } from '../../models/onboarding.model';

describe('TemplateCardComponent', () => {
  let component: TemplateCardComponent;
  let fixture: ComponentFixture<TemplateCardComponent>;

  function setup() {
    TestBed.configureTestingModule({
      imports: [TemplateCardComponent],
      providers: [provideTranslateService({ lang: 'es' })],
    });
    fixture = TestBed.createComponent(TemplateCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('template', ONBOARDING_TEMPLATES[0]);
  }

  it('maps each process type to an icon', () => {
    setup();
    expect(component['icon']()).toBe('users'); // CANDIDATES

    fixture.componentRef.setInput('template', ONBOARDING_TEMPLATES[1]); // DIAGNOSTIC
    expect(component['icon']()).toBe('bar-chart-2');

    fixture.componentRef.setInput('template', ONBOARDING_TEMPLATES[2]); // REGISTRATION
    expect(component['icon']()).toBe('clipboard');
  });

  it('emits selected on onSelect()', () => {
    setup();
    let emitted = false;
    component.selected.subscribe(() => (emitted = true));
    component['onSelect']();
    expect(emitted).toBe(true);
  });
});
