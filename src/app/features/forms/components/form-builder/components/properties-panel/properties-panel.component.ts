import { Component, ComponentRef, OnDestroy, ViewContainerRef, computed, effect, input, output, viewChild } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Category } from '../../../../../../core/models/category.model';
import { IconComponent } from '../../../../../../shared/icons/icon.component';
import { FormQuestion, FormSection, FormType, QuestionType } from '../../../../models/form.model';
import { getQuestionTypeDef } from '../../../../question-types/question-type.registry';
import { PropertiesQuestionComponent } from '../../../../question-types/question-type.interfaces';

@Component({
  selector: 'app-properties-panel',
  imports: [TranslatePipe, IconComponent],
  templateUrl: './properties-panel.component.html',
  styleUrl: './properties-panel.component.scss',
})
export class PropertiesPanelComponent implements OnDestroy {
  readonly question                = input<FormQuestion | null>(null);
  readonly formType                = input<FormType | undefined>(undefined);
  readonly formSections            = input<FormSection[]>([]);
  readonly currentSectionId        = input<string | null>(null);
  readonly categories              = input<Category[]>([]);
  readonly questionChanged         = output<Partial<FormQuestion>>();
  readonly conditionalLogicClicked = output<void>();
  readonly sectionChanged          = output<string>();
  readonly categoryCreated         = output<Category>();

  protected readonly hasQuestion = computed(() => {
    const q = this.question();
    return !!(q && getQuestionTypeDef(q.type));
  });

  protected readonly questionTypeLabelKey = computed(() => {
    const q = this.question();
    if (!q) return null;
    return getQuestionTypeDef(q.type)?.labelKey ?? null;
  });

  protected readonly conditionCount = computed(() =>
    this.question()?.conditionalLogic?.conditions?.length ?? 0,
  );

  private readonly outlet = viewChild.required('outlet', { read: ViewContainerRef });

  private compRef?: ComponentRef<PropertiesQuestionComponent>;
  private currentType?: QuestionType;

  constructor() {
    effect(() => {
      const outlet     = this.outlet();
      const q          = this.question();
      const formType   = this.formType();
      const categories = this.categories();
      this.updateDynamicComponent(outlet, q, formType, categories);
    });
  }

  private updateDynamicComponent(
    outlet: ViewContainerRef, q: FormQuestion | null, formType: FormType | undefined, categories: Category[],
  ): void {
    const def = q ? getQuestionTypeDef(q.type) : undefined;

    if (!def) {
      this.destroyDynamicComponent(outlet);
      return;
    }

    if (this.currentType !== q!.type) {
      this.destroyDynamicComponent(outlet);
      this.currentType = q!.type;
      this.compRef = outlet.createComponent(def.propertiesComponent);
      this.compRef.instance.changed.subscribe((change) =>
        this.questionChanged.emit(change),
      );
      this.compRef.instance.categoryCreated?.subscribe((category) =>
        this.categoryCreated.emit(category),
      );
    }

    this.compRef?.setInput('question', q);
    this.compRef?.setInput('formType', formType);
    this.compRef?.setInput('categories', categories);
  }

  private destroyDynamicComponent(outlet?: ViewContainerRef): void {
    this.compRef?.destroy();
    this.compRef = undefined;
    this.currentType = undefined;
    (outlet ?? this.outlet()).clear();
  }

  ngOnDestroy(): void {
    this.destroyDynamicComponent();
  }
}
