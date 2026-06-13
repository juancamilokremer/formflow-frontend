import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { of, throwError, Observable } from 'rxjs';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideTranslateService } from '@ngx-translate/core';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../../core/auth/auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let registerResult = of<void>(undefined);

  const mockAuthService = {
    register: () => registerResult,
    currentUser: signal(null),
    isAuthenticated: signal(false),
    initialize: () => of(undefined),
    logout: () => {},
    refreshToken: () => of(undefined),
    login: () => of(undefined),
  };

  beforeEach(async () => {
    registerResult = of(undefined);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        provideAnimations(),
        provideTranslateService({ lang: 'es' }),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form is invalid when empty', () => {
    expect((component as any).form.valid).toBe(false);
  });

  it('form is valid with all correct values', () => {
    (component as any).form.setValue({
      companyName: 'Mi Empresa',
      slug: 'mi-empresa',
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@empresa.com',
      password: 'Password1!',
    });
    expect((component as any).form.valid).toBe(true);
  });

  it('auto-generates slug from company name', () => {
    (component as any).onCompanyNameChange('Mi Nueva Empresa');
    expect((component as any).form.value.slug).toBe('mi-nueva-empresa');
  });

  it('removes accents from auto-generated slug', () => {
    (component as any).onCompanyNameChange('Café & Más');
    expect((component as any).form.value.slug).toBe('cafe-mas');
  });

  it('does not overwrite slug after manual edit', () => {
    (component as any).onSlugChange();
    (component as any).form.patchValue({ slug: 'custom-slug' });
    (component as any).onCompanyNameChange('Other Name');
    expect((component as any).form.value.slug).toBe('custom-slug');
  });

  it('rejects slug with uppercase', () => {
    (component as any).form.patchValue({ slug: 'Mi-Empresa' });
    expect((component as any).form.controls.slug.hasError('slugFormat')).toBe(true);
  });

  it('does not submit when form is invalid', () => {
    let registerCalled = false;
    registerResult = new Observable(() => { registerCalled = true; });
    (component as any).onSubmit();
    expect(registerCalled).toBe(false);
  });

  it('sets error_conflict key on 409 response', async () => {
    registerResult = throwError(() => ({ status: 409 }));
    (component as any).form.setValue({
      companyName: 'Mi Empresa',
      slug: 'mi-empresa',
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@empresa.com',
      password: 'Password1!',
    });
    (component as any).onSubmit();
    await new Promise((r) => setTimeout(r, 0));
    expect((component as any).errorKey()).toBe('auth.register.error_conflict');
  });

  it('slugError is null when pristine', () => {
    expect((component as any).slugError).toBeNull();
  });

  it('slugError returns message when touched and invalid', () => {
    const c = (component as any).form.controls.slug;
    c.markAsTouched();
    c.setValue('INVALID_SLUG');
    expect((component as any).slugError).not.toBeNull();
  });
});
