import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '../../../shared/icons/icon.component';
import { PublicQuestionOutletComponent } from '../../forms/components/form-preview/components/public-question-outlet/public-question-outlet.component';
import { ConditionEngineService } from '../../forms/services/condition-engine.service';
import { PublicResponseService } from '../services/public-response.service';
import { AnswerPayload, PublicForm, PublicQuestion, PublicSection } from '../models/public-form.model';

type ResponderView = 'loading' | 'form' | 'confirmation' | 'not_found' | 'error';

@Component({
  selector: 'app-form-responder',
  imports: [TranslatePipe, IconComponent, PublicQuestionOutletComponent],
  templateUrl: './form-responder.component.html',
  styleUrl: './form-responder.component.scss',
})
export class FormResponderComponent implements OnInit {
  private readonly route      = inject(ActivatedRoute);
  private readonly svc        = inject(PublicResponseService);
  private readonly condEngine = inject(ConditionEngineService);

  protected readonly view        = signal<ResponderView>('loading');
  protected readonly form        = signal<PublicForm | null>(null);
  protected readonly submitting  = signal(false);
  protected readonly submitError = signal(false);

  protected readonly currentSectionIndex = signal(0);
  protected readonly answers             = signal<Map<string, unknown>>(new Map());
  protected readonly invalidIds          = signal<Set<string>>(new Set());

  private startedAt = new Date().toISOString();

  protected readonly sections = computed<PublicSection[]>(() => this.form()?.sections ?? []);

  protected readonly currentSection = computed<PublicSection | null>(
    () => this.sections()[this.currentSectionIndex()] ?? null,
  );

  protected readonly visibleQuestions = computed<PublicQuestion[]>(() => {
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
    return total ? Math.round((this.answeredCount() / total) * 100) : 0;
  });

  protected readonly isFirstSection = computed(() => this.currentSectionIndex() === 0);
  protected readonly isLastSection  = computed(
    () => this.currentSectionIndex() === this.sections().length - 1,
  );

  protected readonly primaryColor = computed(
    () => this.form()?.tenantPrimaryColor ?? null,
  );

  ngOnInit(): void {
    const formId = this.route.snapshot.paramMap.get('formId');
    if (!formId) {
      this.view.set('not_found');
      return;
    }
    this.svc.getForm(formId).subscribe({
      next:  (f) => { this.form.set(f); this.view.set('form'); },
      error: (e) => this.view.set(e?.status === 404 ? 'not_found' : 'error'),
    });
  }

  protected onAnswered(questionId: string, value: unknown): void {
    const next = new Map(this.answers());
    next.set(questionId, value);
    this.answers.set(next);

    if (this.invalidIds().has(questionId)) {
      const next = new Set(this.invalidIds());
      next.delete(questionId);
      this.invalidIds.set(next);
    }
  }

  protected prevSection(): void {
    if (!this.isFirstSection()) {
      this.invalidIds.set(new Set());
      this.currentSectionIndex.update((i) => i - 1);
    }
  }

  protected nextSection(): void {
    if (!this.validateCurrentSection()) return;
    this.currentSectionIndex.update((i) => i + 1);
  }

  protected submit(): void {
    if (!this.validateCurrentSection()) return;

    const f = this.form()!;
    const answers: AnswerPayload[] = [];
    for (const [questionId, value] of this.answers()) {
      answers.push({ questionId, value });
    }

    this.submitting.set(true);
    this.submitError.set(false);

    this.svc.submitResponse(f.formId, { answers, startedAt: this.startedAt }).subscribe({
      next:  () => this.view.set('confirmation'),
      error: () => {
        this.submitting.set(false);
        this.submitError.set(true);
      },
    });
  }

  private validateCurrentSection(): boolean {
    const ans        = this.answers();
    const violations = new Set(
      this.visibleQuestions()
        .filter((q) => q.required && q.type !== 'info' && !ans.has(q.id))
        .map((q) => q.id),
    );
    this.invalidIds.set(violations);
    return violations.size === 0;
  }

  protected isInvalid(questionId: string): boolean {
    return this.invalidIds().has(questionId);
  }
}
