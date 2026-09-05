import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { FormsTypeFilterOption } from '../../models/form.model';

interface FilterChip {
  value: FormsTypeFilterOption;
  labelKey: string;
}

const FILTER_CHIPS: FilterChip[] = [
  { value: 'ALL',        labelKey: 'forms.type_filter.all' },
  { value: 'SURVEY',     labelKey: 'forms.type_filter.survey' },
  { value: 'EVALUATION', labelKey: 'forms.type_filter.evaluation' },
];

@Component({
  selector: 'app-type-filter',
  imports: [TranslatePipe],
  templateUrl: './type-filter.component.html',
  styleUrl: './type-filter.component.scss',
})
export class TypeFilterComponent {
  readonly selected = input<FormsTypeFilterOption>('ALL');
  readonly changed  = output<FormsTypeFilterOption>();

  protected readonly chips = FILTER_CHIPS;

  protected select(value: FormsTypeFilterOption): void {
    this.changed.emit(value);
  }
}
