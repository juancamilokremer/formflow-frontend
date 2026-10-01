import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideTranslateService } from '@ngx-translate/core';
import { BrandingFormComponent } from './branding-form.component';
import { TenantSettingsService } from '../../services/tenant-settings.service';
import { Branding } from '../../../../../core/models/tenant.model';

const BRANDING: Branding = {
  tenantName: 'Empresa ABC',
  logoUrl: 'http://x/logo.png',
  primaryColor: '#111111',
  secondaryColor: '#222222',
  faviconUrl: null,
};

describe('BrandingFormComponent', () => {
  let component: BrandingFormComponent;
  let fixture: ComponentFixture<BrandingFormComponent>;
  let mockService: { getBranding: ReturnType<typeof vi.fn>; updateBranding: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockService = {
      getBranding: vi.fn().mockReturnValue(of(BRANDING)),
      updateBranding: vi.fn().mockReturnValue(of({ ...BRANDING, primaryColor: '#333333' })),
    };

    await TestBed.configureTestingModule({
      imports: [BrandingFormComponent],
      providers: [
        provideTranslateService({ lang: 'es' }),
        { provide: TenantSettingsService, useValue: mockService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BrandingFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads the branding and populates the color form', () => {
    expect(mockService.getBranding).toHaveBeenCalledTimes(1);
    expect(component['form'].getRawValue()).toEqual({ primaryColor: '#111111', secondaryColor: '#222222' });
  });

  it('does not call updateBranding when nothing changed', () => {
    (component as any).save();
    expect(mockService.updateBranding).not.toHaveBeenCalled();
  });

  it('calls updateBranding with the current name and the new colors when changed', () => {
    component['form'].setValue({ primaryColor: '#333333', secondaryColor: '#222222' });

    (component as any).save();

    expect(mockService.updateBranding).toHaveBeenCalledWith({
      name: 'Empresa ABC',
      primaryColor: '#333333',
      secondaryColor: '#222222',
    });
  });

  it('updates the debounced preview colors 300ms after a form change', () => {
    vi.useFakeTimers();
    component['form'].setValue({ primaryColor: '#abcabc', secondaryColor: '#222222' });

    expect(component['previewColors']().primaryColor).toBe('#111111');

    vi.advanceTimersByTime(300);

    expect(component['previewColors']().primaryColor).toBe('#abcabc');
    vi.useRealTimers();
  });

  it('refreshes branding state when the logo changes', () => {
    const updated = { ...BRANDING, logoUrl: 'http://x/new-logo.png' };
    (component as any).onLogoChanged(updated);
    expect(component['branding']()).toEqual(updated);
  });
});
