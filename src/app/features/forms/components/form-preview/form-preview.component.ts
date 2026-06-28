import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '../../../../shared/icons/icon.component';
import { RouteConstants } from '../../../../core/constants/route.constants';
import { FormDetail, FormQuestion, FormSection } from '../../models/form.model';
import { FormsService } from '../../services/forms.service';
import { ConditionEngineService } from '../../services/condition-engine.service';
import { PublicQuestionOutletComponent } from './components/public-question-outlet/public-question-outlet.component';

@Component({
  selector: 'app-form-preview',
  imports: [TranslatePipe, IconComponent, PublicQuestionOutletComponent],
  templateUrl: './form-preview.component.html',
  styleUrl: './form-preview.component.scss',
})
export class FormPreviewComponent implements OnInit {
  private readonly route      = inject(ActivatedRoute);
  private readonly router     = inject(Router);
  private readonly formsSvc   = inject(FormsService);
  private readonly condEngine = inject(ConditionEngineService);

  protected readonly loading = signal(true);
  protected readonly error   = signal(false);
  protected readonly form    = signal<FormDetail | null>(null);

  protected readonly currentSectionIndex = signal(0);
  protected readonly answers             = signal<Map<string, unknown>>(new Map());

  protected readonly sections = computed<FormSection[]>(
    () => this.form()?.sections ?? [],
  );

  protected readonly currentSection = computed<FormSection | null>(
    () => this.sections()[this.currentSectionIndex()] ?? null,
  );

  protected readonly visibleQuestions = computed<FormQuestion[]>(() => {
    const section = this.currentSection();
    if (!section) return [];
    const ans = this.answers();
    return section.questions.filter((q) => this.condEngine.isVisible(q, ans));
  });

  protected readonly totalAnswerable = computed<number>(() => {
    const ans = this.answers();
    return this.sections()
      .flatMap((s) => s.questions)
      .filter((q) => q.type !== 'info' && this.condEngine.isVisible(q, ans))
      .length;
  });

  protected readonly answeredCount = computed<number>(() => {
    const ans = this.answers();
    return this.sections()
      .flatMap((s) => s.questions)
      .filter((q) => q.type !== 'info' && this.condEngine.isVisible(q, ans) && ans.has(q.id))
      .length;
  });

  protected readonly progress = computed<number>(() => {
    const total = this.totalAnswerable();
    if (!total) return 0;
    return Math.round((this.answeredCount() / total) * 100);
  });

  protected readonly isFirstSection = computed(() => this.currentSectionIndex() === 0);
  protected readonly isLastSection  = computed(() => this.currentSectionIndex() === this.sections().length - 1);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.formsSvc.getById(id).subscribe({
      next:  (f) => { this.form.set(f); this.loading.set(false); },
      error: ()  => { this.error.set(true); this.loading.set(false); },
    });
  }

  protected onAnswered(questionId: string, value: unknown): void {
    const next = new Map(this.answers());
    next.set(questionId, value);
    this.answers.set(next);
  }

  protected prevSection(): void {
    if (!this.isFirstSection()) { this.currentSectionIndex.update((i) => i - 1); }
  }

  protected nextSection(): void {
    if (!this.isLastSection()) { this.currentSectionIndex.update((i) => i + 1); }
  }

  protected goBack(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.router.navigate([RouteConstants.FORMS, id, RouteConstants.FORM_BUILDER]);
  }
}
