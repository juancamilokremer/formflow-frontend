import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, forkJoin, of, switchMap } from 'rxjs';
import { ConvocatoriaService } from '../../convocatorias/services/convocatoria.service';
import { FormsService } from '../../forms/services/forms.service';
import { ContainerKind } from '../../../core/constants/route.constants';
import { ProcessType } from '../../convocatorias/models/convocatoria.model';
import { AddQuestionRequest, QuestionOption } from '../../forms/models/form.model';
import { CreatedOnboardingForm, OnboardingQuestion, OnboardingTemplate } from '../models/onboarding.model';

const LIKERT_MIN = 1;
const LIKERT_MAX = 5;

/** No standalone "create form" endpoint exists — every form is born inside a
 *  convocatoria/encuesta container (create container, then create the form inside it). */
@Injectable({ providedIn: 'root' })
export class OnboardingService {
  private readonly convocatoriaService = inject(ConvocatoriaService);
  private readonly formsService = inject(FormsService);
  private readonly translate = inject(TranslateService);

  createFromTemplate(template: OnboardingTemplate): Observable<CreatedOnboardingForm> {
    const name = this.translate.instant(template.nameKey);
    return this.createContainerAndForm(name, template.type).pipe(
      switchMap((created) => {
        if (template.questions.length === 0) return of(created);
        const sectionTitle = this.translate.instant('onboarding.template.default_section_title');
        return this.formsService.createSection(created.formId, { title: sectionTitle }).pipe(
          switchMap((section) =>
            forkJoin(
              template.questions.map((question) =>
                this.formsService.addQuestion(created.formId, section.id, this.toAddQuestionRequest(question))),
            ),
          ),
          switchMap(() => of(created)),
        );
      }),
    );
  }

  createBlank(type: ProcessType, name: string): Observable<CreatedOnboardingForm> {
    return this.createContainerAndForm(name, type);
  }

  private createContainerAndForm(name: string, type: ProcessType): Observable<CreatedOnboardingForm> {
    return this.convocatoriaService.create({ name, type }).pipe(
      switchMap((detail) =>
        this.convocatoriaService
          .createForm(detail.id, { name, type, weight: 100, categoryWeights: [], minScore: null })
          .pipe(
            switchMap((form) =>
              of({ containerId: detail.id, containerKind: this.containerKindFor(type), formId: form.formId })),
          ),
      ),
    );
  }

  /** Registration-type containers route under /encuestas, everything else under
   *  /convocatorias — same split EncuestaCreateComponent/ConvocatoriaCreateComponent use. */
  private containerKindFor(type: ProcessType): ContainerKind {
    return type === 'REGISTRATION' ? 'encuestas' : 'convocatorias';
  }

  private toAddQuestionRequest(question: OnboardingQuestion): AddQuestionRequest {
    const title = this.translate.instant(question.titleKey);
    switch (question.type) {
      case 'text':
        return { type: 'text', title, required: question.required, config: { placeholder: '' } };
      case 'single':
        return {
          type: 'single',
          title,
          required: question.required,
          config: { scoringType: 'none', options: question.optionLabelKeys.map((key) => this.toOption(key)) },
        };
      case 'scale':
        return {
          type: 'scale',
          title,
          required: question.required,
          config: {
            min: LIKERT_MIN,
            max: LIKERT_MAX,
            minLabel: this.translate.instant('onboarding.templates.diagnostic.scale.min_label'),
            maxLabel: this.translate.instant('onboarding.templates.diagnostic.scale.max_label'),
            scoringType: 'none',
          },
        };
    }
  }

  private toOption(labelKey: string): QuestionOption {
    return { id: crypto.randomUUID(), label: this.translate.instant(labelKey) };
  }
}
