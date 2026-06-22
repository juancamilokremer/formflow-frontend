import { TestBed } from '@angular/core/testing';
import { TemplateRef } from '@angular/core';
import { TableToolbarDirective } from './table-toolbar.directive';

describe('TableToolbarDirective', () => {
  it('should instantiate', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: TemplateRef, useValue: {} }],
    });
    const directive = TestBed.runInInjectionContext(() => new TableToolbarDirective());
    expect(directive).toBeTruthy();
  });
});
