import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { provideTranslateService } from '@ngx-translate/core';
import { AcceptInviteComponent } from './accept-invite.component';
import { AuthService } from '../../../../core/auth/auth.service';
import { InvitationPreview } from '../../../../core/models/auth.model';

const PREVIEW: InvitationPreview = {
  tenantName: 'Empresa ABC', tenantSlug: 'empresa-abc', email: 'nuevo@empresa.com', role: 'EDITOR',
};

describe('AcceptInviteComponent', () => {
  let component: AcceptInviteComponent;
  let fixture: ComponentFixture<AcceptInviteComponent>;
  let mockAuthService: { getInvitation: ReturnType<typeof vi.fn>; acceptInvitation: ReturnType<typeof vi.fn> };

  function setup(token = 'tok123', getInvitationImpl = vi.fn().mockReturnValue(of(PREVIEW))) {
    mockAuthService = {
      getInvitation: getInvitationImpl,
      acceptInvitation: vi.fn().mockReturnValue(of(undefined)),
    };

    TestBed.configureTestingModule({
      imports: [AcceptInviteComponent],
      providers: [
        provideRouter([]),
        provideTranslateService({ lang: 'es' }),
        { provide: AuthService, useValue: mockAuthService },
      ],
    });

    fixture = TestBed.createComponent(AcceptInviteComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('token', token);
    fixture.detectChanges();
  }

  it('loads the preview and exits the loading state', () => {
    setup();
    expect(mockAuthService.getInvitation).toHaveBeenCalledWith('tok123');
    expect(component['loading']()).toBe(false);
    expect(component['preview']()).toEqual(PREVIEW);
    expect(component['previewErrorKind']()).toBeNull();
  });

  it('resolves a translated role label from the preview', () => {
    setup();
    expect(component['roleLabel']()).toBeTruthy();
  });

  it('sets previewErrorKind to not_found when no token is provided', () => {
    setup('');
    expect(component['previewErrorKind']()).toBe('not_found');
    expect(mockAuthService.getInvitation).not.toHaveBeenCalled();
  });

  it('maps 410 to expired', () => {
    setup('tok123', vi.fn().mockReturnValue(throwError(() => ({ status: 410 }))));
    expect(component['previewErrorKind']()).toBe('expired');
  });

  it('maps 409 to already_accepted', () => {
    setup('tok123', vi.fn().mockReturnValue(throwError(() => ({ status: 409 }))));
    expect(component['previewErrorKind']()).toBe('already_accepted');
  });

  it('maps 404 (and anything else) to not_found', () => {
    setup('tok123', vi.fn().mockReturnValue(throwError(() => ({ status: 404 }))));
    expect(component['previewErrorKind']()).toBe('not_found');
  });

  it('form is invalid when passwords do not match', () => {
    setup();
    component['form'].setValue({
      firstName: 'Ada', lastName: 'QA', newPassword: 'Password1!', confirmPassword: 'Different1!',
    });
    expect(component['form'].hasError('passwordsMismatch')).toBe(true);
  });

  it('submits and sets saved on success', () => {
    setup();
    component['form'].setValue({
      firstName: 'Ada', lastName: 'QA', newPassword: 'Password1!', confirmPassword: 'Password1!',
    });

    component['onSubmit']();

    expect(mockAuthService.acceptInvitation).toHaveBeenCalledWith('tok123', {
      firstName: 'Ada', lastName: 'QA', password: 'Password1!',
    });
    expect(component['saved']()).toBe(true);
  });

  it('does not submit when the form is invalid', () => {
    setup();
    component['onSubmit']();
    expect(mockAuthService.acceptInvitation).not.toHaveBeenCalled();
  });

  it('sets a generic error key when accepting fails', () => {
    setup();
    mockAuthService.acceptInvitation.mockReturnValue(throwError(() => ({ status: 410 })));
    component['form'].setValue({
      firstName: 'Ada', lastName: 'QA', newPassword: 'Password1!', confirmPassword: 'Password1!',
    });

    component['onSubmit']();

    expect(component['errorKey']()).toBe('auth.accept_invite.error_generic');
    expect(component['saving']()).toBe(false);
  });

  it('builds login query params from the preview (tenant, email, accountCreated)', () => {
    setup();
    expect(component['loginQueryParams']()).toEqual({
      tenant: 'empresa-abc', email: 'nuevo@empresa.com', accountCreated: 'success',
    });
  });
});
