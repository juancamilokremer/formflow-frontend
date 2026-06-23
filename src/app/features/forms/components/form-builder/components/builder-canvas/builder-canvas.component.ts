import { Component, inject, input, output } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { IconComponent } from '../../../../../../shared/icons/icon.component';
import { ButtonComponent } from '../../../../../../shared/components/button/button.component';
import { SectionCardComponent } from '../section-card/section-card.component';
import { FormDetail } from '../../../../models/form.model';

@Component({
  selector: 'app-builder-canvas',
  imports: [TranslatePipe, IconComponent, ButtonComponent, SectionCardComponent],
  templateUrl: './builder-canvas.component.html',
  styleUrl: './builder-canvas.component.scss',
})
export class BuilderCanvasComponent {
  private readonly translateSvc = inject(TranslateService);

  readonly form = input.required<FormDetail>();

  readonly sectionAdded   = output<string>();
  readonly sectionUpdated = output<{ id: string; title: string }>();
  readonly sectionDeleted = output<string>();

  protected onAddSection(): void {
    this.sectionAdded.emit(this.translateSvc.instant('builder.section_default_name'));
  }
}
