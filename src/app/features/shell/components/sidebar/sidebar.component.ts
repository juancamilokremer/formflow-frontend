import { Component, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../../core/auth/auth.service';
import { RouteConstants } from '../../../../core/constants/route.constants';
import { IconComponent } from '../../../../shared/icons/icon.component';
import { IconName } from '../../../../shared/icons/icon.registry';

interface NavItem {
  labelKey: string;
  icon: IconName;
  route: string;
}

const NAV_ITEMS: NavItem[] = [
  { labelKey: 'shell.nav.dashboard', icon: 'home', route: RouteConstants.DASHBOARD },
  { labelKey: 'shell.nav.forms', icon: 'file-text', route: RouteConstants.FORMS },
  { labelKey: 'shell.nav.convocatorias', icon: 'megaphone', route: RouteConstants.CONVOCATORIAS },
  { labelKey: 'shell.nav.users', icon: 'users', route: RouteConstants.USERS },
  { labelKey: 'shell.nav.settings', icon: 'settings', route: RouteConstants.SETTINGS },
  { labelKey: 'shell.nav.billing', icon: 'credit-card', route: RouteConstants.BILLING },
];

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, TranslatePipe, IconComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  protected readonly authService = inject(AuthService);

  readonly open = input(false);
  readonly closeRequested = output<void>();

  protected readonly navItems = NAV_ITEMS;

  protected get userInitials(): string {
    const user = this.authService.currentUser();
    if (!user) return '';
    return `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();
  }

  protected get userFullName(): string {
    const user = this.authService.currentUser();
    if (!user) return '';
    return `${user.firstName} ${user.lastName}`.trim();
  }

  protected logout(): void {
    this.authService.logout();
  }
}
