import { TestBed } from '@angular/core/testing';
import { FileDownloadService } from './file-download.service';

describe('FileDownloadService', () => {
  it('creates and revokes an object URL for the given blob', () => {
    const createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    const revokeObjectURL = vi.fn();
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;

    const service = TestBed.runInInjectionContext(() => new FileDownloadService());
    const blob = new Blob(['contenido']);
    service.download(blob, 'evaluacion.xlsx');

    expect(createObjectURL).toHaveBeenCalledWith(blob);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });
});
