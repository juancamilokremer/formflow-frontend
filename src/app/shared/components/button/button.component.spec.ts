import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;

  beforeEach(() => {
    component = new ButtonComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('defaults to primary variant and button type', () => {
    expect(component.variant).toBe('primary');
    expect(component.type).toBe('button');
  });

  it('loading and disabled default to false', () => {
    expect(component.loading).toBe(false);
    expect(component.disabled).toBe(false);
  });
});
