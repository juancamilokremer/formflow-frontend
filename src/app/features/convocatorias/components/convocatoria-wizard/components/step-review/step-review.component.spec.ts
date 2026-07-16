import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { StepReviewComponent } from './step-review.component';
import { Category } from '../../../../../categories/models/category.model';
import { ConvocatoriaDraft, DEFAULT_DRAFT } from '../../../../models/convocatoria-wizard.model';

const categories: Category[] = [
  { id: 'c1', name: 'Técnicas', color: '#4F46E5', description: null, createdAt: '', updatedAt: '' },
  { id: 'c2', name: 'Blandas', color: '#7C3AED', description: null, createdAt: '', updatedAt: '' },
];

class FakeFileReaderSuccess {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  result: string | null = null;
  readAsText(): void {
    this.result = 'nombre,email\nAna,ana@x.com';
    this.onload?.();
  }
}

class FakeFileReaderError {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  readAsText(): void {
    this.onerror?.();
  }
}

function fileSelectedEvent(file: File | undefined): Event {
  return { target: { files: file ? [file] : [] } } as unknown as Event;
}

async function create(draft: Partial<ConvocatoriaDraft> = {}) {
  await TestBed.configureTestingModule({
    imports: [StepReviewComponent],
    providers: [provideTranslateService({ lang: 'es' })],
  }).compileComponents();

  const fixture = TestBed.createComponent(StepReviewComponent);
  fixture.componentRef.setInput('draft', { ...DEFAULT_DRAFT, ...draft });
  fixture.componentRef.setInput('selectedFormName', 'Evaluación de aspirantes');
  fixture.componentRef.setInput('categories', categories);
  return fixture.componentInstance;
}

describe('StepReviewComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  describe('resolvedWeights', () => {
    it('resolves categoryId keys to category names and drops zero weights', async () => {
      const c = await create({ weights: { c1: 40, c2: 0 } });
      expect(c['resolvedWeights']()).toEqual([{ name: 'Técnicas', weight: 40 }]);
    });

    it('returns empty when all weights are 0', async () => {
      const c = await create({ weights: { c1: 0, c2: 0 } });
      expect(c['resolvedWeights']()).toEqual([]);
    });
  });

  describe('hasCandidates / canLaunch', () => {
    it('is false with no manual candidates and no csv file', async () => {
      const c = await create();
      expect(c['hasCandidates']()).toBe(false);
      expect(c['canLaunch']()).toBe(false);
    });

    it('is true with at least one manual candidate', async () => {
      const c = await create({ manualCandidates: [{ name: 'Ana', email: 'ana@x.com' }] });
      expect(c['hasCandidates']()).toBe(true);
      expect(c['canLaunch']()).toBe(true);
    });

    it('is true with a staged csv file', async () => {
      const file = new File(['a'], 'c.csv');
      const c = await create({ csvFile: file });
      expect(c['hasCandidates']()).toBe(true);
    });
  });

  describe('canAddManual', () => {
    it('requires a non-empty name and a valid-looking email', async () => {
      const c = await create();
      c['manualName'].set('Ana');
      c['manualEmail'].set('not-an-email');
      expect(c['canAddManual']()).toBe(false);

      c['manualEmail'].set('ana@example.com');
      expect(c['canAddManual']()).toBe(true);
    });
  });

  describe('addManualCandidate', () => {
    it('emits the trimmed candidate and clears the local fields', async () => {
      const c = await create();
      let emitted: { name: string; email: string } | undefined;
      c.manualCandidateAdded.subscribe((candidate) => (emitted = candidate));

      c['manualName'].set('  Ana  ');
      c['manualEmail'].set('  ana@example.com  ');
      c['addManualCandidate']();

      expect(emitted).toEqual({ name: 'Ana', email: 'ana@example.com' });
      expect(c['manualName']()).toBe('');
      expect(c['manualEmail']()).toBe('');
    });

    it('does nothing when the form is invalid', async () => {
      const c = await create();
      let emitted = false;
      c.manualCandidateAdded.subscribe(() => (emitted = true));

      c['manualName'].set('');
      c['addManualCandidate']();

      expect(emitted).toBe(false);
    });
  });

  describe('removeManualCandidate', () => {
    it('emits the given index', async () => {
      const c = await create();
      let emitted: number | undefined;
      c.manualCandidateRemoved.subscribe((i) => (emitted = i));

      c['removeManualCandidate'](2);

      expect(emitted).toBe(2);
    });
  });

  describe('CSV staging confirm/cancel', () => {
    it('confirmCsvImport emits csvStaged with the pending file and rows, then resets local state', async () => {
      const c = await create();
      const file = new File(['nombre,email\nAna,ana@x.com'], 'candidatos.csv');
      c['pendingFile'].set(file);
      c['pendingPreviewRows'].set([{ name: 'Ana', email: 'ana@x.com' }]);
      c['importModalOpen'].set(true);

      let emitted: { file: File; previewRows: { name: string; email: string }[] } | undefined;
      c.csvStaged.subscribe((e) => (emitted = e));

      c['confirmCsvImport']();

      expect(emitted?.file).toBe(file);
      expect(emitted?.previewRows).toEqual([{ name: 'Ana', email: 'ana@x.com' }]);
      expect(c['importModalOpen']()).toBe(false);
      expect(c['pendingFile']()).toBeNull();
    });

    it('cancelCsvImport discards the pending file without emitting', async () => {
      const c = await create();
      c['pendingFile'].set(new File(['a'], 'c.csv'));
      c['importModalOpen'].set(true);

      let emitted = false;
      c.csvStaged.subscribe(() => (emitted = true));

      c['cancelCsvImport']();

      expect(emitted).toBe(false);
      expect(c['importModalOpen']()).toBe(false);
      expect(c['pendingFile']()).toBeNull();
    });
  });

  describe('onFileSelected', () => {
    afterEach(() => vi.unstubAllGlobals());

    it('sets csvReadError and does not open the modal when the file cannot be read', async () => {
      vi.stubGlobal('FileReader', FakeFileReaderError);
      const c = await create();

      c['onFileSelected'](fileSelectedEvent(new File(['a'], 'c.csv')));

      expect(c['csvReadError']()).toBe(true);
      expect(c['importModalOpen']()).toBe(false);
    });

    it('parses the file and opens the import modal on success, clearing any previous error', async () => {
      vi.stubGlobal('FileReader', FakeFileReaderSuccess);
      const c = await create();
      c['csvReadError'].set(true);

      c['onFileSelected'](fileSelectedEvent(new File(['a'], 'c.csv')));

      expect(c['csvReadError']()).toBe(false);
      expect(c['importModalOpen']()).toBe(true);
      expect(c['pendingPreviewRows']()).toEqual([{ name: 'Ana', email: 'ana@x.com' }]);
    });

    it('does nothing when no file is selected', async () => {
      const c = await create();
      c['onFileSelected'](fileSelectedEvent(undefined));
      expect(c['importModalOpen']()).toBe(false);
    });
  });

  describe('clearCsv / requestLaunch', () => {
    it('clearCsv emits csvCleared', async () => {
      const c = await create();
      let emitted = false;
      c.csvCleared.subscribe(() => (emitted = true));
      c['clearCsv']();
      expect(emitted).toBe(true);
    });

    it('requestLaunch emits launchRequested', async () => {
      const c = await create();
      let emitted = false;
      c.launchRequested.subscribe(() => (emitted = true));
      c['requestLaunch']();
      expect(emitted).toBe(true);
    });
  });
});
