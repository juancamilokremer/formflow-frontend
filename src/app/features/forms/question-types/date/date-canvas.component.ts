import { Component, input } from '@angular/core';
import { FormQuestion } from '../../models/form.model';
import { CanvasQuestionComponent } from '../question-type.interfaces';

@Component({
  selector: 'app-date-canvas',
  imports: [],
  templateUrl: './date-canvas.component.html',
  styleUrl: './date-canvas.component.scss',
})
export class DateCanvasComponent implements CanvasQuestionComponent {
  readonly question = input.required<FormQuestion>();
  readonly selected  = input<boolean>(false);
}
