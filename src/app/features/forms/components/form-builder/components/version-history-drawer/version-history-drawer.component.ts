import { Component, computed, input, output } from '@angular/core';
import { LowerCasePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { DrawerComponent } from '../../../../../../shared/components/drawer/drawer.component';
import { FormVersion } from '../../../../models/form.model';

@Component({
  selector: 'app-version-history-drawer',
  imports: [TranslatePipe, LowerCasePipe, DrawerComponent],
  templateUrl: './version-history-drawer.component.html',
  styleUrl: './version-history-drawer.component.scss',
})
export class VersionHistoryDrawerComponent {
  readonly versions = input<FormVersion[]>([]);
  readonly currentFormId = input.required<string>();
  readonly isOpen = input(false);

  readonly closed = output<void>();
  readonly versionSelected = output<string>();

  protected readonly sortedVersions = computed(() =>
    [...this.versions()].sort((a, b) => a.version - b.version),
  );

  protected isCurrentVersion(v: FormVersion): boolean {
    const maxVersion = Math.max(...this.versions().map((x) => x.version));
    return v.version === maxVersion;
  }

  protected onRowClick(v: FormVersion): void {
    if (v.id === this.currentFormId()) return;
    this.versionSelected.emit(v.id);
  }

  protected formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }
}
