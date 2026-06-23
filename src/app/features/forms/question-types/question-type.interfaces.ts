import { InputSignal, OutputEmitterRef } from '@angular/core';
import { FormQuestion } from '../models/form.model';

export interface CanvasQuestionComponent {
  readonly question: InputSignal<FormQuestion>;
  readonly selected: InputSignal<boolean>;
}

export interface PublicQuestionComponent {
  readonly question: InputSignal<FormQuestion>;
  readonly answered: OutputEmitterRef<unknown>;
}

export interface PropertiesQuestionComponent {
  readonly question: InputSignal<FormQuestion>;
  readonly changed: OutputEmitterRef<Partial<FormQuestion>>;
}
