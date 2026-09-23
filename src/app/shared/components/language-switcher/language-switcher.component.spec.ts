import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { LanguageSwitcherComponent } from './language-switcher.component';
import { StorageService } from '../../../core/storage/storage.service';
import { StorageKeys } from '../../../core/storage/storage-keys.constants';

describe('LanguageSwitcherComponent', () => {
  let component: LanguageSwitcherComponent;
  let fixture: ComponentFixture<LanguageSwitcherComponent>;
  let mockStorage: { set: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockStorage = { set: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [LanguageSwitcherComponent],
      providers: [
        provideTranslateService({ lang: 'es' }),
        { provide: StorageService, useValue: mockStorage },
      ],
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

  it('persists the selection', () => {
    (component as any).switch('en');
    expect(mockStorage.set).toHaveBeenCalledWith(StorageKeys.LANGUAGE, 'en');
  });

  it('does not persist when switching to the same language', () => {
    (component as any).switch('es');
    expect(mockStorage.set).not.toHaveBeenCalled();
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
