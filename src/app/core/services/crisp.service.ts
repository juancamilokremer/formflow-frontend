import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

declare global {
  interface Window {
    $crisp?: unknown[];
    CRISP_WEBSITE_ID?: string;
  }
}

/**
 * Crisp's own queue works before the real widget script loads — pushing a command array
 * onto window.$crisp is always safe, the real widget drains the queue once
 * https://client.crisp.chat/l.js connects. The script itself is only injected on routes
 * that don't opt out via route data `hideCrisp` (the public candidate-facing form pages),
 * so external respondents never load a third-party chat widget.
 */
@Injectable({ providedIn: 'root' })
export class CrispService {
  private readonly router = inject(Router);
  private scriptLoaded = false;

  init(): void {
    if (!environment.crispWebsiteId) return;
    window.$crisp = window.$crisp ?? [];
    window.CRISP_WEBSITE_ID = environment.crispWebsiteId;

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.isHiddenRoute()) {
          this.hide();
        } else {
          this.loadScript();
          this.show();
        }
      });
  }

  identify(user: User): void {
    window.$crisp?.push(['set', 'user:email', [user.email]]);
    window.$crisp?.push(['set', 'user:nickname', [`${user.firstName} ${user.lastName}`]]);
    window.$crisp?.push(['set', 'session:data', [[['plan', user.tenantPlan], ['tenant', user.tenantName]]]]);
  }

  resetSession(): void {
    window.$crisp?.push(['do', 'session:reset']);
  }

  openHelpCenter(): void {
    window.$crisp?.push(['do', 'chat:open']);
  }

  private isHiddenRoute(): boolean {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) route = route.firstChild;
    return route.data['hideCrisp'] === true;
  }

  private loadScript(): void {
    if (this.scriptLoaded) return;
    this.scriptLoaded = true;
    const script = document.createElement('script');
    script.src = 'https://client.crisp.chat/l.js';
    script.async = true;
    document.head.appendChild(script);
  }

  private show(): void {
    if (this.scriptLoaded) window.$crisp?.push(['do', 'chat:show']);
  }

  private hide(): void {
    if (this.scriptLoaded) window.$crisp?.push(['do', 'chat:hide']);
  }
}
