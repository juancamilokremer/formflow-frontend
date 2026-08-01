import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { TabsComponent, TabItem } from './tabs.component';

const TABS: TabItem[] = [
  { id: 'ranking', label: 'convocatorias.detail.tabs.ranking' },
  { id: 'stats', label: 'convocatorias.detail.tabs.stats' },
  { id: 'formularios', label: 'convocatorias.detail.tabs.formularios' },
];

function buildComponent(activeTabId = 'ranking') {
  TestBed.configureTestingModule({
    imports: [TabsComponent],
    providers: [provideTranslateService({ lang: 'es' })],
  }).compileComponents();

  const fixture = TestBed.createComponent(TabsComponent);
  fixture.componentRef.setInput('tabs', TABS);
  fixture.componentRef.setInput('activeTabId', activeTabId);
  fixture.detectChanges();
  return { component: fixture.componentInstance };
}

describe('TabsComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  describe('onTabClick', () => {
    it('emits tabChange with the clicked tab id', () => {
      const { component } = buildComponent('ranking');
      let emitted: string | undefined;
      component.tabChange.subscribe((id) => (emitted = id));

      component['onTabClick']('stats');

      expect(emitted).toBe('stats');
    });

    it('does not emit when clicking the already-active tab', () => {
      const { component } = buildComponent('ranking');
      let emitted: string | undefined;
      component.tabChange.subscribe((id) => (emitted = id));

      component['onTabClick']('ranking');

      expect(emitted).toBeUndefined();
    });
  });
});
