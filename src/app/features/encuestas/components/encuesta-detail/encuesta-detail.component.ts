import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { RouteConstants, encuestasListPath } from '../../../../core/constants/route.constants';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { IconComponent } from '../../../../shared/icons/icon.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { TabItem, TabsComponent } from '../../../../shared/components/tabs/tabs.component';
import { FormsService } from '../../../forms/services/forms.service';
import { Form } from '../../../forms/models/form.model';
import { ConvocatoriaService } from '../../../convocatorias/services/convocatoria.service';
import { Candidate, ConvocatoriaDetail, ConvocatoriaForm, FormAddedEvent, PROCESS_TYPE_LABEL_KEYS } from '../../../convocatorias/models/convocatoria.model';
import { ConvocatoriaFormSectionComponent } from '../../../convocatorias/components/convocatoria-detail/components/form-section/convocatoria-form-section.component';
import { ConvocatoriaCandidatesSectionComponent } from '../../../convocatorias/components/convocatoria-detail/components/candidates-section/convocatoria-candidates-section.component';
import { ConvocatoriaLaunchBarComponent } from '../../../convocatorias/components/convocatoria-detail/components/launch-bar/convocatoria-launch-bar.component';
import { ConvocatoriaQuestionStatsSectionComponent } from '../../../convocatorias/components/convocatoria-detail/components/question-stats-section/convocatoria-question-stats-section.component';
import { EncuestaResponsesSectionComponent } from './components/responses-section/encuesta-responses-section.component';

type EncuestaDetailTab = 'respuestas' | 'per-question' | 'formularios';
type DraftTab = 'formularios' | 'destinatarios' | 'lanzar';

const DETAIL_TAB_IDS: EncuestaDetailTab[] = ['respuestas', 'per-question', 'formularios'];

function isDetailTab(value: string | null): value is EncuestaDetailTab {
  return DETAIL_TAB_IDS.includes(value as EncuestaDetailTab);
}

