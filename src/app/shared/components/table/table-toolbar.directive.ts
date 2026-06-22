import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({
  selector: 'ng-template[appTableToolbar]',
  standalone: true,
})
export class TableToolbarDirective {
  readonly template = inject(TemplateRef<void>);
}
