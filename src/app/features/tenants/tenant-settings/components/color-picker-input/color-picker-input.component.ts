import { Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

const HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/;

/** ControlValueAccessor, same pattern as app-input — a hex text field + a swatch that
 *  opens the browser's native <input type="color"> picker, kept in sync both ways. */
@Component({
  selector: 'app-color-picker-input',
  templateUrl: './color-picker-input.component.html',
  styleUrl: './color-picker-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ColorPickerInputComponent),
      multi: true,
    },
  ],
})
export class ColorPickerInputComponent implements ControlValueAccessor {
  private static nextId = 0;
  protected readonly inputId = `ff-color-${ColorPickerInputComponent.nextId++}`;

  readonly label = input('');

  protected readonly internalValue = signal('');
  protected readonly isDisabled = signal(false);

  /** The native color input needs a valid #RRGGBB or it silently resets to black —
   *  falls back to a neutral swatch color while the text field holds something invalid. */
  protected readonly swatchValue = () => (HEX_PATTERN.test(this.internalValue()) ? this.internalValue() : '#cccccc');

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.internalValue.set(value ?? '');
  }

  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.isDisabled.set(disabled);
  }

  protected onTextInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.internalValue.set(value);
    this.onChange(value);
  }

  protected onColorPick(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.internalValue.set(value);
    this.onChange(value);
  }

  protected onBlur(): void {
    this.onTouched();
  }
}
