import { Component, DestroyRef, OnInit, inject, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { InputComponent } from '../../../../../../shared/components/input/input.component';
import {
  DateRangeFilter, ResponsePreset, dateInputToIsoEnd, dateInputToIsoStart, resolvePresetDateFrom,
} from '../../../../models/form-response.model';

interface PresetOption {
  id: ResponsePreset;
  labelKey: string;
}

const PRESET_OPTIONS: PresetOption[] = [
  { id: '7d', labelKey: 'results.range.7d' },
  { id: '30d', labelKey: 'results.range.30d' },
  { id: 'all', labelKey: 'results.range.all' },
];

@Component({
  selector: 'app-results-filter-bar',
  imports: [TranslatePipe, ReactiveFormsModule, InputComponent],
  templateUrl: './results-filter-bar.component.html',
  styleUrl: './results-filter-bar.component.scss',
})
export class ResultsFilterBarComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly rangeChange = output<DateRangeFilter>();

  protected readonly presets = PRESET_OPTIONS;
  protected readonly activePreset = signal<ResponsePreset | null>('7d');

  protected readonly form = this.fb.nonNullable.group({
    from: [''],
    to: [''],
  });

  // Emitting the initial preset here (rather than the constructor) guarantees
  // the parent's (rangeChange) listener is already wired up to receive it —
  // Angular attaches output listeners during the create phase, before ngOnInit
  // runs, but not necessarily before the constructor body executes.
  ngOnInit(): void {
    this.selectPreset('7d');

    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.activePreset.set(null);
        this.emitCustomRange();
      });
  }

  protected selectPreset(preset: ResponsePreset): void {
    this.activePreset.set(preset);
    const from = resolvePresetDateFrom(preset);
    this.form.setValue({ from: from ?? '', to: '' }, { emitEvent: false });
    this.rangeChange.emit({ from: dateInputToIsoStart(from), to: undefined });
  }

  private emitCustomRange(): void {
    const { from, to } = this.form.getRawValue();
    this.rangeChange.emit({ from: dateInputToIsoStart(from), to: dateInputToIsoEnd(to) });
  }
}
