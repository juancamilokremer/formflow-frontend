import { TestBed, ComponentFixture } from '@angular/core/testing';
import { InputComponent } from './input.component';

describe('InputComponent', () => {
  let component: InputComponent;
  let fixture: ComponentFixture<InputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InputComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('writeValue updates internal value signal', () => {
    component.writeValue('test@email.com');
    expect((component as any).internalValue()).toBe('test@email.com');
  });

  it('writeValue handles null gracefully', () => {
    component.writeValue(null as unknown as string);
    expect((component as any).internalValue()).toBe('');
  });

  it('setDisabledState updates isDisabled signal', () => {
    component.setDisabledState(true);
    expect((component as any).isDisabled()).toBe(true);
    component.setDisabledState(false);
    expect((component as any).isDisabled()).toBe(false);
  });

  it('togglePasswordVisibility flips showPassword signal', () => {
    expect((component as any).showPassword()).toBe(false);
    (component as any).togglePasswordVisibility();
    expect((component as any).showPassword()).toBe(true);
    (component as any).togglePasswordVisibility();
    expect((component as any).showPassword()).toBe(false);
  });

  it('effectiveType returns password when not toggled', () => {
    fixture.componentRef.setInput('type', 'password');
    fixture.componentRef.setInput('toggleable', true);
    expect((component as any).effectiveType()).toBe('password');
  });

  it('effectiveType returns text after toggle', () => {
    fixture.componentRef.setInput('type', 'password');
    fixture.componentRef.setInput('toggleable', true);
    (component as any).showPassword.set(true);
    expect((component as any).effectiveType()).toBe('text');
  });

  it('effectiveType ignores toggle when toggleable is false', () => {
    fixture.componentRef.setInput('type', 'password');
    fixture.componentRef.setInput('toggleable', false);
    (component as any).showPassword.set(true);
    expect((component as any).effectiveType()).toBe('password');
  });

  it('onInput calls onChange with the input value', () => {
    let emitted = '';
    component.registerOnChange((v) => (emitted = v));
    const event = { target: { value: 'hello' } } as unknown as Event;
    (component as any).onInput(event);
    expect(emitted).toBe('hello');
  });

  it('onBlur calls onTouched', () => {
    let touched = false;
    component.registerOnTouched(() => (touched = true));
    (component as any).onBlur();
    expect(touched).toBe(true);
  });
});
