import { Component, computed, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '../../../../shared/icons/icon.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ConvocatoriaSummary } from '../../models/convocatoria.model';

@Component({
  selector: 'app-convocatoria-card',
  imports: [DatePipe, TranslatePipe, IconComponent, ButtonComponent],
  templateUrl: './convocatoria-card.component.html',
  styleUrl: './convocatoria-card.component.scss',
})
export class ConvocatoriaCardComponent {
  readonly convocatoria = input.required<ConvocatoriaSummary>();

  readonly viewDetail      = output<string>();
  readonly closeRequested  = output<string>();
  readonly deleteRequested = output<string>();

  protected readonly progressPercent = computed(() => {
    const c = this.convocatoria();
    if (c.candidateCount === 0) return 0;
    return Math.round((c.respondedCount / c.candidateCount) * 100);
  });

  protected readonly statusKey = computed(
    () => `convocatorias.status.${this.convocatoria().status}`,
  );

  protected readonly isActive  = computed(() => this.convocatoria().status === 'ACTIVE');
  protected readonly isDraft   = computed(() => this.convocatoria().status === 'DRAFT');
  protected readonly isClosed  = computed(() => this.convocatoria().status === 'CLOSED');

  protected onViewDetail(): void { this.viewDetail.emit(this.convocatoria().id); }
  protected onClose():      void { this.closeRequested.emit(this.convocatoria().id); }
  protected onDelete():     void { this.deleteRequested.emit(this.convocatoria().id); }
}
