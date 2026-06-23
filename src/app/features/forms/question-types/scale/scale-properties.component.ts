import { Component, effect, input, output, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { FormQuestion } from '../../models/form.model';
import { PropertiesQuestionComponent } from '../question-type.interfaces';

@Component({
  selector: 'app-scale-properties',
  imports: [TranslatePipe],
  templateUrl: './scale-properties.component.html',
  styleUrl: './scale-properties.component.scss',
})
export class ScalePropertiesComponent implements PropertiesQuestionComponent {
  readonly question = input.required<FormQuestion>();
  readonly changed  = output<Partial<FormQuestion>>();

  protected readonly scaleMax  = signal(5);
  protected readonly minLabel  = signal('');
  protected readonly maxLabel  = signal('');

  constructor() {
    effect(() => {
      const cfg = this.question().config;
      this.scaleMax.set((cfg['max'] as number) ?? 5);
      this.minLabel.set((cfg['minLabel'] as string) ?? '');
      this.maxLabel.set((cfg['maxLabel'] as string) ?? '');
    });
  }

  protected onTitleBlur(event: FocusEvent): void {
    const title = (event.target as HTMLInputElement).value.trim();
    if (title && title !== this.question().title) this.changed.emit({ title });
  }

  protected onRequiredChange(event: Event): void {
    this.changed.emit({ required: (event.target as HTMLInputElement).checked });
  }

  protected onDescriptionBlur(event: FocusEvent): void {
    const description = (event.target as HTMLTextAreaElement).value.trim() || null;
    if (description !== this.question().description) this.changed.emit({ description });
  }

  protected onScaleSizeChange(event: Event): void {
    const max = Number((event.target as HTMLSelectElement).value);
    this.scaleMax.set(max);
    this.changed.emit({ config: { ...this.question().config, min: 1, max } });
  }

  protected onMinLabelBlur(event: FocusEvent): void {
    const minLabel = (event.target as HTMLInputElement).value;
    this.changed.emit({ config: { ...this.question().config, minLabel } });
  }

  protected onMaxLabelBlur(event: FocusEvent): void {
    const maxLabel = (event.target as HTMLInputElement).value;
    this.changed.emit({ config: { ...this.question().config, maxLabel } });
  }
}
