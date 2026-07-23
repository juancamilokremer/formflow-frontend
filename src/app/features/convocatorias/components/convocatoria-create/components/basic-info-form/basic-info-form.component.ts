import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { PROCESS_TYPE_LABEL_KEYS, ProcessType } from '../../../../models/convocatoria.model';

interface ProcessTypeOption {
  value: ProcessType;
  labelKey: string;
  descKey: string;
}

const PROCESS_TYPE_OPTIONS: ProcessTypeOption[] = [
  {
    value: 'CANDIDATES',
    labelKey: PROCESS_TYPE_LABEL_KEYS.CANDIDATES,
    descKey: 'convocatorias.create.type_candidates_desc',
  },
  {
    value: 'DIAGNOSTIC',
    labelKey: PROCESS_TYPE_LABEL_KEYS.DIAGNOSTIC,
    descKey: 'convocatorias.create.type_diagnostic_desc',
  },
];

@Component({
  selector: 'app-basic-info-form',
  imports: [TranslatePipe],
  templateUrl: './basic-info-form.component.html',
  styleUrl: './basic-info-form.component.scss',
})
export class BasicInfoFormComponent {
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
