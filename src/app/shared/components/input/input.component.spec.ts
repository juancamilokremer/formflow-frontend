import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from './input.component';

describe('InputComponent', () => {
  let component: InputComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(InputComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('writeValue updates internal value', () => {
    component.writeValue('test@email.com');
    expect((component as any).value).toBe('test@email.com');
  });

  it('writeValue handles null gracefully', () => {
    component.writeValue(null as unknown as string);
    expect((component as any).value).toBe('');
  });

  it('setDisabledState updates disabled flag', () => {
    component.setDisabledState(true);
    expect((component as any).isDisabled).toBe(true);
    component.setDisabledState(false);
    expect((component as any).isDisabled).toBe(false);
  });

  it('togglePasswordVisibility flips showPassword', () => {
    expect((component as any).showPassword).toBe(false);
    (component as any).togglePasswordVisibility();
    expect((component as any).showPassword).toBe(true);
    (component as any).togglePasswordVisibility();
    expect((component as any).showPassword).toBe(false);
  });

  it('effectiveType returns password when not toggled', () => {
    component.type = 'password';
    component.toggleable = true;
    expect((component as any).effectiveType).toBe('password');
  });

  it('effectiveType returns text after toggle', () => {
    component.type = 'password';
    component.toggleable = true;
    (component as any).showPassword = true;
    expect((component as any).effectiveType).toBe('text');
  });

  it('effectiveType ignores toggle when toggleable is false', () => {
    component.type = 'password';
    component.toggleable = false;
    (component as any).showPassword = true;
    expect((component as any).effectiveType).toBe('password');
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
