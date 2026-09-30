import { TenantSettingsComponent } from './tenant-settings.component';

describe('TenantSettingsComponent', () => {
  let component: TenantSettingsComponent;

  beforeEach(() => {
    component = new TenantSettingsComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('starts on the empresa tab', () => {
    expect(component['activeTab']()).toBe('empresa');
  });

  it('switches tabs', () => {
    component['setTab']('branding');
    expect(component['activeTab']()).toBe('branding');
  });
});
