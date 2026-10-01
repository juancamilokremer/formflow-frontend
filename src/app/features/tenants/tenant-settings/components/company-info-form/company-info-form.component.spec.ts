import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { CompanyInfoFormComponent } from './company-info-form.component';
import { TenantSettingsService } from '../../services/tenant-settings.service';
import { Plan, Tenant } from '../../../../../core/models/tenant.model';

const TENANT: Tenant = {
  id: 't1',
  name: 'Empresa ABC',
  slug: 'empresa-abc',
  plan: Plan.FREE,
  logoUrl: 'http://x/logo.png',
  primaryColor: '#111111',
  secondaryColor: '#222222',
};

describe('CompanyInfoFormComponent', () => {
  let component: CompanyInfoFormComponent;
  let fixture: ComponentFixture<CompanyInfoFormComponent>;
  let mockService: { getTenant: ReturnType<typeof vi.fn>; updateTenant: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockService = {
      getTenant: vi.fn().mockReturnValue(of(TENANT)),
      updateTenant: vi.fn().mockReturnValue(of({ ...TENANT, name: 'Nuevo nombre' })),
    };

    await TestBed.configureTestingModule({
      imports: [CompanyInfoFormComponent],
      providers: [
        provideTranslateService({ lang: 'es' }),
        provideRouter([]),
        { provide: TenantSettingsService, useValue: mockService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyInfoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // triggers ngOnInit -> getTenant()
  });

  it('loads the tenant and populates the form', () => {
    expect(mockService.getTenant).toHaveBeenCalledTimes(1);
    expect(component['form'].getRawValue().name).toBe('Empresa ABC');
    expect(component['loading']()).toBe(false);
  });

  it('does not call updateTenant when the name has not changed', () => {
    (component as any).save();
    expect(mockService.updateTenant).not.toHaveBeenCalled();
  });

  it('calls updateTenant with the full current logo/colors when the name changed', () => {
    component['form'].setValue({ name: 'Nuevo nombre' });

    (component as any).save();

    expect(mockService.updateTenant).toHaveBeenCalledWith({
      name: 'Nuevo nombre',
      logoUrl: 'http://x/logo.png',
      primaryColor: '#111111',
      secondaryColor: '#222222',
    });
  });

  it('shows the success message after saving and clears it afterwards', () => {
    vi.useFakeTimers();
    component['form'].setValue({ name: 'Nuevo nombre' });

    (component as any).save();

    expect(component['saved']()).toBe(true);
    vi.advanceTimersByTime(3000);
    expect(component['saved']()).toBe(false);
    vi.useRealTimers();
  });
});
