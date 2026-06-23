import { InputSignal, OutputEmitterRef } from '@angular/core';
import { FormQuestion, FormType } from '../models/form.model';

export interface CanvasQuestionComponent {
  readonly question: InputSignal<FormQuestion>;
  readonly selected: InputSignal<boolean>;
  readonly questionChanged?: OutputEmitterRef<Partial<FormQuestion>>;
}

export interface PublicQuestionComponent {
  readonly question: InputSignal<FormQuestion>;
  readonly answered: OutputEmitterRef<unknown>;
}

export interface PropertiesQuestionComponent {
  readonly question: InputSignal<FormQuestion>;
  readonly changed: OutputEmitterRef<Partial<FormQuestion>>;
  readonly formType?: InputSignal<FormType | undefined>;
}
