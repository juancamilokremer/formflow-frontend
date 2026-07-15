import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { StepBasicInfoComponent } from './step-basic-info.component';

async function create(name = '', processType: 'CANDIDATES' | 'DIAGNOSTIC' = 'CANDIDATES') {
  await TestBed.configureTestingModule({
    imports: [StepBasicInfoComponent],
    providers: [provideTranslateService({ lang: 'es' })],
  }).compileComponents();

  const fixture = TestBed.createComponent(StepBasicInfoComponent);
  fixture.componentRef.setInput('name', name);
  fixture.componentRef.setInput('processType', processType);
  return fixture.componentInstance;
}

describe('StepBasicInfoComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('emits the new name alongside the current processType on name input', async () => {
    const c = await create('', 'DIAGNOSTIC');
    let emitted: { name: string; processType: string } | undefined;
    c.changed.subscribe((e) => (emitted = e));

    c['onNameInput']('Analista de RRHH');

    expect(emitted).toEqual({ name: 'Analista de RRHH', processType: 'DIAGNOSTIC' });
  });

  it('emits the new processType alongside the current name on type selection', async () => {
    const c = await create('Analista de RRHH', 'CANDIDATES');
    let emitted: { name: string; processType: string } | undefined;
    c.changed.subscribe((e) => (emitted = e));

    c['selectProcessType']('DIAGNOSTIC');

    expect(emitted).toEqual({ name: 'Analista de RRHH', processType: 'DIAGNOSTIC' });
  });
});
