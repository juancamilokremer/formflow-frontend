import { Component, DestroyRef, computed, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonComponent } from '../../../../../../shared/components/button/button.component';
import { IconComponent } from '../../../../../../shared/icons/icon.component';
import { SelectComponent, SelectOption } from '../../../../../../shared/components/select/select.component';
import { RouteConstants, formBuilderPath } from '../../../../../../core/constants/route.constants';
import { FormsService } from '../../../../../forms/services/forms.service';
import { Form } from '../../../../../forms/models/form.model';
import { ConvocatoriaService } from '../../../../services/convocatoria.service';
import { ProcessType } from '../../../../models/convocatoria.model';

@Component({
  selector: 'app-convocatoria-form-section',
  imports: [TranslatePipe, ButtonComponent, IconComponent, SelectComponent],
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
  readonly currentForm = input<Form | null>(null);
  readonly forms = input.required<Form[]>();

  readonly formAttached = output<Form>();

  protected readonly creating = signal(false);
  protected readonly duplicating = signal(false);
  protected readonly selectedFormId = signal('');
  protected readonly error = signal(false);

  protected readonly matchingForms = computed(() =>
    this.forms().filter((f) => f.status === 'ACTIVE' && f.type === this.processType()));

  protected readonly duplicateOptions = computed<SelectOption[]>(() => [
    { value: '', label: 'convocatorias.detail.form.duplicate_placeholder' },
    ...this.matchingForms().map((f) => ({ value: f.id, label: f.name })),
  ]);

  protected onDuplicateSelected(formId: string): void {
    this.selectedFormId.set(formId);
  }

  protected openCurrentForm(): void {
    const current = this.currentForm();
    if (!current) return;
    this.router.navigate(formBuilderPath(current.id), {
      queryParams: { [RouteConstants.QUERY_CONVOCATORIA_ID]: this.convocatoriaId() },
    });
  }

  protected createNew(): void {
    if (this.creating()) return;
    this.creating.set(true);
    this.error.set(false);

    this.formsService.create({ name: this.convocatoriaName(), type: this.processType() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (form) => this.router.navigate(formBuilderPath(form.id), {
          queryParams: { [RouteConstants.QUERY_CONVOCATORIA_ID]: this.convocatoriaId() },
        }),
        error: () => {
          this.creating.set(false);
          this.error.set(true);
        },
      });
  }

  protected duplicateSelected(): void {
    const formId = this.selectedFormId();
    if (!formId || this.duplicating()) return;
    this.duplicating.set(true);
    this.error.set(false);

    this.formsService.duplicate(formId).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (newForm) => {
        this.convocatoriaService.update(this.convocatoriaId(), {
          name: this.convocatoriaName(),
          formId: newForm.id,
        }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: () => {
            this.duplicating.set(false);
            this.selectedFormId.set('');
            this.formAttached.emit(newForm);
          },
          error: () => {
            this.duplicating.set(false);
            this.error.set(true);
          },
        });
      },
      error: () => {
        this.duplicating.set(false);
        this.error.set(true);
      },
    });
  }
}
