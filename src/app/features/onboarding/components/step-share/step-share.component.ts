import { Component, inject, input, output, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { StorageService } from '../../../../core/storage/storage.service';
import { StorageKeys } from '../../../../core/storage/storage-keys.constants';
import {
  RouteConstants,
  convocatoriaNewPath,
  encuestaNewPath,
  formBuilderPath,
} from '../../../../core/constants/route.constants';
import { CreatedOnboardingForm } from '../../models/onboarding.model';

@Component({
  selector: 'app-step-share',
  imports: [TranslatePipe, ButtonComponent],
  templateUrl: './step-share.component.html',
  styleUrl: './step-share.component.scss',
})
export class StepShareComponent {
  private readonly storageService = inject(StorageService);

  readonly createdForm = input.required<CreatedOnboardingForm>();

  readonly doneAndNavigate = output<string[]>();

  protected readonly linkCopied = signal(false);
  protected readonly isEncuesta = () => this.createdForm().containerKind === 'encuestas';

  protected readonly anonymousLink = () =>
    `${window.location.origin}/${RouteConstants.FORMS}/${this.createdForm().formId}/${RouteConstants.FORM_RESPOND}`;

  protected copyLink(): void {
    navigator.clipboard.writeText(this.anonymousLink()).then(() => {
      this.linkCopied.set(true);
      setTimeout(() => this.linkCopied.set(false), 2000);
    });
  }

  protected goToBuilder(): void {
    const { containerKind, containerId, formId } = this.createdForm();
    this.finishAndNavigate(formBuilderPath(containerKind, containerId, formId));
  }

  protected createAnother(): void {
    this.finishAndNavigate(this.isEncuesta() ? encuestaNewPath() : convocatoriaNewPath());
  }

  protected goToDashboard(): void {
    this.finishAndNavigate(['/', RouteConstants.DASHBOARD]);
  }

  private finishAndNavigate(path: string[]): void {
    this.storageService.set(StorageKeys.ONBOARDING_DONE, true);
    this.doneAndNavigate.emit(path);
  }
}
