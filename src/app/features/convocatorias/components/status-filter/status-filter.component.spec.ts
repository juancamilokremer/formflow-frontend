import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { StatusFilterComponent } from './status-filter.component';
import { StatusFilterOption } from '../../models/convocatoria.model';

async function create(selected: StatusFilterOption = 'ALL') {
  await TestBed.configureTestingModule({
    imports: [StatusFilterComponent],
    providers: [provideTranslateService({ lang: 'es' })],
  }).compileComponents();

  const fixture = TestBed.createComponent(StatusFilterComponent);
  fixture.componentRef.setInput('selected', selected);
  return fixture.componentInstance;
}

describe('StatusFilterComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('exposes 4 filter chips', async () => {
    const c = await create();
    expect(c['chips'].length).toBe(4);
  });

  it('emits selected value on select()', async () => {
    const c = await create();
    let emitted: StatusFilterOption | undefined;
    c.changed.subscribe((v) => (emitted = v));
    c['select']('ACTIVE');
    expect(emitted).toBe('ACTIVE');
  });

  it('emits ALL when selecting all', async () => {
    const c = await create('ACTIVE');
    let emitted: StatusFilterOption | undefined;
    c.changed.subscribe((v) => (emitted = v));
    c['select']('ALL');
    expect(emitted).toBe('ALL');
  });
});
