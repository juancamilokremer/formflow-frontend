import { FieldTypesPanelComponent } from './field-types-panel.component';
import { FIELD_TYPE_GROUPS } from '../../../../question-types/field-type-definitions';

describe('FieldTypesPanelComponent', () => {
  it('exposes all defined groups', () => {
    const component = new (class extends FieldTypesPanelComponent {
      get testGroups() { return (this as any).groups; }
    })();
    expect(component.testGroups).toBe(FIELD_TYPE_GROUPS);
    expect(component.testGroups.length).toBeGreaterThan(0);
  });

  it('has 8 total question types across all groups', () => {
    const total = FIELD_TYPE_GROUPS.reduce((sum, g) => sum + g.types.length, 0);
    expect(total).toBe(8);
  });
});
