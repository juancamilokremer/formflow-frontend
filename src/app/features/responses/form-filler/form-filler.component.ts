import { Component, DestroyRef, computed, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '../../../shared/icons/icon.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { PublicQuestionOutletComponent } from '../../forms/components/form-preview/components/public-question-outlet/public-question-outlet.component';
import { TimeLimitCountdownComponent } from '../components/time-limit-countdown/time-limit-countdown.component';
import { ConditionEngineService } from '../../forms/services/condition-engine.service';
import {
  AnswerPayload,
  PublicForm,
  PublicQuestion,
  PublicSection,
  SubmitPublicResponsePayload,
  SubmitPublicResponseResult,
} from '../models/public-form.model';

type FillerView = 'form' | 'confirmation';

type SectionBlock =
  | { kind: 'group'; questions: PublicQuestion[] }
  | { kind: 'timed'; question: PublicQuestion };

@Component({
  selector: 'app-form-filler',
  imports: [TranslatePipe, IconComponent, ButtonComponent, PublicQuestionOutletComponent, TimeLimitCountdownComponent],
  templateUrl: './form-filler.component.html',
  styleUrl: './form-filler.component.scss',
})
export class FormFillerComponent {
  private readonly condEngine = inject(ConditionEngineService);
  private readonly destroyRef = inject(DestroyRef);

  readonly form                = input.required<PublicForm>();
  readonly submitFn            = input.required<(payload: SubmitPublicResponsePayload) => Observable<SubmitPublicResponseResult>>();
  readonly candidateName       = input<string | null>(null);
  readonly convocatoriaName    = input<string | null>(null);
  readonly showBackToChecklist = input(false);

  readonly backToChecklist = output<void>();

  protected readonly view        = signal<FillerView>('form');
  protected readonly submitting  = signal(false);
  protected readonly submitError = signal(false);

  protected readonly currentSectionIndex   = signal(0);
  protected readonly currentBlockIndex     = signal(0);
  protected readonly answers               = signal<Map<string, unknown>>(new Map());
  protected readonly invalidIds            = signal<Set<string>>(new Set());
  protected readonly completedTimedBlocks  = signal<Map<string, 'timeout' | 'manual'>>(new Map());

  private readonly startedAt = new Date().toISOString();

  protected readonly sections = computed<PublicSection[]>(() => this.form().sections);

  protected readonly currentSection = computed<PublicSection | null>(
    () => this.sections()[this.currentSectionIndex()] ?? null,
  );

  protected readonly visibleQuestions = computed<PublicQuestion[]>(() => {
    const section = this.currentSection();
    if (!section) return [];
    const ans = this.answers();
    return section.questions.filter((q) => this.condEngine.isVisible(q, ans));
  });

  protected readonly blocks = computed<SectionBlock[]>(() => {
    const result: SectionBlock[] = [];
    let group: PublicQuestion[] = [];
    for (const q of this.visibleQuestions()) {
      if (q.timeLimitSeconds && q.type !== 'info') {
        if (group.length) { result.push({ kind: 'group', questions: group }); group = []; }
        result.push({ kind: 'timed', question: q });
      } else {
        group.push(q);
      }
    }
    if (group.length) result.push({ kind: 'group', questions: group });
    return result;
  });

  protected readonly currentBlock = computed<SectionBlock | null>(
    () => this.blocks()[this.currentBlockIndex()] ?? null,
  );

  protected readonly currentBlockQuestions = computed<PublicQuestion[]>(() => {
    const block = this.currentBlock();
    if (!block) return [];
    return block.kind === 'group' ? block.questions : [block.question];
  });

  protected readonly isLastBlockOfSection = computed(
    () => this.currentBlockIndex() === this.blocks().length - 1,
  );

  protected readonly isCurrentBlockResolved = computed(() => {
    const block = this.currentBlock();
    if (!block) return true;
    return block.kind === 'group' || this.completedTimedBlocks().has(block.question.id);
  });

  protected readonly isFirstStep = computed(
    () => this.isFirstSection() && this.currentBlockIndex() === 0,
  );

  protected readonly canGoBack = computed(() => {
    if (this.isFirstStep()) return false;
    const block = this.currentBlock();
    return !(block?.kind === 'timed' && !this.completedTimedBlocks().has(block.question.id));
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
    () => this.form().tenantPrimaryColor ?? null,
  );

  protected onAnswered(questionId: string, value: unknown): void {
    const next = new Map(this.answers());
    next.set(questionId, value);
    this.answers.set(next);

    if (this.invalidIds().has(questionId)) {
      const ids = new Set(this.invalidIds());
      ids.delete(questionId);
      this.invalidIds.set(ids);
    }
  }

  protected prevStep(): void {
    if (!this.canGoBack()) return;

    const blocks = this.blocks();
    let idx = this.currentBlockIndex() - 1;
    while (idx >= 0 && blocks[idx].kind === 'timed') idx--;

    if (idx >= 0) {
      this.invalidIds.set(new Set());
      this.currentBlockIndex.set(idx);
      return;
    }

    if (this.isFirstSection()) return;
    this.invalidIds.set(new Set());
    this.currentSectionIndex.update((i) => i - 1);
    this.currentBlockIndex.set(this.firstOpenBlockIndex());
  }

  protected nextStep(): void {
    const block = this.currentBlock();
    if (!block || !this.validateBlock(block)) return;

    if (block.kind === 'timed') this.markBlockCompleted(block.question.id, 'manual');
    this.advanceAfterBlock();
  }

  protected onTimedBlockExpired(question: PublicQuestion): void {
    this.invalidIds.set(new Set());
    this.markBlockCompleted(question.id, 'timeout');
    this.advanceAfterBlock();
  }

  private markBlockCompleted(questionId: string, mode: 'timeout' | 'manual'): void {
    const next = new Map(this.completedTimedBlocks());
    next.set(questionId, mode);
    this.completedTimedBlocks.set(next);
  }

  private advanceAfterBlock(): void {
    if (!this.isLastBlockOfSection()) {
      this.currentBlockIndex.update((i) => i + 1);
      return;
    }
    if (!this.isLastSection()) {
      this.invalidIds.set(new Set());
      this.currentSectionIndex.update((i) => i + 1);
      this.currentBlockIndex.set(0);
    }
  }

  private firstOpenBlockIndex(): number {
    const blocks = this.blocks();
    const completed = this.completedTimedBlocks();
    const idx = blocks.findIndex((b) => b.kind === 'group' || !completed.has(b.question.id));
    return idx >= 0 ? idx : 0;
  }

  protected submit(): void {
    if (!this.validateBlock(this.currentBlock())) return;

    const payload = this.buildPayload();
    this.submitting.set(true);
    this.submitError.set(false);

    this.submitFn()(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next:  () => this.view.set('confirmation'),
        error: () => {
          this.submitting.set(false);
          this.submitError.set(true);
        },
      });
  }

  private buildPayload(): SubmitPublicResponsePayload {
    const answers: AnswerPayload[] = [];
    for (const [questionId, value] of this.answers()) {
      answers.push({ questionId, value });
    }
    return { answers, startedAt: this.startedAt };
  }

  private validateBlock(block: SectionBlock | null): boolean {
    if (!block) return true;
    if (block.kind === 'timed' && this.completedTimedBlocks().has(block.question.id)) {
      this.invalidIds.set(new Set());
      return true;
    }

    const questions = block.kind === 'group' ? block.questions : [block.question];
    const ans       = this.answers();
    const violations = new Set(
      questions.filter((q) => q.required && q.type !== 'info' && !ans.has(q.id)).map((q) => q.id),
    );
    this.invalidIds.set(violations);
    return violations.size === 0;
  }

  protected isInvalid(questionId: string): boolean {
    return this.invalidIds().has(questionId);
  }
}
