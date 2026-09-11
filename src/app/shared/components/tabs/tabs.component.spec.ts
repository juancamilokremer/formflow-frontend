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
  return { component: fixture.componentInstance, fixture };
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

  describe('badge', () => {
    it('does not render a badge when the tab has none', () => {
      const { fixture } = buildComponent();
      expect(fixture.nativeElement.querySelector('.tabs__badge')).toBeFalsy();
    });

    it('renders a badge when the tab has one', () => {
      TestBed.configureTestingModule({
        imports: [TabsComponent],
        providers: [provideTranslateService({ lang: 'es' })],
      }).compileComponents();
      const fixture = TestBed.createComponent(TabsComponent);
      fixture.componentRef.setInput('tabs', [
        { id: 'a', label: 'A', badge: 'complete' },
        { id: 'b', label: 'B', badge: 'pending' },
      ] as TabItem[]);
      fixture.componentRef.setInput('activeTabId', 'a');
      fixture.detectChanges();

      const badges = fixture.nativeElement.querySelectorAll('.tabs__badge');
      expect(badges.length).toBe(2);
      expect(badges[0].classList).toContain('tabs__badge--complete');
      expect(badges[1].classList).toContain('tabs__badge--pending');
    });
  });
});
