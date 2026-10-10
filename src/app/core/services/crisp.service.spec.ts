import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { CrispService } from './crisp.service';
import { environment } from '../../../environments/environment';
import { User, UserRole } from '../models/user.model';

const SCRIPT_SELECTOR = 'script[src="https://client.crisp.chat/l.js"]';

const USER: User = {
  id: 'u1', tenantId: 't1', tenantName: 'Empresa ABC', tenantPlan: 'PRO',
  email: 'ana@abc.com', firstName: 'Ana', lastName: 'QA',
  role: UserRole.TENANT_ADMIN, emailVerified: true,
};

describe('CrispService', () => {
  let service: CrispService;
  let routerEvents: Subject<NavigationEnd>;

  function setup(hideCrisp: boolean) {
    routerEvents = new Subject<NavigationEnd>();
    const mockRouter = {
      events: routerEvents,
      routerState: { snapshot: { root: { firstChild: null, data: { hideCrisp } } } },
    };
    TestBed.configureTestingModule({ providers: [{ provide: Router, useValue: mockRouter }] });
    service = TestBed.inject(CrispService);
  }

  afterEach(() => {
    environment.crispWebsiteId = '';
    window.$crisp = undefined;
    window.CRISP_WEBSITE_ID = undefined;
    document.querySelectorAll(SCRIPT_SELECTOR).forEach((el) => el.remove());
  });

  it('does nothing when crispWebsiteId is not configured', () => {
    setup(false);
    service.init();
    routerEvents.next(new NavigationEnd(1, '/dashboard', '/dashboard'));

    expect(window.$crisp).toBeUndefined();
    expect(document.querySelector(SCRIPT_SELECTOR)).toBeNull();
  });

  it('loads the script and shows the widget on a non-hidden route', () => {
    environment.crispWebsiteId = 'test-id';
    setup(false);
    service.init();
    routerEvents.next(new NavigationEnd(1, '/dashboard', '/dashboard'));

    expect(window.CRISP_WEBSITE_ID).toBe('test-id');
    expect(document.querySelector(SCRIPT_SELECTOR)).not.toBeNull();
  });

  it('never loads the script on a hidden route', () => {
    environment.crispWebsiteId = 'test-id';
    setup(true);
    service.init();
    routerEvents.next(new NavigationEnd(1, '/r/conv-1/token-1', '/r/conv-1/token-1'));

    expect(document.querySelector(SCRIPT_SELECTOR)).toBeNull();
  });

  it('loads the script once even after multiple non-hidden navigations', () => {
    environment.crispWebsiteId = 'test-id';
    setup(false);
    service.init();
    routerEvents.next(new NavigationEnd(1, '/dashboard', '/dashboard'));
    routerEvents.next(new NavigationEnd(2, '/forms', '/forms'));

    expect(document.querySelectorAll(SCRIPT_SELECTOR)).toHaveLength(1);
  });

  it('identify pushes the user name, email and plan onto the queue', () => {
    environment.crispWebsiteId = 'test-id';
    setup(false);
    service.init();

    service.identify(USER);

    expect(window.$crisp).toContainEqual(['set', 'user:email', ['ana@abc.com']]);
    expect(window.$crisp).toContainEqual(['set', 'user:nickname', ['Ana QA']]);
    expect(window.$crisp).toContainEqual(['set', 'session:data', [[['plan', 'PRO'], ['tenant', 'Empresa ABC']]]]);
  });

  it('resetSession pushes session:reset onto the queue', () => {
    environment.crispWebsiteId = 'test-id';
    setup(false);
    service.init();

    service.resetSession();

    expect(window.$crisp).toContainEqual(['do', 'session:reset']);
  });

  it('openHelpCenter pushes chat:open onto the queue', () => {
    environment.crispWebsiteId = 'test-id';
    setup(false);
    service.init();

    service.openHelpCenter();

    expect(window.$crisp).toContainEqual(['do', 'chat:open']);
  });

  it('identify is a no-op when Crisp was never initialized', () => {
    setup(false);

    expect(() => service.identify(USER)).not.toThrow();
    expect(window.$crisp).toBeUndefined();
  });
});
