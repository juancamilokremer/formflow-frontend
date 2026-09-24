import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { ResponseExportComponent } from './response-export.component';
import { FormsService } from '../../services/forms.service';
import { FileDownloadService } from '../../../../core/services/file-download.service';
import { ExportedFile } from '../../models/form-response.model';

function buildComponent(exportImpl?: unknown, range?: { from?: string; to?: string }) {
  const mockFormsService = {
    exportResponses: exportImpl ?? vi.fn().mockReturnValue(of({ blob: new Blob(['x']), filename: 'f.xlsx' })),
  };
  const mockFileDownload = { download: vi.fn() };

  TestBed.configureTestingModule({
    imports: [ResponseExportComponent],
    providers: [
      provideTranslateService({ lang: 'es' }),
      { provide: FormsService, useValue: mockFormsService },
      { provide: FileDownloadService, useValue: mockFileDownload },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(ResponseExportComponent);
  fixture.componentRef.setInput('formId', 'f1');
  if (range?.from !== undefined) fixture.componentRef.setInput('from', range.from);
  if (range?.to !== undefined) fixture.componentRef.setInput('to', range.to);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance, mockFormsService, mockFileDownload };
}

describe('ResponseExportComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('creates', () => expect(buildComponent().component).toBeTruthy());

  it('calls the service with the requested format and triggers the download', () => {
    const file: ExportedFile = { blob: new Blob(['x']), filename: 'evaluacion.xlsx' };
    const { component, mockFormsService, mockFileDownload } = buildComponent(vi.fn().mockReturnValue(of(file)));

    component['exportResponses']('excel');

    expect(mockFormsService.exportResponses).toHaveBeenCalledWith('f1', 'excel', undefined, undefined);
    expect(mockFileDownload.download).toHaveBeenCalledWith(file.blob, file.filename);
    expect(component['exportingExcel']()).toBe(false);
  });

  it('forwards the date range when one is given', () => {
    const { component, mockFormsService } = buildComponent(undefined, { from: '2026-01-01', to: '2026-01-31' });

    component['exportResponses']('csv');

    expect(mockFormsService.exportResponses).toHaveBeenCalledWith('f1', 'csv', '2026-01-01', '2026-01-31');
  });

  it('sets exportingExcel while the excel export is in flight', () => {
    const { component } = buildComponent(vi.fn().mockReturnValue(of()));
    component['exportResponses']('excel');
    expect(component['exportingExcel']()).toBe(true);
    expect(component['exportingCsv']()).toBe(false);
  });

  it('sets exportingCsv while the csv export is in flight', () => {
    const { component } = buildComponent(vi.fn().mockReturnValue(of()));
    component['exportResponses']('csv');
    expect(component['exportingCsv']()).toBe(true);
    expect(component['exportingExcel']()).toBe(false);
  });

  it('ignores a second click while the same format is already exporting', () => {
    const { component, mockFormsService } = buildComponent(vi.fn().mockReturnValue(of()));

    component['exportResponses']('excel');
    component['exportResponses']('excel');

    expect(mockFormsService.exportResponses).toHaveBeenCalledTimes(1);
  });

  it('sets exportError on failure and clears the loading state', () => {
    const { component, mockFileDownload } = buildComponent(
      vi.fn().mockReturnValue(throwError(() => new Error('boom'))));

    component['exportResponses']('csv');

    expect(component['exportError']()).toBe(true);
    expect(component['exportingCsv']()).toBe(false);
    expect(mockFileDownload.download).not.toHaveBeenCalled();
  });
});
