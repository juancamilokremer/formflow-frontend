import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideTranslateService } from '@ngx-translate/core';
import { ProfileFormComponent } from './profile-form.component';
import { AccountService } from '../../services/account.service';
import { Me } from '../../models/account.model';
import { UserRole } from '../../../../core/models/user.model';

const ME: Me = {
  firstName: 'Ada', lastName: 'QA', email: 'ada@empresa.com', role: UserRole.EDITOR, avatarUrl: null,
};

describe('ProfileFormComponent', () => {
  let component: ProfileFormComponent;
  let fixture: ComponentFixture<ProfileFormComponent>;
  let mockService: { updateMe: ReturnType<typeof vi.fn> };

  function setup(me: Me | null = ME) {
    mockService = { updateMe: vi.fn().mockReturnValue(of({ ...ME, firstName: 'Nuevo' })) };

    TestBed.configureTestingModule({
      imports: [ProfileFormComponent],
      providers: [
        provideTranslateService({ lang: 'es' }),
        { provide: AccountService, useValue: mockService },
      ],
    });

    fixture = TestBed.createComponent(ProfileFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('me', me);
    fixture.detectChanges();
  }

  it('populates the form from the me input', () => {
    setup();
    expect(component['form'].getRawValue()).toEqual({ firstName: 'Ada', lastName: 'QA' });
  });

  it('does not call updateMe when nothing changed', () => {
    setup();
    (component as any).save();
    expect(mockService.updateMe).not.toHaveBeenCalled();
  });

  it('does nothing when me is null', () => {
    setup(null);
    (component as any).save();
    expect(mockService.updateMe).not.toHaveBeenCalled();
  });

  it('calls updateMe with the new name and emits the updated me', () => {
    setup();
    let emitted: Me | undefined;
    component.profileChanged.subscribe((me) => (emitted = me));
    component['form'].setValue({ firstName: 'Nuevo', lastName: 'QA' });

    (component as any).save();

    expect(mockService.updateMe).toHaveBeenCalledWith({ firstName: 'Nuevo', lastName: 'QA' });
    expect(emitted?.firstName).toBe('Nuevo');
  });

  it('shows the success message after saving and clears it afterwards', () => {
    setup();
    vi.useFakeTimers();
    component['form'].setValue({ firstName: 'Nuevo', lastName: 'QA' });

    (component as any).save();

    expect(component['saved']()).toBe(true);
    vi.advanceTimersByTime(3000);
    expect(component['saved']()).toBe(false);
    vi.useRealTimers();
  });
});
