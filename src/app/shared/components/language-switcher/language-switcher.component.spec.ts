import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { LanguageSwitcherComponent } from './language-switcher.component';

describe('LanguageSwitcherComponent', () => {
  let component: LanguageSwitcherComponent;
  let fixture: ComponentFixture<LanguageSwitcherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LanguageSwitcherComponent],
      providers: [provideTranslateService({ lang: 'es' })],
    }).compileComponents();

    fixture = TestBed.createComponent(LanguageSwitcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('exposes supported languages', () => {
    expect((component as any).langs).toContain('es');
    expect((component as any).langs).toContain('en');
  });

  it('returns current language', () => {
    expect((component as any).current).toBe('es');
  });

  it('switches language', () => {
    (component as any).switch('en');
    expect((component as any).current).toBe('en');
  });

  it('does not switch when same language', () => {
    const translateService = (component as any).translate;
    let callCount = 0;
    const original = translateService.use.bind(translateService);
    translateService.use = (lang: string) => { callCount++; return original(lang); };
    (component as any).switch('es');
    expect(callCount).toBe(0);
  });
});
