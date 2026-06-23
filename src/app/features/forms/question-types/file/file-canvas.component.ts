import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '../../../../shared/icons/icon.component';
import { FormQuestion } from '../../models/form.model';
import { CanvasQuestionComponent } from '../question-type.interfaces';

@Component({
  selector: 'app-file-canvas',
  imports: [TranslatePipe, IconComponent],
  templateUrl: './file-canvas.component.html',
  styleUrl: './file-canvas.component.scss',
})
export class FileCanvasComponent implements CanvasQuestionComponent {
  readonly question = input.required<FormQuestion>();
  readonly selected  = input<boolean>(false);
}
