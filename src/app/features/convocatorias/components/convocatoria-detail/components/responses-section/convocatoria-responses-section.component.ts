import { Component, computed, input, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { StatCardComponent } from '../../../../../../shared/components/stat-card/stat-card.component';
import { IndividualResponsesComponent } from '../../../../../forms/components/form-results/components/individual-responses/individual-responses.component';
import { ResponseDetailDrawerComponent } from '../../../../../forms/components/form-results/components/response-detail-drawer/response-detail-drawer.component';
import { Candidate } from '../../../../models/convocatoria.model';

@Component({
  selector: 'app-convocatoria-responses-section',
  imports: [TranslatePipe, StatCardComponent, IndividualResponsesComponent, ResponseDetailDrawerComponent],
  templateUrl: './convocatoria-responses-section.component.html',
  styleUrl: './convocatoria-responses-section.component.scss',
})
export class ConvocatoriaResponsesSectionComponent {
  readonly formId = input.required<string>();
  readonly candidates = input.required<Candidate[]>();

  protected readonly selectedResponseId = signal<string | null>(null);

  protected readonly invitedCount = computed(() => this.candidates().length);
  protected readonly respondedCount = computed(() =>
    this.candidates().filter((c) => c.status === 'RESPONDED').length);
  protected readonly responseRatePct = computed(() => {
    const total = this.invitedCount();
    return total === 0 ? 0 : Math.round((this.respondedCount() * 100) / total);
  });

  protected onResponseSelected(id: string): void {
    this.selectedResponseId.set(id);
  }

  protected closeDrawer(): void {
    this.selectedResponseId.set(null);
  }
}
