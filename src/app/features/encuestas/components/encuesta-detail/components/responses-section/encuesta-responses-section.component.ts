import { Component, computed, input, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { StatCardComponent } from '../../../../../../shared/components/stat-card/stat-card.component';
import { IndividualResponsesComponent } from '../../../../../forms/components/form-results/components/individual-responses/individual-responses.component';
import { ResponseDetailDrawerComponent } from '../../../../../forms/components/form-results/components/response-detail-drawer/response-detail-drawer.component';
import { ResponseExportComponent } from '../../../../../forms/components/response-export/response-export.component';
import { Candidate } from '../../../../../convocatorias/models/convocatoria.model';

@Component({
  selector: 'app-encuesta-responses-section',
  imports: [
    TranslatePipe, StatCardComponent, IndividualResponsesComponent, ResponseDetailDrawerComponent,
    ResponseExportComponent,
  ],
  templateUrl: './encuesta-responses-section.component.html',
  styleUrl: './encuesta-responses-section.component.scss',
})
export class EncuestaResponsesSectionComponent {
  readonly formId = input.required<string>();
  readonly candidates = input.required<Candidate[]>();

  protected readonly selectedResponseId = signal<string | null>(null);
  protected readonly totalResponses = signal(0);

  protected readonly invitedCount = computed(() => this.candidates().length);
  protected readonly respondedCount = computed(() =>
    this.candidates().filter((c) => c.status === 'RESPONDED').length);
  protected readonly responseRatePct = computed(() => {
    const total = this.invitedCount();
    return total === 0 ? 0 : Math.round((this.respondedCount() * 100) / total);
  });
  // Responses submitted via the anonymous share link have no candidate behind them —
  // anything beyond the known destinatarios' responses is one of those.
  protected readonly anonymousCount = computed(() =>
    Math.max(0, this.totalResponses() - this.respondedCount()));

  protected onResponseSelected(id: string): void {
    this.selectedResponseId.set(id);
  }

  protected onTotalLoaded(total: number): void {
    this.totalResponses.set(total);
  }

  protected closeDrawer(): void {
    this.selectedResponseId.set(null);
  }
}
