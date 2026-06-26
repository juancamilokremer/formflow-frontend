import { Component, DestroyRef, computed, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgComponentOutlet } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  CdkDropList, CdkDrag, CdkDragHandle,
  CdkDragDrop, moveItemInArray,
} from '@angular/cdk/drag-drop';
import { IconComponent } from '../../../../../../shared/icons/icon.component';
import { ConfirmDialogComponent } from '../../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import {
  FormSection, FormQuestion, FormType, QuestionType,
  QuestionMovedEvent, CanvasQuestionChangedEvent,
} from '../../../../models/form.model';
import { getQuestionTypeDef } from '../../../../question-types/question-type.registry';
import { CanvasEditService } from '../../../../services/canvas-edit.service';

@Component({
  selector: 'app-section-card',
  imports: [TranslatePipe, IconComponent, ConfirmDialogComponent, NgComponentOutlet,
            CdkDropList, CdkDrag, CdkDragHandle],
  templateUrl: './section-card.component.html',
  styleUrl: './section-card.component.scss',
  providers: [CanvasEditService],
})
export class SectionCardComponent {
  private readonly canvasEditSvc = inject(CanvasEditService);
  private readonly destroyRef    = inject(DestroyRef);

  readonly section             = input.required<FormSection>();
  readonly selectedQuestionId  = input<string | null>(null);
  readonly isActive            = input(false);
  readonly connectedListIds    = input<string[]>([]);
  readonly formType            = input<FormType | undefined>(undefined);

  readonly sectionUpdated    = output<{ id: string; title: string }>();
  readonly sectionDeleted    = output<string>();
  readonly sectionActivated  = output<string>();
  readonly questionSelected  = output<string>();
  readonly questionDeleted   = output<{ sectionId: string; questionId: string }>();
  readonly questionMoved     = output<QuestionMovedEvent>();
  readonly questionChanged   = output<CanvasQuestionChangedEvent>();

  protected readonly isEditing         = signal(false);
  protected readonly editTitle         = signal('');
  protected readonly showDeleteConfirm = signal(false);

  protected readonly showScoring = computed(() => {
    const t = this.formType();
    return t === 'CANDIDATES' || t === 'DIAGNOSTIC';
  });

  protected getScoringType(question: FormQuestion): string {
    return (question.config['scoringType'] as string) ?? 'none';
  }

  constructor() {
    this.canvasEditSvc.change$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((evt) => {
      this.questionChanged.emit({
        questionId: evt.questionId,
        sectionId:  this.section().id,
        change:     evt.change,
      });
    });
  }

  protected getCanvasDef(type: QuestionType) {
    return getQuestionTypeDef(type);
  }

  protected getCanvasInputs(questionId: string): Record<string, unknown> {
    const question = this.section().questions.find((q) => q.id === questionId)!;
    return { question, selected: this.selectedQuestionId() === questionId };
  }

  protected onQuestionClick(id: string): void {
    this.questionSelected.emit(id);
  }

  protected onDeleteQuestion(event: MouseEvent, questionId: string): void {
    event.stopPropagation();
    this.questionDeleted.emit({ sectionId: this.section().id, questionId });
  }

  protected onQuestionDrop(event: CdkDragDrop<FormQuestion[]>): void {
    const question: FormQuestion = event.item.data;

    if (event.previousContainer === event.container) {
      const orderedToIds = this.section().questions.map((q) => q.id);
      moveItemInArray(orderedToIds, event.previousIndex, event.currentIndex);
      this.questionMoved.emit({
        questionId:    question.id,
        fromSectionId: this.section().id,
        toSectionId:   this.section().id,
        orderedToIds,
      });
    } else {
      const fromSectionId = event.previousContainer.id;
      const orderedToIds  = this.section().questions.map((q) => q.id);
      orderedToIds.splice(event.currentIndex, 0, question.id);
      this.questionMoved.emit({
        questionId: question.id,
        fromSectionId,
        toSectionId: this.section().id,
        orderedToIds,
      });
    }
  }

  protected startEdit(): void {
    this.editTitle.set(this.section().title);
    this.isEditing.set(true);
  }

  protected saveEdit(value: string): void {
    const trimmed = value.trim();
    if (trimmed && trimmed !== this.section().title) {
      this.sectionUpdated.emit({ id: this.section().id, title: trimmed });
    }
    this.isEditing.set(false);
  }

  protected cancelEdit(): void {
    this.isEditing.set(false);
  }

  protected onTitleBlur(event: FocusEvent): void {
    this.saveEdit((event.target as HTMLInputElement).value);
  }

  protected onTitleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter')  { (event.target as HTMLInputElement).blur(); }
    if (event.key === 'Escape') { this.cancelEdit(); }
  }

  protected confirmDelete(): void  { this.showDeleteConfirm.set(true); }
  protected cancelDelete(): void   { this.showDeleteConfirm.set(false); }

  protected doDelete(): void {
    this.sectionDeleted.emit(this.section().id);
    this.showDeleteConfirm.set(false);
  }
}
