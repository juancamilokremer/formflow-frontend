import { TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('defaults to primary variant', () => {
    expect(component.variant()).toBe('primary');
  });

  it('defaults to button type', () => {
    expect(component.type()).toBe('button');
  });

  it('loading and disabled default to false', () => {
    expect(component.loading()).toBe(false);
    expect(component.disabled()).toBe(false);
  });
});
