import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard',
  imports: [TranslatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly route = inject(ActivatedRoute);

  /** Set by roleGuard when a route restricted to another role redirects here —
   *  see role.guard.ts. Read once from the snapshot, dismissible, not a global toast. */
  protected readonly accessDenied = signal(this.route.snapshot.queryParamMap.get('accessDenied') === 'true');

  protected dismissAccessDenied(): void {
    this.accessDenied.set(false);
  }
}
