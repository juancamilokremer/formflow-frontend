import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  protected readonly sidebarOpen = signal(false);

  protected readonly fullscreen = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      startWith(null),
      map(() => {
        let route = this.activatedRoute;
        while (route.firstChild) route = route.firstChild;
        return !!route.snapshot?.data?.['fullscreen'];
      }),
    ),
    { initialValue: false },
  );

  protected toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  protected closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}
