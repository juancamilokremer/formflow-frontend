import { Component, input, output, signal } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '../../../../../../shared/icons/icon.component';
import { ConfirmDialogComponent } from '../../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { FormSection, QuestionType } from '../../../../models/form.model';
import { getQuestionTypeDef } from '../../../../question-types/question-type.registry';

@Component({
  selector: 'app-section-card',
  imports: [TranslatePipe, IconComponent, ConfirmDialogComponent, NgComponentOutlet],
  templateUrl: './section-card.component.html',
  styleUrl: './section-card.component.scss',
})
export class SectionCardComponent {
  readonly section             = input.required<FormSection>();
  readonly selectedQuestionId  = input<string | null>(null);

  readonly sectionUpdated   = output<{ id: string; title: string }>();
  readonly sectionDeleted   = output<string>();
  readonly questionSelected = output<string>();
  readonly questionDeleted  = output<{ sectionId: string; questionId: string }>();

  protected readonly isEditing         = signal(false);
  protected readonly editTitle         = signal('');
  protected readonly showDeleteConfirm = signal(false);

  protected getCanvasDef(type: QuestionType) {
    return getQuestionTypeDef(type);
  }

  protected getCanvasInputs(questionId: string, type: QuestionType): Record<string, unknown> {
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
