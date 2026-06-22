import { TestBed } from '@angular/core/testing';
import { FormsListComponent } from './forms-list.component';
import { Form } from '../../models/form.model';

const mockForms: Form[] = [
  {
    id: 'f1', name: 'Evaluación 2026', description: null,
    type: 'CANDIDATES', status: 'ACTIVE', version: 1,
    sectionCount: 3, responseCount: 10,
    lastResponseAt: '2026-06-20T12:00:00Z',
    createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-06-10T00:00:00Z',
  },
  {
    id: 'f2', name: 'Clima Laboral', description: null,
    type: 'DIAGNOSTIC', status: 'DRAFT', version: 2,
    sectionCount: 2, responseCount: 0,
    lastResponseAt: null,
    createdAt: '2026-06-02T00:00:00Z', updatedAt: '2026-06-11T00:00:00Z',
  },
];

function setup() {
  TestBed.configureTestingModule({});
  const component = TestBed.runInInjectionContext(
    () => new FormsListComponent(),
  );
  TestBed.runInInjectionContext(() => {
    (component as any).forms = () => mockForms;
    (component as any).loading = () => false;
    (component as any).loadError = () => false;
  });
  return { component };
}

describe('FormsListComponent', () => {
  it('should instantiate', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('filteredForms() should return all when query empty and filter ALL', () => {
    const { component } = setup();
    expect(component['filteredForms']()).toEqual(mockForms);
  });

  it('filteredForms() should filter by name case-insensitively', () => {
    const { component } = setup();
    component['searchQuery'].set('clima');
    expect(component['filteredForms']()).toHaveLength(1);
    expect(component['filteredForms']()[0].id).toBe('f2');
  });

  it('filteredForms() should filter by status', () => {
    const { component } = setup();
    component['statusFilter'].set('DRAFT');
    expect(component['filteredForms']()).toHaveLength(1);
    expect(component['filteredForms']()[0].id).toBe('f2');
  });

  it('filteredForms() should apply both name and status filters', () => {
    const { component } = setup();
    component['statusFilter'].set('ACTIVE');
    component['searchQuery'].set('clima');
    expect(component['filteredForms']()).toHaveLength(0);
  });

  it('filteredForms() should return empty when no match', () => {
    const { component } = setup();
    component['searchQuery'].set('xyz');
    expect(component['filteredForms']()).toHaveLength(0);
  });

  it('onSearch() should update searchQuery', () => {
    const { component } = setup();
    component['onSearch']('test');
    expect(component['searchQuery']()).toBe('test');
  });

  it('onStatusFilter() should update statusFilter', () => {
    const { component } = setup();
    component['onStatusFilter']('ACTIVE');
    expect(component['statusFilter']()).toBe('ACTIVE');
  });

  it('formatDate() should return a string containing the year', () => {
    const { component } = setup();
    expect(component['formatDate']('2026-06-01T00:00:00Z')).toMatch(/2026/);
  });

  it('formatRelative() should return "—" for null', () => {
    const { component } = setup();
    expect(component['formatRelative'](null)).toBe('—');
  });

  it('formatRelative() should return hours ago for a recent date', () => {
    const { component } = setup();
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(component['formatRelative'](twoHoursAgo)).toMatch(/hace 2h/);
  });

  it('editRequested should emit id', () => {
    const { component } = setup();
    const emitted: string[] = [];
    component.editRequested.subscribe((id) => emitted.push(id));
    component.editRequested.emit('f1');
    expect(emitted).toEqual(['f1']);
  });

  it('viewResultsRequested should emit id', () => {
    const { component } = setup();
    const emitted: string[] = [];
    component.viewResultsRequested.subscribe((id) => emitted.push(id));
    component.viewResultsRequested.emit('f1');
    expect(emitted).toEqual(['f1']);
  });

  it('deleteRequested should emit id', () => {
    const { component } = setup();
    const emitted: string[] = [];
    component.deleteRequested.subscribe((id) => emitted.push(id));
    component.deleteRequested.emit('f1');
    expect(emitted).toEqual(['f1']);
  });
});
