import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ColorPickerInputComponent } from './color-picker-input.component';

describe('ColorPickerInputComponent', () => {
  let component: ColorPickerInputComponent;
  let fixture: ComponentFixture<ColorPickerInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColorPickerInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ColorPickerInputComponent);
    component = fixture.componentInstance;
  });

  it('writeValue updates internal value signal', () => {
    component.writeValue('#3B82F6');
    expect((component as any).internalValue()).toBe('#3B82F6');
  });

  it('writeValue handles null gracefully', () => {
    component.writeValue(null as unknown as string);
    expect((component as any).internalValue()).toBe('');
  });

  it('setDisabledState updates isDisabled signal', () => {
    component.setDisabledState(true);
    expect((component as any).isDisabled()).toBe(true);
  });

  it('onTextInput calls onChange with the typed value', () => {
    let emitted = '';
    component.registerOnChange((v) => (emitted = v));
    const event = { target: { value: '#ff0000' } } as unknown as Event;
    (component as any).onTextInput(event);
    expect(emitted).toBe('#ff0000');
    expect((component as any).internalValue()).toBe('#ff0000');
  });

  it('onColorPick calls onChange with the picked value', () => {
    let emitted = '';
    component.registerOnChange((v) => (emitted = v));
    const event = { target: { value: '#00ff00' } } as unknown as Event;
    (component as any).onColorPick(event);
    expect(emitted).toBe('#00ff00');
  });

  it('onBlur calls onTouched', () => {
    let touched = false;
    component.registerOnTouched(() => (touched = true));
    (component as any).onBlur();
    expect(touched).toBe(true);
  });

  it('swatchValue reflects a valid hex value', () => {
    component.writeValue('#123ABC');
    expect((component as any).swatchValue()).toBe('#123ABC');
  });

  it('swatchValue falls back to a neutral color for an invalid/partial hex', () => {
    component.writeValue('#12');
    expect((component as any).swatchValue()).toBe('#cccccc');
  });

  it('swatchValue falls back to a neutral color for an empty value', () => {
    component.writeValue('');
    expect((component as any).swatchValue()).toBe('#cccccc');
  });
});
