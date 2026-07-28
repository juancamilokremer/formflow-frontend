import { Component, DestroyRef, computed, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonComponent } from '../../../../../../shared/components/button/button.component';
import { ConvocatoriaService } from '../../../../services/convocatoria.service';
import { ConvocatoriaDetail } from '../../../../models/convocatoria.model';

@Component({
  selector: 'app-convocatoria-launch-bar',
  imports: [TranslatePipe, ButtonComponent],
  templateUrl: './convocatoria-launch-bar.component.html',
  styleUrl: './convocatoria-launch-bar.component.scss',
})
export class ConvocatoriaLaunchBarComponent {
  private readonly convocatoriaService = inject(ConvocatoriaService);
  private readonly destroyRef = inject(DestroyRef);

  readonly convocatoriaId = input.required<string>();
  readonly hasCandidates = input.required<boolean>();

  readonly launched = output<ConvocatoriaDetail>();

  protected readonly submitting = signal(false);
  protected readonly error = signal(false);

  protected readonly canLaunch = computed(() => this.hasCandidates() && !this.submitting());

  protected requestLaunch(): void {
    if (!this.canLaunch()) return;
    this.submitting.set(true);
    this.error.set(false);

    this.convocatoriaService.launch(this.convocatoriaId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (detail) => {
          this.submitting.set(false);
          this.launched.emit(detail);
        },
        error: () => {
          this.submitting.set(false);
          this.error.set(true);
        },
      });
  }
}
