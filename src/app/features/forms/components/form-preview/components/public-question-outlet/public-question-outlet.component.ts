import {
  Component,
  ComponentRef,
  OnDestroy,
  ViewContainerRef,
  effect,
  input,
  output,
  viewChild,
} from '@angular/core';
import { FormQuestion } from '../../../../models/form.model';
import { PublicQuestionComponent } from '../../../../question-types/question-type.interfaces';
import { getQuestionTypeDef } from '../../../../question-types/question-type.registry';

@Component({
  selector: 'app-public-question-outlet',
  template: '<ng-container #outlet></ng-container>',
})
export class PublicQuestionOutletComponent implements OnDestroy {
  readonly question = input.required<FormQuestion>();
  readonly answered = output<unknown>();

  private readonly outlet = viewChild.required('outlet', { read: ViewContainerRef });

  private compRef?: ComponentRef<PublicQuestionComponent>;
  private currentType?: string;

  constructor() {
    effect(() => {
      const outlet = this.outlet();
      const q      = this.question();
      this.render(outlet, q);
    });
  }

  private render(outlet: ViewContainerRef, q: FormQuestion): void {
    const def = getQuestionTypeDef(q.type);
    if (!def) return;

    if (this.currentType !== q.type) {
      this.compRef?.destroy();
      outlet.clear();
      this.currentType = q.type;
      this.compRef = outlet.createComponent(def.publicComponent);
      this.compRef.instance.answered.subscribe((val) => this.answered.emit(val));
    }

    this.compRef?.setInput('question', q);
  }

  ngOnDestroy(): void {
    this.compRef?.destroy();
  }
}
