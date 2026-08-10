import { Component, DestroyRef, computed, effect, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { DrawerComponent } from '../../../../../../shared/components/drawer/drawer.component';
import { LoadingSpinnerComponent } from '../../../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../../../shared/components/empty-state/empty-state.component';
import { StatCardComponent } from '../../../../../../shared/components/stat-card/stat-card.component';
import { IconComponent } from '../../../../../../shared/icons/icon.component';
import { FormsService } from '../../../../services/forms.service';
import { ResponseDetail } from '../../../../models/form-response.model';
import { formatDurationSeconds } from '../results-summary/results-summary.component';

@Component({
  selector: 'app-response-detail-drawer',
  imports: [
    DatePipe, TranslatePipe, DrawerComponent, LoadingSpinnerComponent,
    EmptyStateComponent, StatCardComponent, IconComponent,
  ],
  templateUrl: './response-detail-drawer.component.html',
  styleUrl: './response-detail-drawer.component.scss',
})
export class ResponseDetailDrawerComponent {
  readonly formId = input.required<string>();
  readonly responseId = input<string | null>(null);
  readonly closed = output<void>();

  private readonly formsService = inject(FormsService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly detail = signal<ResponseDetail | null>(null);
  protected readonly loading = signal(false);
  protected readonly loadError = signal(false);

  protected readonly isOpen = computed(() => this.responseId() !== null);

  protected readonly durationLabel = computed(() => {
    const d = this.detail();
    if (!d?.startedAt) return null;
    const seconds = Math.round((new Date(d.submittedAt).getTime() - new Date(d.startedAt).getTime()) / 1000);
    return seconds < 0 ? null : formatDurationSeconds(seconds);
  });

  constructor() {
    effect(() => {
      const responseId = this.responseId();
      if (responseId === null) {
        this.detail.set(null);
        return;
      }
      this.load(responseId);
    });
  }

  private load(responseId: string): void {
    this.loading.set(true);
    this.loadError.set(false);
    this.formsService.getResponseDetail(this.formId(), responseId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (detail) => {
          this.detail.set(detail);
          this.loading.set(false);
        },
        error: () => {
          this.loadError.set(true);
          this.loading.set(false);
        },
      });
  }
}
