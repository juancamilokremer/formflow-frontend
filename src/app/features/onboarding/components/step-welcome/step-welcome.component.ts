import { Component, inject, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../../core/auth/auth.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { IconComponent } from '../../../../shared/icons/icon.component';

@Component({
  selector: 'app-step-welcome',
  imports: [TranslatePipe, ButtonComponent, IconComponent],
  templateUrl: './step-welcome.component.html',
  styleUrl: './step-welcome.component.scss',
})
export class StepWelcomeComponent {
  protected readonly authService = inject(AuthService);

  readonly continued = output<void>();

  protected onContinue(): void {
    this.continued.emit();
  }
}
