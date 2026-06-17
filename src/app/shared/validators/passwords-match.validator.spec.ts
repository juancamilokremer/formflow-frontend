import { FormBuilder } from '@angular/forms';
import { passwordsMatchValidator } from './passwords-match.validator';

describe('passwordsMatchValidator', () => {
  const fb = new FormBuilder();

  it('returns null when both fields match', () => {
    const group = fb.group(
      { password: 'Password1!', confirmPassword: 'Password1!' },
      { validators: passwordsMatchValidator('password', 'confirmPassword') }
    );
    expect(group.hasError('passwordsMismatch')).toBe(false);
  });

  it('returns passwordsMismatch when fields differ', () => {
    const group = fb.group(
      { password: 'Password1!', confirmPassword: 'Other1!' },
      { validators: passwordsMatchValidator('password', 'confirmPassword') }
    );
    expect(group.hasError('passwordsMismatch')).toBe(true);
  });
});
