import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { ConvocatoriaLaunchBarComponent } from './convocatoria-launch-bar.component';
import { ConvocatoriaService } from '../../../../services/convocatoria.service';
import { ConvocatoriaDetail } from '../../../../models/convocatoria.model';

const MOCK_LAUNCHED: ConvocatoriaDetail = {
  id: 'c1', tenantId: 't1', formId: 'f1', name: 'RRHH', type: 'CANDIDATES', status: 'ACTIVE',
  categoryWeights: [], scoringConfig: { aptoMin: 70, revisarMin: 50 },
  startDate: null, endDate: null, createdAt: '', updatedAt: '', candidates: [],
};

function buildComponent(launchImpl?: ReturnType<typeof vi.fn>, hasCandidates = true) {
  const mockConvocatoriaService = { launch: launchImpl ?? vi.fn().mockReturnValue(of(MOCK_LAUNCHED)) };

  TestBed.configureTestingModule({
    imports: [ConvocatoriaLaunchBarComponent],
    providers: [
      provideTranslateService({ lang: 'es' }),
      { provide: ConvocatoriaService, useValue: mockConvocatoriaService },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(ConvocatoriaLaunchBarComponent);
  fixture.componentRef.setInput('convocatoriaId', 'c1');
  fixture.componentRef.setInput('hasCandidates', hasCandidates);
  fixture.detectChanges();
  return { component: fixture.componentInstance, mockConvocatoriaService };
}

describe('ConvocatoriaLaunchBarComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('canLaunch is false without candidates', () => {
    const { component } = buildComponent(undefined, false);
    expect(component['canLaunch']()).toBe(false);
  });

  it('requestLaunch does nothing when canLaunch is false', () => {
    const { component, mockConvocatoriaService } = buildComponent(undefined, false);
    component['requestLaunch']();
    expect(mockConvocatoriaService.launch).not.toHaveBeenCalled();
  });

  it('launches and emits the result', () => {
    const { component, mockConvocatoriaService } = buildComponent();
    let emitted: ConvocatoriaDetail | undefined;
    component.launched.subscribe((d) => (emitted = d));

    component['requestLaunch']();

    expect(mockConvocatoriaService.launch).toHaveBeenCalledWith('c1');
    expect(emitted).toEqual(MOCK_LAUNCHED);
    expect(component['submitting']()).toBe(false);
  });

  it('sets error when the launch call fails', () => {
    const { component } = buildComponent(vi.fn().mockReturnValue(throwError(() => new Error('boom'))));

    component['requestLaunch']();

    expect(component['error']()).toBe(true);
    expect(component['submitting']()).toBe(false);
  });
});
