import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { OnboardingResumeBannerComponent } from './onboarding-resume-banner.component';
import { StorageService } from '../../../../core/storage/storage.service';
import { StorageKeys } from '../../../../core/storage/storage-keys.constants';

describe('OnboardingResumeBannerComponent', () => {
  let fixture: ComponentFixture<OnboardingResumeBannerComponent>;

  function setup(storedValue: boolean | null) {
    const mockStorageService = { get: vi.fn().mockReturnValue(storedValue) };
    TestBed.configureTestingModule({
      imports: [OnboardingResumeBannerComponent],
      providers: [
        provideRouter([]),
        provideTranslateService({ lang: 'es' }),
        { provide: StorageService, useValue: mockStorageService },
      ],
    });
    fixture = TestBed.createComponent(OnboardingResumeBannerComponent);
    return mockStorageService;
  }

  it('is visible when onboarding is pending (flag === false)', () => {
    setup(false);
    expect(fixture.componentInstance['visible']).toBe(true);
  });

  it('is hidden when the flag is absent (pre-existing account)', () => {
    setup(null);
    expect(fixture.componentInstance['visible']).toBe(false);
  });

  it('is hidden when onboarding is already done', () => {
    const mockStorageService = setup(true);
    expect(fixture.componentInstance['visible']).toBe(false);
    expect(mockStorageService.get).toHaveBeenCalledWith(StorageKeys.ONBOARDING_DONE);
  });
});
