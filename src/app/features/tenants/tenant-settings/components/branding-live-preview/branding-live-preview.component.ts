import { Component, computed, input } from '@angular/core';
import { NgStyle } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

/** Purely presentational — a fake public-form card that reflects the branding being
 *  edited. Colors arrive already debounced by the parent form (BrandingFormComponent);
 *  the logo just swaps its `src`, which is cheap enough to update immediately. */
@Component({
  selector: 'app-branding-live-preview',
  imports: [TranslatePipe, NgStyle],
  templateUrl: './branding-live-preview.component.html',
  styleUrl: './branding-live-preview.component.scss',
})
export class BrandingLivePreviewComponent {
  readonly logoUrl = input<string | null>(null);
  readonly primaryColor = input<string | null>(null);
  readonly secondaryColor = input<string | null>(null);

  protected readonly previewStyle = computed(() => ({
    '--preview-primary': this.primaryColor() || '#3B82F6',
    '--preview-secondary': this.secondaryColor() || '#1E40AF',
  }));
}
