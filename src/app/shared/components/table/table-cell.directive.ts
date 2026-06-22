import { Directive, TemplateRef, inject, input } from '@angular/core';

export interface TableCellContext {
  $implicit: unknown;
  index: number;
}

@Directive({
  selector: 'ng-template[appTableCell]',
  standalone: true,
})
export class TableCellDirective {
  readonly column = input.required<string>();
  readonly template = inject(TemplateRef<TableCellContext>);
}
