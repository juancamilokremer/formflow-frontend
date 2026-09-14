import { Component, inject, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { convocatoriaNewPath, encuestaNewPath } from '../../../../core/constants/route.constants';
import { FormType } from '../../models/form.model';

interface FormTypeOption {
  value: FormType;
  labelKey: string;
  descKey: string;
}

const FORM_TYPE_OPTIONS: FormTypeOption[] = [
  { value: 'CANDIDATES', labelKey: 'forms.type.candidates', descKey: 'forms.type.candidates_desc' },
  { value: 'DIAGNOSTIC', labelKey: 'forms.type.diagnostic', descKey: 'forms.type.diagnostic_desc' },
  { value: 'REGISTRATION', labelKey: 'forms.type.registration', descKey: 'forms.type.registration_desc' },
];

@Component({
  selector: 'app-create-form-dialog',
  imports: [DialogComponent, ButtonComponent, TranslatePipe],
  templateUrl: './create-form-dialog.component.html',
  styleUrl: './create-form-dialog.component.scss',
})
export class CreateFormDialogComponent {
  private readonly router = inject(Router);

  readonly isOpen = input(false);
  readonly cancelled = output<void>();

  protected readonly name = signal('');
  protected readonly type = signal<FormType>('CANDIDATES');
  protected readonly formTypeOptions = FORM_TYPE_OPTIONS;

  protected selectType(t: FormType): void {
    this.type.set(t);
  }

  protected submit(): void {
    const trimmed = this.name().trim();
    if (!trimmed) return;
    if (this.type() === 'REGISTRATION') {
      this.router.navigate(encuestaNewPath(), { queryParams: { name: trimmed } });
    } else {
      this.router.navigate(convocatoriaNewPath(), { queryParams: { name: trimmed, type: this.type() } });
    }
    this.reset();
  }

  protected cancel(): void {
    this.reset();
    this.cancelled.emit();
  }

  private reset(): void {
    this.name.set('');
    this.type.set('CANDIDATES');
  }
}
