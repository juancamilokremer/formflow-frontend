import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Subject, debounceTime, switchMap } from 'rxjs';
import { RouteConstants } from '../../../../core/constants/route.constants';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { IconComponent } from '../../../../shared/icons/icon.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { FormsService } from '../../../forms/services/forms.service';
import { Form } from '../../../forms/models/form.model';
import { ConvocatoriaService } from '../../services/convocatoria.service';
import { Candidate, ConvocatoriaDetail, ConvocatoriaForm, FormAddedEvent } from '../../models/convocatoria.model';
import { ConvocatoriaFormSectionComponent } from './components/form-section/convocatoria-form-section.component';
import { ConvocatoriaThresholdsSectionComponent } from './components/thresholds-section/convocatoria-thresholds-section.component';
import { ConvocatoriaCandidatesSectionComponent } from './components/candidates-section/convocatoria-candidates-section.component';
import { ConvocatoriaLaunchBarComponent } from './components/launch-bar/convocatoria-launch-bar.component';

@Component({
  selector: 'app-convocatoria-detail',
  imports: [
    TranslatePipe,
    ButtonComponent, CardComponent, PageHeaderComponent, IconComponent, ConfirmDialogComponent,
    LoadingSpinnerComponent, EmptyStateComponent,
    ConvocatoriaFormSectionComponent, ConvocatoriaThresholdsSectionComponent,
    ConvocatoriaCandidatesSectionComponent, ConvocatoriaLaunchBarComponent,
  ],
  templateUrl: './convocatoria-detail.component.html',
  styleUrl: './convocatoria-detail.component.scss',
})
export class ConvocatoriaDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly convocatoriaService = inject(ConvocatoriaService);
  private readonly formsService = inject(FormsService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly id = this.route.snapshot.paramMap.get('id')!;

  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);
  protected readonly convocatoria = signal<ConvocatoriaDetail | null>(null);

  protected readonly forms = signal<Form[]>([]);

  protected readonly aptoMin = signal(70);
  protected readonly revisarMin = signal(50);

  protected readonly deleteConfirmOpen = signal(false);
  protected readonly deleting = signal(false);

  protected readonly isDraft = computed(() => this.convocatoria()?.status === 'DRAFT');

  private readonly thresholdsChange$ = new Subject<void>();

  constructor() {
    this.formsService.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((forms) => this.forms.set(forms));

    this.convocatoriaService.getById(this.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (detail) => {
          this.applyDetail(detail);
          this.loading.set(false);
        },
        error: () => {
          this.loadError.set(true);
          this.loading.set(false);
        },
      });

    this.thresholdsChange$.pipe(
      debounceTime(600),
      switchMap(() => this.convocatoriaService.update(this.id, this.buildUpdateRequest())),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((detail) => this.applyDetail(detail));
  }

  private applyDetail(detail: ConvocatoriaDetail): void {
    this.convocatoria.set(detail);
    this.aptoMin.set(detail.scoringConfig.aptoMin);
    this.revisarMin.set(detail.scoringConfig.revisarMin);
  }

  private buildUpdateRequest() {
    const current = this.convocatoria();
    return {
      name: current?.name ?? '',
      scoringConfig: { aptoMin: this.aptoMin(), revisarMin: this.revisarMin() },
    };
  }

  protected onNameBlur(event: FocusEvent): void {
    const current = this.convocatoria();
    const name = (event.target as HTMLInputElement).value.trim();
    if (!current || !name || name === current.name) return;

    this.convocatoriaService.update(this.id, { ...this.buildUpdateRequest(), name })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((detail) => this.applyDetail(detail));
  }

  protected onFormAdded(event: FormAddedEvent): void {
    this.convocatoria.update((c) => (c ? { ...c, forms: [...c.forms, event.convocatoriaForm] } : c));
    this.forms.update((forms) => [...forms, event.form]);
  }

  protected onFormUpdated(updated: ConvocatoriaForm): void {
    this.convocatoria.update((c) =>
      c ? { ...c, forms: c.forms.map((f) => (f.id === updated.id ? updated : f)) } : c);
  }

  protected onFormRemoved(convocatoriaFormId: string): void {
    this.convocatoria.update((c) =>
      c ? { ...c, forms: c.forms.filter((f) => f.id !== convocatoriaFormId) } : c);
  }

  protected onFormsReordered(orderedIds: string[]): void {
    this.convocatoria.update((c) =>
      c ? { ...c, forms: orderedIds.map((formId) => c.forms.find((f) => f.id === formId)!) } : c);

    this.convocatoriaService.reorderForms(this.id, orderedIds)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((reordered) => {
        this.convocatoria.update((c) => (c ? { ...c, forms: reordered } : c));
      });
  }

  protected onThresholdsChanged(patch: { aptoMin: number; revisarMin: number }): void {
    this.aptoMin.set(patch.aptoMin);
    this.revisarMin.set(patch.revisarMin);
    this.thresholdsChange$.next();
  }

  protected onCandidateAdded(candidate: Candidate): void {
    this.convocatoria.update((c) => (c ? { ...c, candidates: [...c.candidates, candidate] } : c));
  }

  protected onCandidatesImported(): void {
    this.convocatoriaService.getById(this.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((detail) => this.applyDetail(detail));
  }

  protected onLaunched(detail: ConvocatoriaDetail): void {
    this.applyDetail(detail);
  }

  protected requestDelete(): void {
    this.deleteConfirmOpen.set(true);
  }

  protected cancelDelete(): void {
    this.deleteConfirmOpen.set(false);
  }

  protected confirmDelete(): void {
    if (this.deleting()) return;
    this.deleting.set(true);
    this.convocatoriaService.delete(this.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.router.navigate(['/', RouteConstants.CONVOCATORIAS]),
        error: () => this.deleting.set(false),
      });
  }
}
