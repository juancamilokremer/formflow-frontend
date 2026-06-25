import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { IconComponent } from '../../../../shared/icons/icon.component';
import { FormsService } from '../../services/forms.service';
import {
  FormDetail, FormSection, FormQuestion, QuestionType,
  AddQuestionRequest, UpdateQuestionRequest, QuestionMovedEvent, CanvasQuestionChangedEvent,
  ConditionalLogicConfig,
} from '../../models/form.model';
import { getQuestionTypeDef } from '../../question-types/question-type.registry';
import { BuilderTopbarComponent } from './components/builder-topbar/builder-topbar.component';
import { FieldTypesPanelComponent } from './components/field-types-panel/field-types-panel.component';
import { BuilderCanvasComponent } from './components/builder-canvas/builder-canvas.component';
import { PropertiesPanelComponent } from './components/properties-panel/properties-panel.component';
import { ConditionalLogicDrawerComponent } from './components/conditional-logic-drawer/conditional-logic-drawer.component';

@Component({
  selector: 'app-form-builder',
  imports: [
    TranslatePipe,
    IconComponent,
    BuilderTopbarComponent,
    FieldTypesPanelComponent,
    BuilderCanvasComponent,
    PropertiesPanelComponent,
    ConditionalLogicDrawerComponent,
  ],
  templateUrl: './form-builder.component.html',
  styleUrl: './form-builder.component.scss',
})
export class FormBuilderComponent implements OnInit {
  private readonly route              = inject(ActivatedRoute);
  private readonly router             = inject(Router);
  private readonly formsService       = inject(FormsService);
  private readonly translateSvc       = inject(TranslateService);
  private readonly breakpointObserver = inject(BreakpointObserver);

  protected readonly isMobile = toSignal(
    this.breakpointObserver.observe('(max-width: 767px)').pipe(map((state) => state.matches)),
    { initialValue: false },
  );

  protected goToForms(): void {
    this.router.navigate(['/forms']);
  }

  protected readonly loading   = signal(true);
  protected readonly loadError = signal(false);
  protected readonly form      = signal<FormDetail | null>(null);

  protected readonly selectedQuestionId = signal<string | null>(null);
  protected readonly activeSectionId    = signal<string | null>(null);
  protected readonly drawerOpen         = signal(false);

  protected readonly selectedQuestion = computed<FormQuestion | null>(() => {
    const questionId  = this.selectedQuestionId();
    const currentForm = this.form();
    if (!questionId || !currentForm) return null;
    for (const section of currentForm.sections) {
      const question = section.questions.find((question) => question.id === questionId);
      if (question) return question;
    }
    return null;
  });

  ngOnInit(): void {
    const formId = this.route.snapshot.paramMap.get('id')!;
    this.formsService.getById(formId).subscribe({
      next: (form) => {
        this.form.set(form);
        this.activeSectionId.set(form.sections[0]?.id ?? null);
        this.loading.set(false);
      },
      error: () => { this.loadError.set(true); this.loading.set(false); },
    });
  }

  // ---------------------------------------------------------------------------
  // Form-level handlers
  // ---------------------------------------------------------------------------

  protected onNameChanged(name: string): void {
    const currentForm = this.form()!;
    this.formsService.update(currentForm.id, name, currentForm.description, currentForm.timeLimitSeconds).subscribe({
      next: () => this.form.update((current) => (current ? { ...current, name } : current)),
    });
  }

  protected onPublishClicked(): void {
    // stub — implemented in a future issue
  }

  // ---------------------------------------------------------------------------
  // Section handlers
  // ---------------------------------------------------------------------------

  protected onSectionAdded(title: string): void {
    const formId = this.form()!.id;
    this.formsService.createSection(formId, { title }).subscribe({
      next: (section) => {
        this.form.update((current) =>
          current ? { ...current, sections: [...current.sections, section] } : current,
        );
        this.activeSectionId.set(section.id);
      },
    });
  }

  protected onSectionUpdated(update: { id: string; title: string }): void {
    const formId = this.form()!.id;
    this.formsService.updateSection(formId, update.id, { title: update.title }).subscribe({
      next: () => this.mapSection(update.id, (section) => ({ ...section, title: update.title })),
    });
  }

  protected onSectionDeleted(sectionId: string): void {
    const formId = this.form()!.id;
    this.formsService.deleteSection(formId, sectionId).subscribe({
      next: () => {
        if (this.activeSectionId() === sectionId) {
          const remaining = this.form()!.sections.filter((section) => section.id !== sectionId);
          this.activeSectionId.set(remaining[0]?.id ?? null);
        }
        this.form.update((current) =>
          current
            ? { ...current, sections: current.sections.filter((section) => section.id !== sectionId) }
            : current,
        );
      },
    });
  }

  protected onSectionsReordered(orderedIds: string[]): void {
    const currentForm = this.form()!;
    this.form.update((current) =>
      current
        ? { ...current, sections: orderedIds.map((sectionId) => current.sections.find((section) => section.id === sectionId)!) }
        : current,
    );
    this.formsService.reorderSections(currentForm.id, orderedIds).subscribe();
  }

  // ---------------------------------------------------------------------------
  // Question handlers
  // ---------------------------------------------------------------------------

  protected onTypeSelected(type: QuestionType): void {
    const currentForm = this.form();
    if (!currentForm) return;

    const sectionId = this.activeSectionId() ?? currentForm.sections[0]?.id;
    if (!sectionId) return;

    const def   = getQuestionTypeDef(type);
    const title = this.translateSvc.instant('builder.question_default_title');

    this.formsService.addQuestion(currentForm.id, sectionId, {
      type,
      title,
      required: false,
      config: def?.defaultConfig() ?? {},
    }).subscribe({
      next: (question) => {
        this.mapSection(sectionId, (section) => ({
          ...section,
          questions: [...section.questions, question],
        }));
        this.selectedQuestionId.set(question.id);
        this.activeSectionId.set(sectionId);
      },
    });
  }

