import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  it('computes the current year', () => {
    const component = new FooterComponent();
    expect(component['year']()).toBe(new Date().getFullYear());
  });
});
