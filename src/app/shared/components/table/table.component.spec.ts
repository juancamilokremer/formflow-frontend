import { TestBed } from '@angular/core/testing';
import { AppTableComponent } from './table.component';
import { TableColumn } from './table.component';

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
});
