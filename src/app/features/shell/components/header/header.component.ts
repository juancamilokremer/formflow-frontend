import { Component, HostListener, inject, output, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { filter, map, startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../../core/auth/auth.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { EmailVerificationBannerComponent } from '../../../../shared/components/email-verification-banner/email-verification-banner.component';
import { IconComponent } from '../../../../shared/icons/icon.component';

@Component({
  selector: 'app-header',
  imports: [TranslatePipe, IconComponent, ButtonComponent, EmailVerificationBannerComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  protected readonly authService = inject(AuthService);

  readonly menuToggled = output<void>();

  protected readonly userMenuOpen = signal(false);

  protected readonly titleKey = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      startWith(null),
      map(() => this.getDeepestTitleKey()),
    ),
    { initialValue: '' },
  );

  protected get userInitials(): string {
    const user = this.authService.currentUser();
    if (!user) return '';
    return `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();
  }

  protected toggleUserMenu(): void {
    this.userMenuOpen.update((v) => !v);
  }

  protected closeUserMenu(): void {
    this.userMenuOpen.set(false);
  }

  protected logout(): void {
    this.userMenuOpen.set(false);
    this.authService.logout();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.header__user-menu')) {
      this.userMenuOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.userMenuOpen.set(false);
  }

  private getDeepestTitleKey(): string {
    let route = this.activatedRoute;
    while (route.firstChild) route = route.firstChild;
    return route.snapshot.data['titleKey'] ?? '';
  }
}
