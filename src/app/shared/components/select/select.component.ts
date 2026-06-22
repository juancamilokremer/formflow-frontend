import { Component, input, output } from '@angular/core';

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
})
export class SelectComponent {
  readonly options = input.required<SelectOption[]>();
  readonly value = input('');
  readonly changed = output<string>();

  protected onChange(event: Event): void {
    this.changed.emit((event.target as HTMLSelectElement).value);
  }
}
