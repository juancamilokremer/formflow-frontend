import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { CandidateImportModalComponent } from './candidate-import-modal.component';

describe('CandidateImportModalComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [CandidateImportModalComponent],
      providers: [provideTranslateService({ lang: 'es' })],
    }).compileComponents();

    const fixture = TestBed.createComponent(CandidateImportModalComponent);
    fixture.componentRef.setInput('fileName', 'candidatos.csv');
    fixture.componentRef.setInput('previewRows', []);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
