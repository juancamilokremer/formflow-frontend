import { UseCasesSectionComponent } from './use-cases-section.component';

describe('UseCasesSectionComponent', () => {
  it('defaults to the candidates use case', () => {
    const component = new UseCasesSectionComponent();
    expect(component['active']().id).toBe('candidates');
  });

  it('switches the active use case on selectTab', () => {
    const component = new UseCasesSectionComponent();
    component['selectTab']('climate');
    expect(component['active']().id).toBe('climate');
  });
});
