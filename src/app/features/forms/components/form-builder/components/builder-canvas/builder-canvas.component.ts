import { Component, inject, input, output } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { SectionCardComponent } from '../section-card/section-card.component';
import { FormDetail } from '../../../../models/form.model';

@Component({
  selector: 'app-builder-canvas',
  imports: [TranslatePipe, SectionCardComponent],
  templateUrl: './builder-canvas.component.html',
  styleUrl: './builder-canvas.component.scss',
})
export class BuilderCanvasComponent {
  private readonly translateSvc = inject(TranslateService);

  readonly form                = input.required<FormDetail>();
  readonly selectedQuestionId  = input<string | null>(null);

  readonly sectionAdded    = output<string>();
  readonly sectionUpdated  = output<{ id: string; title: string }>();
  readonly sectionDeleted  = output<string>();
  readonly questionSelected = output<string>();
  readonly questionDeleted  = output<{ sectionId: string; questionId: string }>();

  protected onAddSection(): void {
    this.sectionAdded.emit(this.translateSvc.instant('builder.section_default_name'));
  }
}
