import { Component, effect, input, output, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

type TimeLimitUnit = 'seconds' | 'minutes';

@Component({
  selector: 'app-time-limit-field',
  imports: [TranslatePipe],
  templateUrl: './time-limit-field.component.html',
  styleUrl: './time-limit-field.component.scss',
})
export class TimeLimitFieldComponent {
  readonly seconds = input<number | null>(null);
  readonly secondsChange = output<number | null>();

  protected readonly unit = signal<TimeLimitUnit>('seconds');

  constructor() {
    effect(() => {
      const secs = this.seconds();
      this.unit.set(secs != null && secs >= 60 && secs % 60 === 0 ? 'minutes' : 'seconds');
    });
  }

  protected get displayValue(): number | null {
    const secs = this.seconds();
    if (secs == null) return null;
    return this.unit() === 'minutes' ? Math.round(secs / 60) : secs;
  }

  protected onValueBlur(event: FocusEvent): void {
    const raw = (event.target as HTMLInputElement).value.trim();
    const num = raw === '' ? null : Number(raw);
    const seconds = num == null || Number.isNaN(num) || num <= 0
      ? null
      : (this.unit() === 'minutes' ? num * 60 : num);
    if (seconds !== this.seconds()) {
      this.secondsChange.emit(seconds);
    }
  }

  protected onUnitChange(event: Event): void {
    this.unit.set((event.target as HTMLSelectElement).value as TimeLimitUnit);
  }
}
