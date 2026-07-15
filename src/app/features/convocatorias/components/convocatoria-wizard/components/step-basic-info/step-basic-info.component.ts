import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { PROCESS_TYPE_LABEL_KEYS, ProcessType } from '../../../../models/convocatoria-wizard.model';

interface ProcessTypeOption {
  value: ProcessType;
  labelKey: string;
  descKey: string;
}

const PROCESS_TYPE_OPTIONS: ProcessTypeOption[] = [
  {
    value: 'CANDIDATES',
    labelKey: PROCESS_TYPE_LABEL_KEYS.CANDIDATES,
    descKey: 'convocatorias.wizard.basic_info.type_candidates_desc',
  },
  {
    value: 'DIAGNOSTIC',
    labelKey: PROCESS_TYPE_LABEL_KEYS.DIAGNOSTIC,
    descKey: 'convocatorias.wizard.basic_info.type_diagnostic_desc',
  },
];

@Component({
  selector: 'app-step-basic-info',
  imports: [TranslatePipe],
  templateUrl: './step-basic-info.component.html',
  styleUrl: './step-basic-info.component.scss',
})
export class StepBasicInfoComponent {
  readonly name = input.required<string>();
  readonly processType = input.required<ProcessType>();
  readonly changed = output<{ name: string; processType: ProcessType }>();

  protected readonly processTypeOptions = PROCESS_TYPE_OPTIONS;

  protected onNameInput(value: string): void {
    this.changed.emit({ name: value, processType: this.processType() });
  }

  protected selectProcessType(type: ProcessType): void {
    this.changed.emit({ name: this.name(), processType: type });
  }
}
