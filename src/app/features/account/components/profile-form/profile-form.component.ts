import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { AccountService } from '../../services/account.service';
import { Me } from '../../models/account.model';

@Component({
  selector: 'app-profile-form',
  imports: [ReactiveFormsModule, TranslatePipe, InputComponent, ButtonComponent, CardComponent],
  templateUrl: './profile-form.component.html',
  styleUrl: './profile-form.component.scss',
})
export class ProfileFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly accountService = inject(AccountService);

  readonly me = input.required<Me | null>();
  readonly profileChanged = output<Me>();

  protected readonly saving = signal(false);
  protected readonly saved = signal(false);
  protected readonly errorKey = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
  });

  constructor() {
    effect(() => {
      const me = this.me();
      if (me) this.form.setValue({ firstName: me.firstName, lastName: me.lastName });
    });
  }

  protected save(): void {
    const current = this.me();
    const { firstName, lastName } = this.form.getRawValue();
    if (!current || this.form.invalid) return;
    if (firstName === current.firstName && lastName === current.lastName) return;

    this.saving.set(true);
    this.saved.set(false);
    this.errorKey.set(null);

    this.accountService.updateMe({ firstName, lastName }).subscribe({
      next: (me) => {
        this.saving.set(false);
        this.saved.set(true);
        this.profileChanged.emit(me);
        setTimeout(() => this.saved.set(false), 3000);
      },
      error: () => {
        this.saving.set(false);
        this.errorKey.set('account.profile.save_error');
      },
    });
  }
}
