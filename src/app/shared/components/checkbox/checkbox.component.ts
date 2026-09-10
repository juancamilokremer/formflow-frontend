import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
})
export class CheckboxComponent {
  readonly checked = input(false);
  readonly ariaLabel = input<string | null>(null);
  readonly changed = output<boolean>();

  protected onChange(event: Event): void {
    this.changed.emit((event.target as HTMLInputElement).checked);
  }
}
