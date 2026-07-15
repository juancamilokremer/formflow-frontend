import { Component, computed, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { SelectComponent, SelectOption } from '../../../../../../shared/components/select/select.component';
import { EmptyStateComponent } from '../../../../../../shared/components/empty-state/empty-state.component';
import { Form } from '../../../../../forms/models/form.model';
import { ProcessType } from '../../../../models/convocatoria-wizard.model';

const PLACEHOLDER_OPTION: SelectOption = {
  value: '',
  label: 'convocatorias.wizard.form_selector.placeholder',
};

@Component({
  selector: 'app-step-form-selector',
  imports: [TranslatePipe, SelectComponent, EmptyStateComponent],
  templateUrl: './step-form-selector.component.html',
  styleUrl: './step-form-selector.component.scss',
})
export class StepFormSelectorComponent {
  readonly forms = input.required<Form[]>();
  readonly processType = input.required<ProcessType>();
  readonly selectedFormId = input<string | null>(null);
  readonly formSelected = output<string>();

  protected readonly matchingForms = computed(() =>
    this.forms().filter((f) => f.status === 'ACTIVE' && f.type === this.processType()));

  protected readonly options = computed<SelectOption[]>(() => [
    PLACEHOLDER_OPTION,
    ...this.matchingForms().map((f) => ({ value: f.id, label: f.name })),
  ]);

  protected onChange(formId: string): void {
    if (formId) this.formSelected.emit(formId);
  }
}
