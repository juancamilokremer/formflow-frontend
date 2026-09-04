import { VersionHistoryDrawerComponent } from './version-history-drawer.component';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { FormVersion } from '../../../../models/form.model';

const V1: FormVersion = { id: 'f1', version: 1, status: 'ARCHIVED', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' };
const V2: FormVersion = { id: 'f2', version: 2, status: 'ARCHIVED', createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' };
const V3: FormVersion = { id: 'f3', version: 3, status: 'DRAFT', createdAt: '2026-03-01T00:00:00Z', updatedAt: '2026-03-01T00:00:00Z' };

describe('VersionHistoryDrawerComponent', () => {
  let fixture: ComponentFixture<VersionHistoryDrawerComponent>;
  let component: VersionHistoryDrawerComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VersionHistoryDrawerComponent],
      providers: [provideTranslateService({ lang: 'es' })],
    }).compileComponents();

    fixture = TestBed.createComponent(VersionHistoryDrawerComponent);
    fixture.componentRef.setInput('currentFormId', 'f3');
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('sortedVersions() orders by version ascending', () => {
    fixture.componentRef.setInput('versions', [V3, V1, V2]);
    fixture.detectChanges();
    expect((component as any).sortedVersions().map((v: FormVersion) => v.version)).toEqual([1, 2, 3]);
  });

  it('isCurrentVersion() is true only for the single item when there is no history', () => {
    fixture.componentRef.setInput('versions', [V1]);
    fixture.detectChanges();
    expect((component as any).isCurrentVersion(V1)).toBe(true);
  });

  it('isCurrentVersion() is true only for the highest version among several', () => {
    fixture.componentRef.setInput('versions', [V1, V2, V3]);
    fixture.detectChanges();
    expect((component as any).isCurrentVersion(V1)).toBe(false);
    expect((component as any).isCurrentVersion(V2)).toBe(false);
    expect((component as any).isCurrentVersion(V3)).toBe(true);
  });

  it('onRowClick emits versionSelected for a version other than the one being viewed', () => {
    fixture.componentRef.setInput('versions', [V1, V2, V3]);
    fixture.detectChanges();
    let emitted: string | undefined;
    component.versionSelected.subscribe((id) => (emitted = id));

    (component as any).onRowClick(V1);

    expect(emitted).toBe('f1');
  });

  it('onRowClick does not emit for the version currently being viewed', () => {
    fixture.componentRef.setInput('versions', [V1, V2, V3]);
    fixture.detectChanges();
    let emitted: string | undefined;
    component.versionSelected.subscribe((id) => (emitted = id));

    (component as any).onRowClick(V3);

    expect(emitted).toBeUndefined();
  });

  it('formatDate() returns a string containing the year', () => {
    fixture.detectChanges();
    expect((component as any).formatDate('2026-03-01T00:00:00Z')).toMatch(/2026/);
  });
});
