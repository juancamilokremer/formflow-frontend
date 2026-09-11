import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '../../icons/icon.component';

export interface TabItem {
  id: string;
  label: string;
  badge?: 'complete' | 'pending';
}

@Component({
  selector: 'app-tabs',
  imports: [TranslatePipe, IconComponent],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss',
})
export class TabsComponent {
  readonly tabs = input.required<TabItem[]>();
  readonly activeTabId = input.required<string>();

  readonly tabChange = output<string>();

  protected onTabClick(tabId: string): void {
    if (tabId === this.activeTabId()) return;
    this.tabChange.emit(tabId);
  }
}
