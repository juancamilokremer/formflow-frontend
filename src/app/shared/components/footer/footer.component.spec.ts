import { TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';
import { CrispService } from '../../../core/services/crisp.service';

function setup() {
  const mockOpenHelpCenter = vi.fn();
  TestBed.configureTestingModule({
    providers: [{ provide: CrispService, useValue: { openHelpCenter: mockOpenHelpCenter } }],
  });
  const component = TestBed.runInInjectionContext(() => new FooterComponent());
  return { component, mockOpenHelpCenter };
}

describe('FooterComponent', () => {
  it('computes the current year', () => {
    const { component } = setup();
    expect(component['year']()).toBe(new Date().getFullYear());
  });

  it('openHelpCenter should delegate to crispService', () => {
    const { component, mockOpenHelpCenter } = setup();
    component['openHelpCenter']();
    expect(mockOpenHelpCenter).toHaveBeenCalled();
  });
});
