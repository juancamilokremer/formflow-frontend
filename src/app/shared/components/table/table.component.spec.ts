import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { AppTableComponent } from './table.component';
import { TableColumn } from './table.component';

interface TestableTable {
  totalPages(): number;
  rangeStart(): number;
  rangeEnd(): number;
  onRowClick(row: unknown): void;
  goToPreviousPage(): void;
  goToNextPage(): void;
}

function buildComponent(overrides: {
  rows?: unknown[]; totalElements?: number | null; pageIndex?: number; pageSize?: number; clickableRows?: boolean;
} = {}) {
  TestBed.configureTestingModule({
    imports: [AppTableComponent],
    providers: [provideTranslateService({ lang: 'es' })],
  });
  const fixture = TestBed.createComponent(AppTableComponent);
  fixture.componentRef.setInput('columns', []);
  fixture.componentRef.setInput('rows', overrides.rows ?? []);
  fixture.componentRef.setInput('totalElements', overrides.totalElements ?? null);
  fixture.componentRef.setInput('pageIndex', overrides.pageIndex ?? 0);
  fixture.componentRef.setInput('pageSize', overrides.pageSize ?? 20);
  fixture.componentRef.setInput('clickableRows', overrides.clickableRows ?? false);
  fixture.detectChanges();
  return fixture.componentInstance;
}

describe('AppTableComponent', () => {
  it('should instantiate', () => {
    TestBed.configureTestingModule({});
    const component = TestBed.runInInjectionContext(() => new AppTableComponent());
    expect(component).toBeTruthy();
  });

  it('getCellValue() should return the field value from a row object', () => {
    TestBed.configureTestingModule({});
    const component = TestBed.runInInjectionContext(() => new AppTableComponent());
    const fn = (component as unknown as { getCellValue(row: unknown, key: string): unknown }).getCellValue.bind(component);
    expect(fn({ name: 'Test', status: 'ACTIVE' }, 'name')).toBe('Test');
    expect(fn({ name: 'Test', status: 'ACTIVE' }, 'status')).toBe('ACTIVE');
  });

  it('getCellValue() should return null for action keys starting with __', () => {
    TestBed.configureTestingModule({});
    const component = TestBed.runInInjectionContext(() => new AppTableComponent());
    const fn = (component as unknown as { getCellValue(row: unknown, key: string): unknown }).getCellValue.bind(component);
    expect(fn({ id: '1' }, '__actions')).toBeNull();
  });

  describe('pagination', () => {
    it('totalPages() computes ceil(total/pageSize)', () => {
      const component = buildComponent({ totalElements: 45, pageSize: 20 }) as unknown as TestableTable;
      expect(component.totalPages()).toBe(3);
    });

    it('totalPages() is 0 when totalElements is not provided (unpaginated table)', () => {
      const component = buildComponent({ totalElements: null }) as unknown as TestableTable;
      expect(component.totalPages()).toBe(0);
    });

    it('rangeStart()/rangeEnd() compute the visible row range for the current page', () => {
      const component = buildComponent({
        totalElements: 45, pageIndex: 1, pageSize: 20, rows: new Array(20).fill({}),
      }) as unknown as TestableTable;
      expect(component.rangeStart()).toBe(21);
      expect(component.rangeEnd()).toBe(40);
    });

    it('goToNextPage() emits pageChange with the next index when not on the last page', () => {
      const component = buildComponent({ totalElements: 45, pageIndex: 0, pageSize: 20 });
      const testable = component as unknown as TestableTable;
      let emitted: number | undefined;
      component.pageChange.subscribe((page) => (emitted = page));
      testable.goToNextPage();
      expect(emitted).toBe(1);
    });

    it('goToNextPage() does nothing on the last page', () => {
      const component = buildComponent({ totalElements: 45, pageIndex: 2, pageSize: 20 });
      const testable = component as unknown as TestableTable;
      let emitted: number | undefined;
      component.pageChange.subscribe((page) => (emitted = page));
      testable.goToNextPage();
      expect(emitted).toBeUndefined();
    });

    it('goToPreviousPage() does nothing on the first page', () => {
      const component = buildComponent({ totalElements: 45, pageIndex: 0, pageSize: 20 });
      const testable = component as unknown as TestableTable;
      let emitted: number | undefined;
      component.pageChange.subscribe((page) => (emitted = page));
      testable.goToPreviousPage();
      expect(emitted).toBeUndefined();
    });
  });

  describe('row click', () => {
    it('onRowClick() emits rowClick when clickableRows is true', () => {
      const component = buildComponent({ clickableRows: true });
      const testable = component as unknown as TestableTable;
      let emitted: unknown;
      component.rowClick.subscribe((row) => (emitted = row));
      testable.onRowClick({ id: '1' });
      expect(emitted).toEqual({ id: '1' });
    });

    it('onRowClick() does nothing when clickableRows is false', () => {
      const component = buildComponent({ clickableRows: false });
      const testable = component as unknown as TestableTable;
      let emitted: unknown;
      component.rowClick.subscribe((row) => (emitted = row));
      testable.onRowClick({ id: '1' });
      expect(emitted).toBeUndefined();
    });
  });
});
