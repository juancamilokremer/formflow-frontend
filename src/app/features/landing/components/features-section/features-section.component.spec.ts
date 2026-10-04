import { FeaturesSectionComponent } from './features-section.component';

describe('FeaturesSectionComponent', () => {
  it('lists 6 features', () => {
    const component = new FeaturesSectionComponent();
    expect(component['features'].length).toBe(6);
  });
});
