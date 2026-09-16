import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { encuestaDetailPath, encuestaNewPath } from '../../core/constants/route.constants';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { IconComponent } from '../../shared/icons/icon.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { ConvocatoriaCardComponent } from '../convocatorias/components/convocatoria-card/convocatoria-card.component';
import { StatusFilterComponent } from '../convocatorias/components/status-filter/status-filter.component';
import { ConvocatoriaService } from '../convocatorias/services/convocatoria.service';
import {
  ConvocatoriaSummary,
  ConvocatoriaListView,
  StatusFilterOption,
  PendingConvocatoriaAction,
} from '../convocatorias/models/convocatoria.model';

@Component({
  selector: 'app-encuestas',
  imports: [
    TranslatePipe,
    ButtonComponent, PageHeaderComponent, IconComponent, StatCardComponent,
    EmptyStateComponent, LoadingSpinnerComponent, ConfirmDialogComponent,
    ConvocatoriaCardComponent, StatusFilterComponent,
  ],
  templateUrl: './encuestas.component.html',
  styleUrl: './encuestas.component.scss',
})
export class EncuestasComponent {
  private readonly svc        = inject(ConvocatoriaService);
  private readonly router     = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly view           = signal<ConvocatoriaListView>('loading');
  protected readonly encuestas      = signal<ConvocatoriaSummary[]>([]);
  protected readonly statusFilter   = signal<StatusFilterOption>('ALL');
  protected readonly pendingAction  = signal<PendingConvocatoriaAction | null>(null);
  protected readonly actionLoading  = signal(false);

  private readonly onlyEncuestas = computed(() =>
    this.encuestas().filter((c) => c.type === 'REGISTRATION'));

  protected readonly filtered = computed(() => {
    const filter = this.statusFilter();
    const all    = this.onlyEncuestas();
    return filter === 'ALL' ? all : all.filter((c) => c.status === filter);
  });

  protected readonly activeCount     = computed(() => this.onlyEncuestas().filter((c) => c.status === 'ACTIVE').length);
  protected readonly draftCount      = computed(() => this.onlyEncuestas().filter((c) => c.status === 'DRAFT').length);
  protected readonly totalCandidates = computed(() => this.onlyEncuestas().reduce((acc, c) => acc + c.candidateCount, 0));
  protected readonly totalResponded  = computed(() => this.onlyEncuestas().reduce((acc, c) => acc + c.respondedCount, 0));

  constructor() {
    this.load();
  }

  private load(): void {
    this.svc.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next:  (list) => { this.encuestas.set(list); this.view.set('ready'); },
        error: ()     => this.view.set('error'),
      });
  }

  protected onFilterChanged(value: StatusFilterOption): void {
    this.statusFilter.set(value);
  }

  protected navigateToNew(): void {
    this.router.navigate(encuestaNewPath());
  }

  protected navigateToDetail(id: string): void {
    this.router.navigate(encuestaDetailPath(id));
  }

  protected requestClose(id: string): void {
    const enc = this.encuestas().find((c) => c.id === id);
    if (enc) this.pendingAction.set({ type: 'close', id, name: enc.name });
  }

  protected requestDelete(id: string): void {
    const enc = this.encuestas().find((c) => c.id === id);
    if (enc) this.pendingAction.set({ type: 'delete', id, name: enc.name });
  }

  protected cancelAction(): void {
    this.pendingAction.set(null);
  }

  protected confirmAction(): void {
    const action = this.pendingAction();
    if (!action) return;

    const request$ = action.type === 'close'
      ? this.svc.close(action.id)
      : this.svc.delete(action.id);

    this.actionLoading.set(true);
    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        if (action.type === 'close') {
          this.encuestas.update((list) =>
            list.map((c) => c.id === action.id ? { ...c, status: 'CLOSED' as const } : c),
          );
        } else {
          this.encuestas.update((list) => list.filter((c) => c.id !== action.id));
        }
        this.pendingAction.set(null);
        this.actionLoading.set(false);
      },
      error: () => this.actionLoading.set(false),
    });
  }
}
