import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { EMPTY, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsComponent } from './forms.component';
import { FormsService } from './services/forms.service';
import { Form } from './models/form.model';

const mockForms: Form[] = [
  {
    id: 'f1',
    name: 'Evaluación 2026',
    description: null,
    type: 'CANDIDATES',
    status: 'ACTIVE',
    version: 1,
    sectionCount: 3,
    responseCount: 10,
    lastResponseAt: '2026-06-20T12:00:00Z',
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-10T00:00:00Z',
  },
  {
    id: 'f2',
    name: 'Clima Laboral',
    description: null,
    type: 'DIAGNOSTIC',
    status: 'DRAFT',
    version: 2,
    sectionCount: 2,
    responseCount: 0,
    lastResponseAt: null,
    createdAt: '2026-06-02T00:00:00Z',
    updatedAt: '2026-06-11T00:00:00Z',
  },
];

function setup(formsResult: Form[] | 'error' = mockForms) {
  const mockGetAll = vi.fn().mockReturnValue(
    formsResult === 'error' ? throwError(() => new Error('fail')) : of(formsResult),
  );
  const mockCreate = vi.fn();
  const mockRemove = vi.fn();
  const mockNavigate = vi.fn();

  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: Router, useValue: { events: EMPTY, navigate: mockNavigate } },
      { provide: ActivatedRoute, useValue: { firstChild: null, snapshot: { data: {} } } },
      { provide: FormsService, useValue: { getAll: mockGetAll, create: mockCreate, remove: mockRemove } },
    ],
  });

  const component = TestBed.runInInjectionContext(() => new FormsComponent());
  return { component, mockNavigate, mockCreate, mockRemove };
}

describe('FormsComponent', () => {
  it('should load forms on init and set loading to false', () => {
    const { component } = setup();
    expect(component['loading']()).toBe(false);
    expect(component['forms']()).toEqual(mockForms);
    expect(component['loadError']()).toBe(false);
  });

  it('should set loadError when service fails', () => {
    const { component } = setup('error');
    expect(component['loading']()).toBe(false);
    expect(component['loadError']()).toBe(true);
  });

  it('totalResponses() should sum responseCount across all forms', () => {
    const { component } = setup();
    expect(component['totalResponses']()).toBe(10);
  });

  it('activeCount() should count forms with status ACTIVE', () => {
    const { component } = setup();
    expect(component['activeCount']()).toBe(1);
  });

  it('draftCount() should count forms with status DRAFT', () => {
    const { component } = setup();
    expect(component['draftCount']()).toBe(1);
  });

  it('filteredForms() should return all forms when query is empty and filter is ALL', () => {
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

  it('openDialog() should reset name and type and show dialog', () => {
    const { component } = setup();
    component['newName'].set('old');
    component['newType'].set('DIAGNOSTIC');
    component['openDialog']();
    expect(component['showDialog']()).toBe(true);
    expect(component['newName']()).toBe('');
    expect(component['newType']()).toBe('CANDIDATES');
  });

  it('closeDialog() should hide dialog when not creating', () => {
    const { component } = setup();
    component['showDialog'].set(true);
    component['closeDialog']();
    expect(component['showDialog']()).toBe(false);
  });

  it('closeDialog() should not hide dialog while creating', () => {
    const { component } = setup();
    component['showDialog'].set(true);
    component['creating'].set(true);
    component['closeDialog']();
    expect(component['showDialog']()).toBe(true);
  });

  it('selectType() should update newType', () => {
    const { component } = setup();
    component['selectType']('REGISTRATION');
    expect(component['newType']()).toBe('REGISTRATION');
  });

  it('createForm() should do nothing when name is blank', () => {
    const { component, mockCreate } = setup();
    component['newName'].set('  ');
    component['createForm']();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('createForm() should call service and navigate to builder on success', () => {
    const { component, mockCreate, mockNavigate } = setup();
    const created = { ...mockForms[0], id: 'new-id' };
    mockCreate.mockReturnValue(of(created));
    component['newName'].set('Nuevo Formulario');
    component['createForm']();
    expect(mockCreate).toHaveBeenCalledWith({ name: 'Nuevo Formulario', type: 'CANDIDATES' });
    expect(mockNavigate).toHaveBeenCalledWith(['forms', 'new-id', 'edit']); // formBuilderPath result
  });

  it('createForm() should reset creating flag on error', () => {
    const { component, mockCreate } = setup();
    mockCreate.mockReturnValue(throwError(() => new Error('fail')));
    component['newName'].set('Fallo');
    component['createForm']();
    expect(component['creating']()).toBe(false);
  });

  it('confirmDelete() should set pendingDeleteId', () => {
    const { component } = setup();
    component['confirmDelete']('f1');
    expect(component['pendingDeleteId']()).toBe('f1');
  });

  it('cancelDelete() should clear pendingDeleteId', () => {
    const { component } = setup();
    component['pendingDeleteId'].set('f1');
    component['cancelDelete']();
    expect(component['pendingDeleteId']()).toBeNull();
  });

  it('deleteForm() should remove form from list and clear pendingDeleteId', () => {
    const { component, mockRemove } = setup();
    mockRemove.mockReturnValue(of(undefined));
    component['pendingDeleteId'].set('f1');
    component['deleteForm']();
    expect(component['forms']().find((f) => f.id === 'f1')).toBeUndefined();
    expect(component['pendingDeleteId']()).toBeNull();
  });

  it('formatDate() should return a readable date string containing the year', () => {
    const { component } = setup();
    const result = component['formatDate']('2026-06-01T00:00:00Z');
    expect(result).toMatch(/2026/);
  });

  it('formatRelative() should return "—" for null', () => {
    const { component } = setup();
    expect(component['formatRelative'](null)).toBe('—');
  });

  it('formatRelative() should return hours ago for recent dates', () => {
    const { component } = setup();
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(component['formatRelative'](twoHoursAgo)).toMatch(/hace 2h/);
  });
});
