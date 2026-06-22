import { TestBed } from '@angular/core/testing';
import { TemplateRef } from '@angular/core';
import { TableCellDirective } from './table-cell.directive';

describe('TableCellDirective', () => {
  it('should instantiate', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: TemplateRef, useValue: {} }],
    });
    const directive = TestBed.runInInjectionContext(() => new TableCellDirective());
    expect(directive).toBeTruthy();
  });
});
