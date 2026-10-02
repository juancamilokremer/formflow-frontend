import { Component, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { TabItem, TabsComponent } from '../../../shared/components/tabs/tabs.component';
import { CompanyInfoFormComponent } from './components/company-info-form/company-info-form.component';
import { PlanUsageCardComponent } from './components/plan-usage-card/plan-usage-card.component';
import { BrandingFormComponent } from './components/branding-form/branding-form.component';

type SettingsTab = 'empresa' | 'branding';

const TABS: TabItem[] = [
  { id: 'empresa', label: 'settings.tabs.empresa' },
  { id: 'branding', label: 'settings.tabs.branding' },
];

@Component({
  selector: 'app-tenant-settings',
  imports: [
    TranslatePipe, PageHeaderComponent, TabsComponent,
    CompanyInfoFormComponent, PlanUsageCardComponent, BrandingFormComponent,
  ],
  templateUrl: './tenant-settings.component.html',
  styleUrl: './tenant-settings.component.scss',
})
export class TenantSettingsComponent {
  protected readonly tabs = TABS;
  protected readonly activeTab = signal<SettingsTab>('empresa');

  protected setTab(tabId: string): void {
    this.activeTab.set(tabId as SettingsTab);
  }
}
