import { Component, DestroyRef, computed, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { CdkDropList, CdkDrag, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ButtonComponent } from '../../../../../../shared/components/button/button.component';
import { IconComponent } from '../../../../../../shared/icons/icon.component';
import { SelectComponent, SelectOption } from '../../../../../../shared/components/select/select.component';
import { RouteConstants, formBuilderPath } from '../../../../../../core/constants/route.constants';
import { FormsService } from '../../../../../forms/services/forms.service';
import { Form } from '../../../../../forms/models/form.model';
import { ConvocatoriaService } from '../../../../services/convocatoria.service';
import { ConvocatoriaForm, FormAddedEvent, ProcessType } from '../../../../models/convocatoria.model';
import { ConvocatoriaFormCardComponent } from './components/form-card/convocatoria-form-card.component';

@Component({
  selector: 'app-convocatoria-form-section',
  imports: [TranslatePipe, ButtonComponent, IconComponent, SelectComponent, CdkDropList, CdkDrag, ConvocatoriaFormCardComponent],
  templateUrl: './convocatoria-form-section.component.html',
  styleUrl: './convocatoria-form-section.component.scss',
})
export class ConvocatoriaFormSectionComponent {
  private readonly formsService = inject(FormsService);
  private readonly convocatoriaService = inject(ConvocatoriaService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly convocatoriaId = input.required<string>();
  readonly convocatoriaName = input.required<string>();
  readonly processType = input.required<ProcessType>();
  readonly convocatoriaForms = input.required<ConvocatoriaForm[]>();
  readonly forms = input.required<Form[]>();
  readonly readonly = input(false);

  readonly formAdded = output<FormAddedEvent>();
  readonly formUpdated = output<ConvocatoriaForm>();
  readonly formRemoved = output<string>();
  readonly formsReordered = output<string[]>();

  protected readonly creating = signal(false);
  protected readonly duplicating = signal(false);
  protected readonly selectedFormId = signal('');
  protected readonly error = signal(false);
  protected readonly liveWeights = signal<Record<string, number>>({});

  protected readonly matchingForms = computed(() =>
    this.forms().filter((form) => form.status === 'ACTIVE' && form.type === this.processType()));

  protected readonly duplicateOptions = computed<SelectOption[]>(() => [
    { value: '', label: 'convocatorias.detail.form.duplicate_placeholder' },
    ...this.matchingForms().map((form) => ({ value: form.id, label: form.name })),
  ]);

  protected readonly totalWeight = computed(() => {
    const live = this.liveWeights();
    return this.convocatoriaForms().reduce((sum, convocatoriaForm) => sum + (live[convocatoriaForm.id] ?? convocatoriaForm.weight), 0);
  });
  protected readonly sumValid = computed(() => this.totalWeight() === 100);

  protected formName(convocatoriaForm: ConvocatoriaForm): string {
    return this.forms().find((form) => form.id === convocatoriaForm.formId)?.name ?? '';
  }

  protected onDuplicateSelected(formId: string): void {
    this.selectedFormId.set(formId);
  }

  protected onWeightPreview(convocatoriaFormId: string, weight: number): void {
    this.liveWeights.update((weights) => ({ ...weights, [convocatoriaFormId]: weight }));
  }

  protected onCardUpdated(updated: ConvocatoriaForm): void {
    this.formUpdated.emit(updated);
  }

  protected onCardRemoved(convocatoriaFormId: string): void {
    this.liveWeights.update((weights) => {
      const next = { ...weights };
      delete next[convocatoriaFormId];
      return next;
    });
    this.formRemoved.emit(convocatoriaFormId);
  }

  protected onDrop(event: CdkDragDrop<ConvocatoriaForm[]>): void {
    const orderedIds = this.convocatoriaForms().map((convocatoriaForm) => convocatoriaForm.id);
    moveItemInArray(orderedIds, event.previousIndex, event.currentIndex);
    this.formsReordered.emit(orderedIds);
  }

  protected createNew(): void {
    if (this.creating()) return;
    this.creating.set(true);
    this.error.set(false);

    this.formsService.create({ name: this.convocatoriaName(), type: this.processType() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (form) => {
          this.router.navigate(formBuilderPath(form.id), {
            queryParams: { [RouteConstants.QUERY_CONVOCATORIA_ID]: this.convocatoriaId() },
          });
        },
        error: () => {
          this.creating.set(false);
          this.error.set(true);
        },
      });
  }

  protected duplicateSelected(): void {
    if (!this.selectedFormId() || this.duplicating()) return;
    this.duplicating.set(true);
    this.error.set(false);
    const weight = this.nextWeight();
    let duplicatedForm!: Form;

    this.formsService.duplicate(this.selectedFormId()).pipe(
      switchMap((newForm) => {
        duplicatedForm = newForm;
        return this.convocatoriaService.addForm(this.convocatoriaId(), {
          formId: newForm.id,
          weight,
          categoryWeights: [],
          minScore: null,
        });
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (convocatoriaForm) => {
        this.duplicating.set(false);
        this.selectedFormId.set('');
        this.formAdded.emit({ convocatoriaForm, form: duplicatedForm });
      },
      error: () => {
        this.duplicating.set(false);
        this.error.set(true);
      },
    });
  }

  private nextWeight(): number {
    return this.convocatoriaForms().length === 0 ? 100 : 0;
  }
}
