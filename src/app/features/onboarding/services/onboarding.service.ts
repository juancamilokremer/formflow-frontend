import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, of, switchMap } from 'rxjs';
import { ConvocatoriaService } from '../../convocatorias/services/convocatoria.service';
import { FormsService } from '../../forms/services/forms.service';
import { ContainerKind } from '../../../core/constants/route.constants';
import { ProcessType } from '../../convocatorias/models/convocatoria.model';
import { CreatedOnboardingForm, OnboardingTemplate } from '../models/onboarding.model';

const DEFAULT_SECTION_TITLE = 'Preguntas';

/** No standalone "create form" endpoint exists — every form is born inside a
 *  convocatoria/encuesta container (create container, then create the form inside it). */
@Injectable({ providedIn: 'root' })
export class OnboardingService {
  private readonly convocatoriaService = inject(ConvocatoriaService);
  private readonly formsService = inject(FormsService);

  createFromTemplate(template: OnboardingTemplate): Observable<CreatedOnboardingForm> {
    return this.createContainerAndForm(template.defaultName, template.type).pipe(
      switchMap((created) => {
        if (template.questions.length === 0) return of(created);
        return this.formsService.createSection(created.formId, { title: DEFAULT_SECTION_TITLE }).pipe(
          switchMap((section) =>
            forkJoin(
              template.questions.map((question) =>
                this.formsService.addQuestion(created.formId, section.id, question)),
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
}
