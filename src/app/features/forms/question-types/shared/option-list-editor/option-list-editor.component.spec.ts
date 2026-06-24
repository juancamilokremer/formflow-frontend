import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { provideTranslateService } from '@ngx-translate/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { OptionListEditorComponent } from './option-list-editor.component';
import { QuestionOption } from '../../../models/form.model';

const OPTION_A: QuestionOption = { id: 'a', label: 'Option A' };
const OPTION_B: QuestionOption = { id: 'b', label: 'Option B' };
const OPTION_C: QuestionOption = { id: 'c', label: 'Option C' };

@Component({
  template: `<app-option-list-editor [options]="options" [showScoring]="showScoring" (optionsChanged)="last = $event" />`,
  imports: [OptionListEditorComponent],
})
class HostComponent {
  options: QuestionOption[] = [OPTION_A, OPTION_B, OPTION_C];
  showScoring = false;
  last?: QuestionOption[];
}

describe('OptionListEditorComponent', () => {
  function setup(showScoring = false) {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideTranslateService({ lang: 'es' })],
    });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.showScoring = showScoring;
    fixture.detectChanges();
    const editorEl = fixture.debugElement.query(By.directive(OptionListEditorComponent));
    const editor   = editorEl.componentInstance as OptionListEditorComponent;
    return { fixture, host: fixture.componentInstance, editor };
  }

  it('initialises localOptions from input', () => {
    const { editor } = setup();
    expect(editor['localOptions']().map((o: QuestionOption) => o.id)).toEqual(['a', 'b', 'c']);
  });

  it('reorders on drop', () => {
    const { editor } = setup();
    const drop = { previousIndex: 0, currentIndex: 2 } as CdkDragDrop<QuestionOption[]>;
    editor['onDrop'](drop);
    const ids = editor['localOptions']().map((o: QuestionOption) => o.id);
    expect(ids).toEqual(['b', 'c', 'a']);
  });

  it('emits updated array after reorder', () => {
    const { host, editor } = setup();
    const drop = { previousIndex: 0, currentIndex: 1 } as CdkDragDrop<QuestionOption[]>;
    editor['onDrop'](drop);
    expect(host.last?.map((o) => o.id)).toEqual(['b', 'a', 'c']);
  });

  it('removes an option', () => {
    const { host, editor } = setup();
    editor['removeOption']('b');
    expect(editor['localOptions']().map((o: QuestionOption) => o.id)).toEqual(['a', 'c']);
    expect(host.last?.map((o) => o.id)).toEqual(['a', 'c']);
  });

  it('adds a new option', () => {
    const { editor } = setup();
    editor['addOption']();
    expect(editor['localOptions']().length).toBe(4);
    expect(editor['localOptions']()[3].label).toBe('');
  });

  it('updates label on blur', () => {
    const { host, editor } = setup();
    const fakeEvent = { target: { value: 'Updated' } } as unknown as FocusEvent;
    editor['onLabelBlur']('a', fakeEvent);
    expect(editor['localOptions']()[0].label).toBe('Updated');
    expect(host.last?.find((o) => o.id === 'a')?.label).toBe('Updated');
  });

  it('ignores empty label on blur', () => {
    const { host, editor } = setup();
    const fakeEvent = { target: { value: '  ' } } as unknown as FocusEvent;
    editor['onLabelBlur']('a', fakeEvent);
    expect(host.last).toBeUndefined();
  });

  it('updates score on blur', () => {
    const { host, editor } = setup(true);
    const fakeEvent = { target: { value: '7' } } as unknown as FocusEvent;
    editor['onScoreBlur']('b', fakeEvent);
    expect(editor['localOptions']()[1].score).toBe(7);
    expect(host.last?.find((o) => o.id === 'b')?.score).toBe(7);
  });

  it('clamps negative score to 0', () => {
    const { editor } = setup(true);
    const fakeEvent = { target: { value: '-5' } } as unknown as FocusEvent;
    editor['onScoreBlur']('a', fakeEvent);
    expect(editor['localOptions']()[0].score).toBe(0);
  });
});
