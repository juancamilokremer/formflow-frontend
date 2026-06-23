import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { IconComponent } from '../../../../shared/icons/icon.component';
import { FormsService } from '../../services/forms.service';
import { FormDetail, FormQuestion, QuestionType, UpdateQuestionRequest } from '../../models/form.model';
import { getQuestionTypeDef } from '../../question-types/question-type.registry';
import { BuilderTopbarComponent } from './components/builder-topbar/builder-topbar.component';
import { FieldTypesPanelComponent } from './components/field-types-panel/field-types-panel.component';
import { BuilderCanvasComponent } from './components/builder-canvas/builder-canvas.component';
import { PropertiesPanelComponent } from './components/properties-panel/properties-panel.component';

@Component({
  selector: 'app-form-builder',
  imports: [
    TranslatePipe,
    IconComponent,
    BuilderTopbarComponent,
    FieldTypesPanelComponent,
    BuilderCanvasComponent,
    PropertiesPanelComponent,
  ],
  templateUrl: './form-builder.component.html',
  styleUrl: './form-builder.component.scss',
})
export class FormBuilderComponent implements OnInit {
  private readonly route        = inject(ActivatedRoute);
  private readonly formsService = inject(FormsService);
  private readonly translateSvc = inject(TranslateService);

  protected readonly loading   = signal(true);
  protected readonly loadError = signal(false);
  protected readonly form      = signal<FormDetail | null>(null);

  protected readonly selectedQuestionId = signal<string | null>(null);
  protected readonly activeSectionId    = signal<string | null>(null);

  protected readonly selectedQuestion = computed<FormQuestion | null>(() => {
    const id = this.selectedQuestionId();
    const f  = this.form();
    if (!id || !f) return null;
    for (const section of f.sections) {
      const q = section.questions.find((q) => q.id === id);
      if (q) return q;
    }
    return null;
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.formsService.getById(id).subscribe({
      next: (f) => {
        this.form.set(f);
        this.activeSectionId.set(f.sections[0]?.id ?? null);
        this.loading.set(false);
      },
      error: () => { this.loadError.set(true); this.loading.set(false); },
    });
  }

  protected onNameChanged(name: string): void {
    const form = this.form()!;
    this.formsService.update(form.id, name, form.description, form.timeLimitSeconds).subscribe({
      next: () => this.form.update((f) => (f ? { ...f, name } : f)),
    });
  }

  protected onPublishClicked(): void {
    // stub — implemented in a future issue
  }

  protected onSectionAdded(title: string): void {
    const id = this.form()!.id;
    this.formsService.createSection(id, { title }).subscribe({
      next: (section) => {
        this.form.update((f) => (f ? { ...f, sections: [...f.sections, section] } : f));
        this.activeSectionId.set(section.id);
      },
    });
  }

  protected onSectionUpdated(update: { id: string; title: string }): void {
    const id = this.form()!.id;
    this.formsService.updateSection(id, update.id, { title: update.title }).subscribe({
      next: () =>
        this.form.update((f) =>
          f
            ? { ...f, sections: f.sections.map((s) => s.id === update.id ? { ...s, title: update.title } : s) }
            : f,
        ),
    });
  }

  protected onSectionDeleted(sectionId: string): void {
    const id = this.form()!.id;
    this.formsService.deleteSection(id, sectionId).subscribe({
      next: () => {
        if (this.activeSectionId() === sectionId) {
          const remaining = this.form()!.sections.filter((s) => s.id !== sectionId);
          this.activeSectionId.set(remaining[0]?.id ?? null);
        }
        this.form.update((f) => f ? { ...f, sections: f.sections.filter((s) => s.id !== sectionId) } : f);
      },
    });
  }

  protected onTypeSelected(type: QuestionType): void {
    const f = this.form();
    if (!f) return;

    const sectionId = this.activeSectionId() ?? f.sections[0]?.id;
    if (!sectionId) return;

    const def   = getQuestionTypeDef(type);
    const title = this.translateSvc.instant('builder.question_default_title');

    this.formsService.addQuestion(f.id, sectionId, {
      type,
      title,
      required: false,
      config: def?.defaultConfig() ?? {},
    }).subscribe({
      next: (question) => {
        this.form.update((f) =>
          f
            ? {
                ...f,
                sections: f.sections.map((s) =>
                  s.id === sectionId ? { ...s, questions: [...s.questions, question] } : s,
                ),
              }
            : f,
        );
        this.selectedQuestionId.set(question.id);
        this.activeSectionId.set(sectionId);
      },
    });
  }

  protected onQuestionSelected(questionId: string): void {
    this.selectedQuestionId.set(questionId);
    const f = this.form();
    if (!f) return;
    for (const section of f.sections) {
      if (section.questions.some((q) => q.id === questionId)) {
        this.activeSectionId.set(section.id);
        break;
      }
    }
  }

  protected onQuestionDeleted(event: { sectionId: string; questionId: string }): void {
    const f = this.form();
    if (!f) return;

    this.formsService.deleteQuestion(f.id, event.sectionId, event.questionId).subscribe({
      next: () => {
        if (this.selectedQuestionId() === event.questionId) {
          this.selectedQuestionId.set(null);
        }
        this.form.update((f) =>
          f
            ? {
                ...f,
                sections: f.sections.map((s) =>
                  s.id === event.sectionId
                    ? { ...s, questions: s.questions.filter((q) => q.id !== event.questionId) }
                    : s,
                ),
              }
            : f,
        );
      },
    });
  }

  protected onQuestionChanged(change: Partial<FormQuestion>): void {
    const f          = this.form();
    const questionId = this.selectedQuestionId();
    if (!f || !questionId) return;

    for (const section of f.sections) {
      const question = section.questions.find((q) => q.id === questionId);
      if (question) {
        const merged = { ...question, ...change };
        const req: UpdateQuestionRequest = {
          title:            merged.title,
          required:         merged.required,
          description:      merged.description ?? null,
          categoryId:       merged.categoryId  ?? null,
          config:           merged.config,
        };

        this.formsService.updateQuestion(f.id, section.id, questionId, req).subscribe({
          next: (updated) =>
            this.form.update((f) =>
              f
                ? {
                    ...f,
                    sections: f.sections.map((s) =>
                      s.id === section.id
                        ? { ...s, questions: s.questions.map((q) => q.id === questionId ? updated : q) }
                        : s,
                    ),
                  }
                : f,
            ),
        });
        break;
      }
    }
  }
}
