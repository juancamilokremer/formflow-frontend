import { Component, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { AvatarUploadComponent } from './components/avatar-upload/avatar-upload.component';
import { ProfileFormComponent } from './components/profile-form/profile-form.component';
import { SecurityTabComponent } from './components/security-tab/security-tab.component';
import { AccountService } from './services/account.service';
import { AuthService } from '../../core/auth/auth.service';
import { Me } from './models/account.model';

@Component({
  selector: 'app-account',
  imports: [
    TranslatePipe, PageHeaderComponent, CardComponent,
    AvatarUploadComponent, ProfileFormComponent, SecurityTabComponent,
  ],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
})
export class AccountComponent {
  private readonly accountService = inject(AccountService);
  private readonly authService = inject(AuthService);

  protected readonly loading = signal(true);
  protected readonly me = signal<Me | null>(null);

  constructor() {
    this.accountService.getMe().subscribe({
      next: (me) => {
        this.me.set(me);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected onProfileChanged(me: Me): void {
    this.me.set(me);
    this.reflectInHeader({ firstName: me.firstName, lastName: me.lastName });
  }

  protected onAvatarChanged(avatarUrl: string | null): void {
    this.me.update((current) => (current ? { ...current, avatarUrl } : current));
  }

  /** So the header's name/initials update immediately, without waiting for the next
   *  token refresh — same reasoning as AuthService.markEmailVerified(). AvatarUploadComponent
   *  does its own equivalent sync for avatarUrl internally. */
  private reflectInHeader(patch: { firstName: string; lastName: string }): void {
    const user = this.authService.currentUser();
    if (user) {
      this.authService.currentUser.set({ ...user, ...patch });
    }
  }
}
