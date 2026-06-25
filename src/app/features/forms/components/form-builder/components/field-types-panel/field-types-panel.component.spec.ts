import { FIELD_TYPE_GROUPS } from '../../../../question-types/field-type-definitions';

describe('FieldTypesPanelComponent', () => {
  it('exposes all defined groups', () => {
    expect(FIELD_TYPE_GROUPS.length).toBeGreaterThan(0);
  });

  it('has 9 total question types across all groups', () => {
    const total = FIELD_TYPE_GROUPS.reduce((sum, g) => sum + g.types.length, 0);
    expect(total).toBe(9);
  });
});
