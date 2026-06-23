import { Component, computed, inject, input, output } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CdkDropList, CdkDrag, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { SectionCardComponent } from '../section-card/section-card.component';
import { ScoreSummaryBarComponent } from '../score-summary-bar/score-summary-bar.component';
import {
  FormDetail, FormSection, FormType,
  QuestionMovedEvent, CanvasQuestionChangedEvent,
} from '../../../../models/form.model';

@Component({
  selector: 'app-builder-canvas',
  imports: [TranslatePipe, SectionCardComponent, ScoreSummaryBarComponent, CdkDropList, CdkDrag],
  templateUrl: './builder-canvas.component.html',
  styleUrl: './builder-canvas.component.scss',
})
export class BuilderCanvasComponent {
  private readonly translateSvc = inject(TranslateService);

  readonly form                = input.required<FormDetail>();
  readonly selectedQuestionId  = input<string | null>(null);
  readonly formType            = input<FormType | undefined>(undefined);

  readonly sectionAdded      = output<string>();
  readonly sectionUpdated    = output<{ id: string; title: string }>();
  readonly sectionDeleted    = output<string>();
  readonly sectionsReordered = output<string[]>();
  readonly questionSelected  = output<string>();
  readonly questionDeleted   = output<{ sectionId: string; questionId: string }>();
  readonly questionMoved     = output<QuestionMovedEvent>();
  readonly questionChanged   = output<CanvasQuestionChangedEvent>();

  protected readonly questionListIds = computed(() =>
    this.form().sections.map((s) => s.id),
  );

  protected readonly showScoreSummary = computed(() => {
    const t = this.formType();
    return (t === 'CANDIDATES' || t === 'DIAGNOSTIC') &&
      this.form().sections.some((s) =>
        s.questions.some((q) => (q.config['scoringType'] as string | undefined) &&
                                (q.config['scoringType'] as string) !== 'none'),
      );
  });

  protected onAddSection(): void {
    this.sectionAdded.emit(this.translateSvc.instant('builder.section_default_name'));
  }

  protected onSectionDrop(event: CdkDragDrop<FormSection[]>): void {
    const orderedIds = this.form().sections.map((s) => s.id);
    moveItemInArray(orderedIds, event.previousIndex, event.currentIndex);
    this.sectionsReordered.emit(orderedIds);
  }
}
