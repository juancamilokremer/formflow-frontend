import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { FormQuestion } from '../models/form.model';

export interface CanvasEditEvent {
  questionId: string;
  change: Partial<FormQuestion>;
}

@Injectable()
export class CanvasEditService {
  private readonly _change$ = new Subject<CanvasEditEvent>();
  readonly change$ = this._change$.asObservable();

  emit(questionId: string, change: Partial<FormQuestion>): void {
    this._change$.next({ questionId, change });
  }
}
