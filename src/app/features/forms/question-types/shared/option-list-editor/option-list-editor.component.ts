import { Component, effect, input, output, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { CdkDropList, CdkDrag, CdkDragHandle, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { IconComponent } from '../../../../../shared/icons/icon.component';
import { QuestionOption } from '../../../models/form.model';

@Component({
  selector: 'app-option-list-editor',
  imports: [TranslatePipe, IconComponent, CdkDropList, CdkDrag, CdkDragHandle],
  templateUrl: './option-list-editor.component.html',
  styleUrl: './option-list-editor.component.scss',
})
export class OptionListEditorComponent {
  readonly options     = input.required<QuestionOption[]>();
  readonly showScoring = input<boolean>(false);

  readonly optionsChanged = output<QuestionOption[]>();

  protected readonly localOptions = signal<QuestionOption[]>([]);

  constructor() {
    effect(() => {
      this.localOptions.set(this.options().map((option) => ({ ...option })));
    });
  }

  protected onDrop(event: CdkDragDrop<QuestionOption[]>): void {
    const reordered = [...this.localOptions()];
    moveItemInArray(reordered, event.previousIndex, event.currentIndex);
    this.localOptions.set(reordered);
    this.optionsChanged.emit(reordered);
  }

  protected onLabelBlur(id: string, event: FocusEvent): void {
    const label = (event.target as HTMLInputElement).value.trim();
    if (!label) return;
    const updated = this.localOptions().map((option) => option.id === id ? { ...option, label } : option);
    this.localOptions.set(updated);
    this.optionsChanged.emit(updated);
  }

  protected onScoreBlur(id: string, event: FocusEvent): void {
    const score = Math.max(0, Number((event.target as HTMLInputElement).value) || 0);
    const updated = this.localOptions().map((option) => option.id === id ? { ...option, score } : option);
    this.localOptions.set(updated);
    this.optionsChanged.emit(updated);
  }

  protected addOption(): void {
    this.localOptions.update((options) => [
      ...options,
      { id: crypto.randomUUID(), label: '' },
    ]);
  }

  protected removeOption(id: string): void {
    const updated = this.localOptions().filter((option) => option.id !== id);
    this.localOptions.set(updated);
    this.optionsChanged.emit(updated);
  }
}
