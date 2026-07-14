import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { RouteConstants } from '../../core/constants/route.constants';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { IconComponent } from '../../shared/icons/icon.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { ConvocatoriaCardComponent } from './components/convocatoria-card/convocatoria-card.component';
import { StatusFilterComponent } from './components/status-filter/status-filter.component';
import { ConvocatoriaService } from './services/convocatoria.service';
import {
  ConvocatoriaSummary,
  ConvocatoriaListView,
  StatusFilterOption,
  PendingConvocatoriaAction,
} from './models/convocatoria.model';

@Component({
  selector: 'app-convocatorias',
  imports: [
    TranslatePipe,
    ButtonComponent, PageHeaderComponent, IconComponent, StatCardComponent,
    EmptyStateComponent, LoadingSpinnerComponent, ConfirmDialogComponent,
    ConvocatoriaCardComponent, StatusFilterComponent,
  ],
  templateUrl: './convocatorias.component.html',
  styleUrl: './convocatorias.component.scss',
})
export class ConvocatoriasComponent {
  private readonly svc        = inject(ConvocatoriaService);
  private readonly router     = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly view           = signal<ConvocatoriaListView>('loading');
  protected readonly convocatorias  = signal<ConvocatoriaSummary[]>([]);
  protected readonly statusFilter   = signal<StatusFilterOption>('ALL');
  protected readonly pendingAction  = signal<PendingConvocatoriaAction | null>(null);
  protected readonly actionLoading  = signal(false);

  protected readonly filtered = computed(() => {
    const filter = this.statusFilter();
    const all    = this.convocatorias();
    return filter === 'ALL' ? all : all.filter((c) => c.status === filter);
  });

  protected readonly activeCount     = computed(() => this.convocatorias().filter((c) => c.status === 'ACTIVE').length);
  protected readonly draftCount      = computed(() => this.convocatorias().filter((c) => c.status === 'DRAFT').length);
  protected readonly totalCandidates = computed(() => this.convocatorias().reduce((acc, c) => acc + c.candidateCount, 0));
  protected readonly totalResponded  = computed(() => this.convocatorias().reduce((acc, c) => acc + c.respondedCount, 0));

  constructor() {
    this.load();
  }

  private load(): void {
    this.svc.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next:  (list) => { this.convocatorias.set(list); this.view.set('ready'); },
        error: ()     => this.view.set('error'),
      });
  }

  protected onFilterChanged(value: StatusFilterOption): void {
    this.statusFilter.set(value);
  }

  protected navigateToNew(): void {
    this.router.navigate(['/', RouteConstants.CONVOCATORIAS, 'nueva']);
  }

  protected navigateToDetail(id: string): void {
    this.router.navigate(['/', RouteConstants.CONVOCATORIAS, id]);
  }

  protected requestClose(id: string): void {
    const conv = this.convocatorias().find((c) => c.id === id);
    if (conv) this.pendingAction.set({ type: 'close', id, name: conv.name });
  }

  protected requestDelete(id: string): void {
    const conv = this.convocatorias().find((c) => c.id === id);
    if (conv) this.pendingAction.set({ type: 'delete', id, name: conv.name });
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
          this.convocatorias.update((list) =>
            list.map((c) => c.id === action.id ? { ...c, status: 'CLOSED' as const } : c),
          );
        } else {
          this.convocatorias.update((list) => list.filter((c) => c.id !== action.id));
        }
        this.pendingAction.set(null);
        this.actionLoading.set(false);
      },
      error: () => this.actionLoading.set(false),
    });
  }
}
