import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { TypeFilterComponent } from './type-filter.component';
import { FormsTypeFilterOption } from '../../models/form.model';

async function create(selected: FormsTypeFilterOption = 'ALL') {
  await TestBed.configureTestingModule({
    imports: [TypeFilterComponent],
    providers: [provideTranslateService({ lang: 'es' })],
  }).compileComponents();

  const fixture = TestBed.createComponent(TypeFilterComponent);
  fixture.componentRef.setInput('selected', selected);
  return fixture.componentInstance;
}

describe('TypeFilterComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('exposes 3 filter chips', async () => {
    const c = await create();
    expect(c['chips'].length).toBe(3);
  });

  it('emits selected value on select()', async () => {
    const c = await create();
    let emitted: FormsTypeFilterOption | undefined;
    c.changed.subscribe((v) => (emitted = v));
    c['select']('SURVEY');
    expect(emitted).toBe('SURVEY');
  });

  it('emits ALL when selecting all', async () => {
    const c = await create('EVALUATION');
    let emitted: FormsTypeFilterOption | undefined;
    c.changed.subscribe((v) => (emitted = v));
    c['select']('ALL');
    expect(emitted).toBe('ALL');
  });
});
