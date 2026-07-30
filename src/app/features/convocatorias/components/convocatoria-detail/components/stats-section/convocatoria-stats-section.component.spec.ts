import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { ConvocatoriaStatsSectionComponent } from './convocatoria-stats-section.component';
import { ConvocatoriaService } from '../../../../services/convocatoria.service';
import { ConvocatoriaStats } from '../../../../models/convocatoria.model';

const MOCK_STATS: ConvocatoriaStats = {
  convocatoriaId: 'conv1', convocatoriaName: 'RRHH', total: 10, notStarted: 3, inProgress: 2,
  responded: 5, aptoCount: 3, revisarCount: 1, noAptoCount: 1, participationPct: 50.0,
};

function buildComponent(overrides: { getStatsImpl?: unknown } = {}) {
  const mockConvocatoriaService = {
    getStats: overrides.getStatsImpl ?? vi.fn().mockReturnValue(of(MOCK_STATS)),
  };

  TestBed.configureTestingModule({
    imports: [ConvocatoriaStatsSectionComponent],
    providers: [
      provideTranslateService({ lang: 'es' }),
      { provide: ConvocatoriaService, useValue: mockConvocatoriaService },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(ConvocatoriaStatsSectionComponent);
  fixture.componentRef.setInput('convocatoriaId', 'conv1');
  fixture.detectChanges();
  return { component: fixture.componentInstance, mockConvocatoriaService };
}

describe('ConvocatoriaStatsSectionComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('loads the stats on init', () => {
    const { component, mockConvocatoriaService } = buildComponent();
    expect(mockConvocatoriaService.getStats).toHaveBeenCalledWith('conv1');
    expect(component['stats']()).toEqual(MOCK_STATS);
    expect(component['loading']()).toBe(false);
  });

  it('sets loadError on failure', () => {
    const { component } = buildComponent({ getStatsImpl: vi.fn().mockReturnValue(throwError(() => new Error('boom'))) });
    expect(component['loadError']()).toBe(true);
    expect(component['loading']()).toBe(false);
  });
});