  protected onQuestionSelected(questionId: string): void {
    this.drawerOpen.set(false);
    this.selectedQuestionId.set(questionId);
    const currentForm = this.form();
    if (!currentForm) return;
    for (const section of currentForm.sections) {
      if (section.questions.some((question) => question.id === questionId)) {
        this.activeSectionId.set(section.id);
        break;
      }
    }
  }

  protected onQuestionDeleted(event: { sectionId: string; questionId: string }): void {
    const currentForm = this.form();
    if (!currentForm) return;

    this.formsService.deleteQuestion(currentForm.id, event.sectionId, event.questionId).subscribe({
      next: () => {
        if (this.selectedQuestionId() === event.questionId) {
          this.selectedQuestionId.set(null);
        }
        this.mapSection(event.sectionId, (section) => ({
          ...section,
          questions: section.questions.filter((question) => question.id !== event.questionId),
        }));
      },
    });
  }

  protected onQuestionMoved(event: QuestionMovedEvent): void {
    const currentForm = this.form()!;

    if (event.fromSectionId === event.toSectionId) {
      this.mapSection(event.fromSectionId, (section) => ({
        ...section,
        questions: event.orderedToIds.map((questionId) =>
          section.questions.find((question) => question.id === questionId)!,
        ),
      }));
      this.formsService.reorderQuestions(currentForm.id, event.fromSectionId, event.orderedToIds).subscribe();
    } else {
      const movedQuestion = currentForm.sections
        .find((section) => section.id === event.fromSectionId)!
        .questions.find((question) => question.id === event.questionId)!;

      this.form.update((current) =>
        current
          ? {
              ...current,
              sections: current.sections.map((section) => {
                if (section.id === event.fromSectionId) {
                  return { ...section, questions: section.questions.filter((question) => question.id !== event.questionId) };
                }
                if (section.id === event.toSectionId) {
                  return {
                    ...section,
                    questions: event.orderedToIds.map((questionId) =>
                      questionId === event.questionId
                        ? movedQuestion
                        : section.questions.find((question) => question.id === questionId)!,
                    ),
                  };
                }
                return section;
              }),
            }
          : current,
      );

      if (this.selectedQuestionId() === event.questionId) {
        this.selectedQuestionId.set(null);
      }

      const addRequest: AddQuestionRequest = {
        type:        movedQuestion.type,
        title:       movedQuestion.title,
        required:    movedQuestion.required,
        description: movedQuestion.description ?? undefined,
        categoryId:  movedQuestion.categoryId  ?? undefined,
        config:      movedQuestion.config,
      };

      this.formsService.addQuestion(currentForm.id, event.toSectionId, addRequest).subscribe({
        next: (newQuestion) => {
          this.replaceQuestion(event.toSectionId, event.questionId, newQuestion);
          this.formsService.deleteQuestion(currentForm.id, event.fromSectionId, event.questionId).subscribe();
        },
      });
    }
  }

  protected onConditionalLogicSaved(config: ConditionalLogicConfig | null): void {
    this.onQuestionChanged({ conditionalLogic: config });
    this.drawerOpen.set(false);
  }

  protected onQuestionChanged(change: Partial<FormQuestion>): void {
    const currentForm = this.form();
    const questionId  = this.selectedQuestionId();
    if (!currentForm || !questionId) return;

    for (const section of currentForm.sections) {
      const question = section.questions.find((question) => question.id === questionId);
      if (question) {
        this.saveQuestionChange(currentForm.id, section.id, questionId, question, change);
        break;
      }
    }
  }

  protected onCanvasQuestionChanged(event: CanvasQuestionChangedEvent): void {
    const currentForm = this.form();
    if (!currentForm) return;

    const section  = currentForm.sections.find((section) => section.id === event.sectionId);
    if (!section) return;
    const question = section.questions.find((question) => question.id === event.questionId);
    if (!question) return;

    this.saveQuestionChange(currentForm.id, event.sectionId, event.questionId, question, event.change);
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private mapSection(sectionId: string, transform: (section: FormSection) => FormSection): void {
    this.form.update((current) =>
      current
        ? {
            ...current,
            sections: current.sections.map((section) =>
              section.id === sectionId ? transform(section) : section,
            ),
          }
        : current,
    );
  }

  private replaceQuestion(sectionId: string, questionId: string, updated: FormQuestion): void {
    this.mapSection(sectionId, (section) => ({
      ...section,
      questions: section.questions.map((question) =>
        question.id === questionId ? updated : question,
      ),
    }));
  }

  private saveQuestionChange(
    formId: string,
    sectionId: string,
    questionId: string,
    question: FormQuestion,
    change: Partial<FormQuestion>,
  ): void {
    const merged  = { ...question, ...change };
    const request: UpdateQuestionRequest = {
      type:             merged.type,
      title:            merged.title,
      required:         merged.required,
      description:      merged.description      ?? null,
      categoryId:       merged.categoryId       ?? null,
      config:           merged.config,
      conditionalLogic: merged.conditionalLogic ?? null,
    };

    this.formsService.updateQuestion(formId, sectionId, questionId, request).subscribe({
      next: (updatedQuestion) => this.replaceQuestion(sectionId, questionId, updatedQuestion),
    });
  }
}
