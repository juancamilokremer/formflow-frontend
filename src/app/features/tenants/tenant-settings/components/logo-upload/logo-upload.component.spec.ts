import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideTranslateService } from '@ngx-translate/core';
import { LogoUploadComponent } from './logo-upload.component';
import { TenantSettingsService } from '../../services/tenant-settings.service';
import { Branding } from '../../../../../core/models/tenant.model';

const BRANDING: Branding = {
  tenantName: 'Empresa ABC',
  logoUrl: 'http://x/logo.png',
  primaryColor: '#111111',
  secondaryColor: '#222222',
  faviconUrl: null,
};

describe('LogoUploadComponent', () => {
  let component: LogoUploadComponent;
  let fixture: ComponentFixture<LogoUploadComponent>;
  let mockService: { uploadLogo: ReturnType<typeof vi.fn>; deleteLogo: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockService = {
      uploadLogo: vi.fn().mockReturnValue(of(BRANDING)),
      deleteLogo: vi.fn().mockReturnValue(of({ ...BRANDING, logoUrl: null })),
    };

    await TestBed.configureTestingModule({
      imports: [LogoUploadComponent],
      providers: [
        provideTranslateService({ lang: 'es' }),
        { provide: TenantSettingsService, useValue: mockService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LogoUploadComponent);
    component = fixture.componentInstance;
  });

  function file(type: string, sizeBytes: number): File {
    return new File([new Uint8Array(sizeBytes)], 'logo.png', { type });
  }

  describe('validateFile', () => {
    it('accepts an allowed type under the size limit', () => {
      expect((component as any).validateFile(file('image/png', 500_000))).toBeNull();
    });

    it('rejects a disallowed type', () => {
      expect((component as any).validateFile(file('image/gif', 500))).toBe('settings.branding.logo.error_type');
    });

    it('rejects a file over 2MB', () => {
      expect((component as any).validateFile(file('image/png', 3 * 1024 * 1024))).toBe(
        'settings.branding.logo.error_size',
      );
    });
  });

  describe('upload', () => {
    it('does nothing when no file is staged', () => {
      (component as any).upload();
      expect(mockService.uploadLogo).not.toHaveBeenCalled();
    });

    it('uploads the staged file and emits the updated branding', () => {
      let emitted: Branding | undefined;
      component.brandingChanged.subscribe((b) => (emitted = b));

      (component as any).stageFile(file('image/png', 500));
      (component as any).upload();

      expect(mockService.uploadLogo).toHaveBeenCalledTimes(1);
      expect(emitted).toEqual(BRANDING);
      expect((component as any).stagedPreview()).toBeNull();
    });
  });

  describe('confirmDelete', () => {
    it('deletes the logo and emits the updated branding', () => {
      let emitted: Branding | undefined;
      component.brandingChanged.subscribe((b) => (emitted = b));

      (component as any).confirmDelete();

      expect(mockService.deleteLogo).toHaveBeenCalledTimes(1);
      expect(emitted?.logoUrl).toBeNull();
      expect((component as any).confirmingDelete()).toBe(false);
    });
  });
});