@Component({
  selector: 'app-encuesta-detail',
  imports: [
    TranslatePipe, DatePipe, RouterLink,
    ButtonComponent, CardComponent, PageHeaderComponent, IconComponent, ConfirmDialogComponent,
    LoadingSpinnerComponent, EmptyStateComponent,
    ConvocatoriaFormSectionComponent, ConvocatoriaCandidatesSectionComponent, ConvocatoriaLaunchBarComponent,
    ConvocatoriaQuestionStatsSectionComponent, EncuestaResponsesSectionComponent,
    TabsComponent,
  ],
  templateUrl: './encuesta-detail.component.html',
  styleUrl: './encuesta-detail.component.scss',
})
export class EncuestaDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly convocatoriaService = inject(ConvocatoriaService);
  private readonly formsService = inject(FormsService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly id = this.route.snapshot.paramMap.get('id')!;

  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);
  protected readonly convocatoria = signal<ConvocatoriaDetail | null>(null);

  protected readonly forms = signal<Form[]>([]);

  protected readonly deleteConfirmOpen = signal(false);
  protected readonly deleting = signal(false);

  protected readonly activeTab = signal<EncuestaDetailTab>(this.resolveInitialTab());
  protected readonly processTypeLabels = PROCESS_TYPE_LABEL_KEYS;

  protected readonly backToListPath = encuestasListPath();

  protected readonly isDraft = computed(() => this.convocatoria()?.status === 'DRAFT');

  protected readonly detailTabs: TabItem[] = [
    { id: 'respuestas', label: 'encuestas.detail.tabs.respuestas' },
    { id: 'per-question', label: 'encuestas.detail.tabs.per_question' },
    { id: 'formularios', label: 'encuestas.detail.tabs.formularios' },
  ];

  protected readonly draftActiveTab = signal<DraftTab>('formularios');

  protected readonly draftTabs = computed<TabItem[]>(() => {
    const conv = this.convocatoria();
    const formsComplete = (conv?.forms.length ?? 0) > 0;
    const recipientsComplete = (conv?.candidates.length ?? 0) > 0;

    return [
      { id: 'formularios', label: 'encuestas.detail.draft_tabs.formularios', badge: formsComplete ? 'complete' : 'pending' },
      { id: 'destinatarios', label: 'encuestas.detail.draft_tabs.destinatarios', badge: recipientsComplete ? 'complete' : 'pending' },
      { id: 'lanzar', label: 'encuestas.detail.draft_tabs.lanzar' },
    ];
  });

  constructor() {
    this.formsService.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((forms) => this.forms.set(forms));

    this.convocatoriaService.getById(this.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (detail) => {
          this.applyDetail(detail);
          this.loading.set(false);
        },
        error: () => {
          this.loadError.set(true);
          this.loading.set(false);
        },
      });
  }

  private applyDetail(detail: ConvocatoriaDetail): void {
    this.convocatoria.set(detail);
  }

  private buildUpdateRequest() {
    const current = this.convocatoria();
    return { name: current?.name ?? '' };
  }

  protected onNameBlur(event: FocusEvent): void {
    const current = this.convocatoria();
    const name = (event.target as HTMLInputElement).value.trim();
    if (!current || !name || name === current.name) return;

    this.convocatoriaService.update(this.id, { ...this.buildUpdateRequest(), name })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((detail) => this.applyDetail(detail));
  }

  protected onFormAdded(event: FormAddedEvent): void {
    this.convocatoria.update((c) => (c ? { ...c, forms: [...c.forms, event.convocatoriaForm] } : c));
    this.forms.update((forms) => [...forms, event.form]);
  }

  protected onFormUpdated(updated: ConvocatoriaForm): void {
    this.convocatoria.update((c) =>
      c ? { ...c, forms: c.forms.map((f) => (f.id === updated.id ? updated : f)) } : c);
  }

  protected onFormRemoved(convocatoriaFormId: string): void {
    this.convocatoria.update((c) =>
      c ? { ...c, forms: c.forms.filter((f) => f.id !== convocatoriaFormId) } : c);
  }

  protected onFormsReordered(orderedIds: string[]): void {
    this.convocatoria.update((c) =>
      c ? { ...c, forms: orderedIds.map((formId) => c.forms.find((f) => f.id === formId)!) } : c);

    this.convocatoriaService.reorderForms(this.id, orderedIds)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((reordered) => {
        this.convocatoria.update((c) => (c ? { ...c, forms: reordered } : c));
      });
  }

  protected onCandidateAdded(candidate: Candidate): void {
    this.convocatoria.update((c) => (c ? { ...c, candidates: [...c.candidates, candidate] } : c));
  }

  protected onCandidatesImported(): void {
    this.convocatoriaService.getById(this.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((detail) => this.applyDetail(detail));
  }

  protected onLaunched(detail: ConvocatoriaDetail): void {
    this.applyDetail(detail);
  }

  protected setActiveTab(tabId: string): void {
    this.activeTab.set(tabId as EncuestaDetailTab);
  }

  protected setDraftTab(tabId: string): void {
    this.draftActiveTab.set(tabId as DraftTab);
  }

  private resolveInitialTab(): EncuestaDetailTab {
    const tabFromQuery = this.route.snapshot.queryParamMap.get(RouteConstants.QUERY_TAB);
    return isDetailTab(tabFromQuery) ? tabFromQuery : 'respuestas';
  }

  protected requestDelete(): void {
    this.deleteConfirmOpen.set(true);
  }

  protected cancelDelete(): void {
    this.deleteConfirmOpen.set(false);
  }

  protected confirmDelete(): void {
    if (this.deleting()) return;
    this.deleting.set(true);
    this.convocatoriaService.delete(this.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.router.navigate(encuestasListPath()),
        error: () => this.deleting.set(false),
      });
  }
}
