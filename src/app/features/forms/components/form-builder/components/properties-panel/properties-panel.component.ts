import { Component, ComponentRef, OnDestroy, ViewChild, ViewContainerRef, computed, effect, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '../../../../../../shared/icons/icon.component';
import { FormQuestion, QuestionType } from '../../../../models/form.model';
import { getQuestionTypeDef } from '../../../../question-types/question-type.registry';
import { PropertiesQuestionComponent } from '../../../../question-types/question-type.interfaces';

@Component({
  selector: 'app-properties-panel',
  imports: [TranslatePipe, IconComponent],
  templateUrl: './properties-panel.component.html',
  styleUrl: './properties-panel.component.scss',
})
export class PropertiesPanelComponent implements OnDestroy {
  readonly question        = input<FormQuestion | null>(null);
  readonly questionChanged = output<Partial<FormQuestion>>();

  protected readonly hasQuestion = computed(() => {
    const q = this.question();
    return !!(q && getQuestionTypeDef(q.type));
  });

  @ViewChild('outlet', { read: ViewContainerRef })
  private outlet!: ViewContainerRef;

  private compRef?: ComponentRef<PropertiesQuestionComponent>;
  private currentType?: QuestionType;

  constructor() {
    effect(() => {
      const q = this.question();
      this.updateDynamicComponent(q);
    });
  }

  private updateDynamicComponent(q: FormQuestion | null): void {
    if (!this.outlet) return;

    const def = q ? getQuestionTypeDef(q.type) : undefined;

    if (!def) {
      this.destroyDynamicComponent();
      return;
    }

    if (this.currentType !== q!.type) {
      this.destroyDynamicComponent();
      this.currentType = q!.type;
      this.compRef = this.outlet.createComponent(def.propertiesComponent);
      this.compRef.instance.changed.subscribe((change) =>
        this.questionChanged.emit(change),
      );
    }

    this.compRef?.setInput('question', q);
  }

  private destroyDynamicComponent(): void {
    this.compRef?.destroy();
    this.compRef = undefined;
    this.currentType = undefined;
    this.outlet?.clear();
  }

  ngOnDestroy(): void {
    this.destroyDynamicComponent();
  }
}
