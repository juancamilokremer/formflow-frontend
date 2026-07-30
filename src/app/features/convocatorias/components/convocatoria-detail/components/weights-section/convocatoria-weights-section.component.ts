import { Component, computed, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { EmptyStateComponent } from '../../../../../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../../../../../shared/components/loading-spinner/loading-spinner.component';
import { Category } from '../../../../../../core/models/category.model';

@Component({
  selector: 'app-convocatoria-weights-section',
  imports: [TranslatePipe, EmptyStateComponent, LoadingSpinnerComponent],
  templateUrl: './convocatoria-weights-section.component.html',
  styleUrl: './convocatoria-weights-section.component.scss',
})
export class ConvocatoriaWeightsSectionComponent {
  readonly categories = input.required<Category[]>();
  readonly weights = input.required<Record<string, number>>();
  readonly loading = input(false);
  readonly readonly = input(false);
  readonly weightsChanged = output<Record<string, number>>();

  protected readonly totalWeight = computed(() =>
    Object.values(this.weights()).reduce((sum, weight) => sum + weight, 0));

  protected readonly isSkipped = computed(() => this.totalWeight() === 0);
  protected readonly sumValid = computed(() => this.totalWeight() === 100);

  protected onWeightInput(categoryId: string, value: number): void {
    const clamped = Math.max(0, Math.min(100, value || 0));
    this.weightsChanged.emit({ ...this.weights(), [categoryId]: clamped });
  }
}
