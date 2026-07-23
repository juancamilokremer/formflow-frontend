import { Component, computed, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-convocatoria-thresholds-section',
  imports: [TranslatePipe],
  templateUrl: './convocatoria-thresholds-section.component.html',
  styleUrl: './convocatoria-thresholds-section.component.scss',
})
export class ConvocatoriaThresholdsSectionComponent {
  readonly aptoMin = input.required<number>();
  readonly revisarMin = input.required<number>();
  readonly thresholdsChanged = output<{ aptoMin: number; revisarMin: number }>();

  protected readonly noAptoZoneWidth = computed(() => this.revisarMin());
  protected readonly revisarZoneWidth = computed(() => this.aptoMin() - this.revisarMin());
  protected readonly aptoZoneWidth = computed(() => 100 - this.aptoMin());

  protected onAptoInput(value: number): void {
    const revisarMin = Math.max(0, Math.min(this.revisarMin(), value - 1));
    this.thresholdsChanged.emit({ aptoMin: value, revisarMin });
  }

  protected onRevisarInput(value: number): void {
    const revisarMin = Math.max(0, Math.min(value, this.aptoMin() - 1));
    this.thresholdsChanged.emit({ aptoMin: this.aptoMin(), revisarMin });
  }
}
