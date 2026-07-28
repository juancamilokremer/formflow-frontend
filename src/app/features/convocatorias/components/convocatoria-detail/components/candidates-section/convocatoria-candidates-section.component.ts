import { Component, DestroyRef, computed, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonComponent } from '../../../../../../shared/components/button/button.component';
import { IconComponent } from '../../../../../../shared/icons/icon.component';
import { ConvocatoriaService } from '../../../../services/convocatoria.service';
import { Candidate, ImportResponse } from '../../../../models/convocatoria.model';

@Component({
  selector: 'app-convocatoria-candidates-section',
  imports: [TranslatePipe, ButtonComponent, IconComponent],
  templateUrl: './convocatoria-candidates-section.component.html',
  styleUrl: './convocatoria-candidates-section.component.scss',
})
export class ConvocatoriaCandidatesSectionComponent {
  private readonly convocatoriaService = inject(ConvocatoriaService);
  private readonly destroyRef = inject(DestroyRef);

  readonly convocatoriaId = input.required<string>();
  readonly candidates = input.required<Candidate[]>();

  readonly candidateAdded = output<Candidate>();
  readonly candidatesImported = output<ImportResponse>();

  protected readonly manualName = signal('');
  protected readonly manualEmail = signal('');
  protected readonly adding = signal(false);
  protected readonly addError = signal(false);

  protected readonly importing = signal(false);
  protected readonly csvReadError = signal(false);
  protected readonly importResult = signal<ImportResponse | null>(null);

  protected readonly canAddManual = computed(() => {
    const email = this.manualEmail().trim();
    return this.manualName().trim().length > 0
      && email.length > 0
      && !Validators.email({ value: email } as AbstractControl);
  });

  protected addManualCandidate(): void {
    if (!this.canAddManual() || this.adding()) return;
    this.adding.set(true);
    this.addError.set(false);

    this.convocatoriaService.addCandidate(this.convocatoriaId(), {
      name: this.manualName().trim(),
      email: this.manualEmail().trim(),
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (candidate) => {
        this.adding.set(false);
        this.manualName.set('');
        this.manualEmail.set('');
        this.candidateAdded.emit(candidate);
      },
      error: () => {
        this.adding.set(false);
        this.addError.set(true);
      },
    });
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || this.importing()) return;

    this.csvReadError.set(false);
    this.importing.set(true);

    this.convocatoriaService.importCandidates(this.convocatoriaId(), file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.importing.set(false);
          this.importResult.set(result);
          input.value = '';
          this.candidatesImported.emit(result);
        },
        error: () => {
          this.importing.set(false);
          input.value = '';
          this.csvReadError.set(true);
        },
      });
  }
}
