import { Component, computed, inject, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Router, RouterLink } from '@angular/router';
import { LowerCasePipe } from '@angular/common';
import { ButtonComponent } from '../../../../../../shared/components/button/button.component';
import { IconComponent } from '../../../../../../shared/icons/icon.component';
import { ContainerKind, formPreviewPath } from '../../../../../../core/constants/route.constants';
import { FormDetail } from '../../../../models/form.model';

@Component({
  selector: 'app-builder-topbar',
  imports: [TranslatePipe, LowerCasePipe, RouterLink, ButtonComponent, IconComponent],
  templateUrl: './builder-topbar.component.html',
  styleUrl: './builder-topbar.component.scss',
})
export class BuilderTopbarComponent {
  private readonly router = inject(Router);

  readonly form = input.required<FormDetail>();
  readonly containerId = input.required<string>();
  readonly containerKind = input.required<ContainerKind>();

  protected readonly backToConvocatoriaLabelKey = computed(() =>
    this.containerKind() === 'encuestas' ? 'builder.back_to_encuesta' : 'builder.back_to_convocatoria');

  readonly nameChanged = output<string>();
  readonly publishClicked = output<void>();
  readonly returnToConvocatoriaClicked = output<void>();
  readonly historyClicked = output<void>();
  readonly timeLimitChanged = output<number | null>();


  protected readonly hasQuestionTimeLimits = computed(() =>
    this.form().sections.some((s) => s.questions.some((q) => q.timeLimitSeconds != null)),
  );

  protected readonly timeLimitMinutes = computed(() => {
    const seconds = this.form().timeLimitSeconds;
    return seconds == null ? null : Math.round(seconds / 60);
  });

  protected onTimeLimitBlur(event: FocusEvent): void {
    const raw = (event.target as HTMLInputElement).value.trim();
    const minutes = raw === '' ? null : Number(raw);
    const seconds = minutes == null || Number.isNaN(minutes) || minutes <= 0 ? null : minutes * 60;
    if (seconds !== this.form().timeLimitSeconds) {
      this.timeLimitChanged.emit(seconds);
    }
  }

  protected onPreviewClick(): void {
    // The container is part of the preview's own route, so returning from it lands back
    // in this builder with its context intact — nothing to carry in query params.
    this.router.navigate(formPreviewPath(this.containerKind(), this.containerId(), this.form().id));
  }

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
