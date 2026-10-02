import { TestBed, ComponentFixture } from '@angular/core/testing';
import { UserAvatarComponent } from './user-avatar.component';

describe('UserAvatarComponent', () => {
  function setup(firstName: string, lastName: string) {
    TestBed.configureTestingModule({ imports: [UserAvatarComponent] });
    const fixture: ComponentFixture<UserAvatarComponent> = TestBed.createComponent(UserAvatarComponent);
    fixture.componentRef.setInput('firstName', firstName);
    fixture.componentRef.setInput('lastName', lastName);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  it('builds initials from the first letter of each name', () => {
    const component = setup('Ada', 'QA');
    expect(component['initials']()).toBe('AQ');
  });

  it('uppercases lowercase names', () => {
    const component = setup('juan', 'kremer');
    expect(component['initials']()).toBe('JK');
  });

  it('handles an empty last name without throwing', () => {
    const component = setup('Ada', '');
    expect(component['initials']()).toBe('A');
  });
});
