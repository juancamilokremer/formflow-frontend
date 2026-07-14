import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { StatusFilterOption } from '../../models/convocatoria.model';

interface FilterChip {
  value: StatusFilterOption;
  labelKey: string;
}

const FILTER_CHIPS: FilterChip[] = [
  { value: 'ALL',    labelKey: 'convocatorias.filter.all' },
  { value: 'ACTIVE', labelKey: 'convocatorias.filter.active' },
  { value: 'DRAFT',  labelKey: 'convocatorias.filter.draft' },
  { value: 'CLOSED', labelKey: 'convocatorias.filter.closed' },
];

@Component({
  selector: 'app-status-filter',
  imports: [TranslatePipe],
  templateUrl: './status-filter.component.html',
  styleUrl: './status-filter.component.scss',
})
export class StatusFilterComponent {
  readonly selected = input<StatusFilterOption>('ALL');
  readonly changed  = output<StatusFilterOption>();

  protected readonly chips = FILTER_CHIPS;

  protected select(value: StatusFilterOption): void {
    this.changed.emit(value);
  }
}
