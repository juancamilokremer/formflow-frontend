import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { LowerCasePipe } from '@angular/common';
import { ButtonComponent } from '../../../../../../shared/components/button/button.component';
import { RouteConstants } from '../../../../../../core/constants/route.constants';
import { FormDetail } from '../../../../models/form.model';

@Component({
  selector: 'app-builder-topbar',
  imports: [TranslatePipe, LowerCasePipe, RouterLink, ButtonComponent],
  templateUrl: './builder-topbar.component.html',
  styleUrl: './builder-topbar.component.scss',
})
export class BuilderTopbarComponent {
  readonly form = input.required<FormDetail>();

  readonly nameChanged = output<string>();
  readonly publishClicked = output<void>();

  protected readonly formsRoute = `/${RouteConstants.FORMS}`;

  protected onNameBlur(event: FocusEvent): void {
    const name = (event.target as HTMLInputElement).value.trim();
    if (name && name !== this.form().name) {
      this.nameChanged.emit(name);
    }
  }

  protected onNameKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      (event.target as HTMLInputElement).blur();
    }
    if (event.key === 'Escape') {
      (event.target as HTMLInputElement).value = this.form().name;
      (event.target as HTMLInputElement).blur();
    }
  }
}
