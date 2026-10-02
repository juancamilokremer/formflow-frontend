import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-user-avatar',
  templateUrl: './user-avatar.component.html',
  styleUrl: './user-avatar.component.scss',
})
export class UserAvatarComponent {
  readonly firstName = input.required<string>();
  readonly lastName = input.required<string>();
  readonly avatarUrl = input<string | null>(null);
  readonly size = input(32);

  protected readonly initials = computed(() => {
    const first = this.firstName().trim().charAt(0);
    const last = this.lastName().trim().charAt(0);
    return (first + last).toUpperCase();
  });
}
