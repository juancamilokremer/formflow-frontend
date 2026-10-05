import { HowItWorksSectionComponent } from './how-it-works-section.component';

describe('HowItWorksSectionComponent', () => {
  it('lists 3 steps', () => {
    const component = new HowItWorksSectionComponent();
    expect(component['steps'].length).toBe(3);
  });
});
