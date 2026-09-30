import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { debounceTime } from 'rxjs';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../../shared/components/card/card.component';
import { Branding } from '../../../../../core/models/tenant.model';
import { TenantSettingsService } from '../../services/tenant-settings.service';
import { LogoUploadComponent } from '../logo-upload/logo-upload.component';
import { ColorPickerInputComponent } from '../color-picker-input/color-picker-input.component';
import { BrandingLivePreviewComponent } from '../branding-live-preview/branding-live-preview.component';

const HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/;
const PREVIEW_DEBOUNCE_MS = 300;

@Component({
  selector: 'app-branding-form',
  imports: [
    ReactiveFormsModule, TranslatePipe, ButtonComponent, CardComponent,
    LogoUploadComponent, ColorPickerInputComponent, BrandingLivePreviewComponent,
  ],
  templateUrl: './branding-form.component.html',
  styleUrl: './branding-form.component.scss',
})
export class BrandingFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly tenantSettingsService = inject(TenantSettingsService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly saved = signal(false);
  protected readonly errorKey = signal<string | null>(null);
  protected readonly branding = signal<Branding | null>(null);

  // Updated on every keystroke (bypasses the form's own debounce) so the logo swap in the
  // preview feels instant, per the plan — only colors go through the 300ms debounce.
  protected readonly previewColors = signal({ primaryColor: '', secondaryColor: '' });

  protected readonly form = this.fb.nonNullable.group({
    primaryColor: ['', [Validators.pattern(HEX_PATTERN)]],
    secondaryColor: ['', [Validators.pattern(HEX_PATTERN)]],
  });

  ngOnInit(): void {
    this.tenantSettingsService.getBranding().subscribe({
      next: (branding) => {
        this.applyBranding(branding);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.form.valueChanges.pipe(debounceTime(PREVIEW_DEBOUNCE_MS), takeUntilDestroyed(this.destroyRef)).subscribe((v) => {
      this.previewColors.set({ primaryColor: v.primaryColor ?? '', secondaryColor: v.secondaryColor ?? '' });
    });
  }

  private applyBranding(branding: Branding): void {
    this.branding.set(branding);
    this.form.setValue({
      primaryColor: branding.primaryColor ?? '',
      secondaryColor: branding.secondaryColor ?? '',
    });
    this.previewColors.set({
      primaryColor: branding.primaryColor ?? '',
      secondaryColor: branding.secondaryColor ?? '',
    });
  }

  protected onLogoChanged(branding: Branding): void {
    this.applyBranding(branding);
  }

  protected save(): void {
    const current = this.branding();
    const { primaryColor, secondaryColor } = this.form.getRawValue();
    if (!current || this.form.invalid) return;
    if (primaryColor === (current.primaryColor ?? '') && secondaryColor === (current.secondaryColor ?? '')) return;

    this.saving.set(true);
    this.saved.set(false);
    this.errorKey.set(null);

    this.tenantSettingsService
      .updateBranding({
        name: current.tenantName,
        primaryColor: primaryColor || null,
        secondaryColor: secondaryColor || null,
      })
      .subscribe({
        next: (branding) => {
          this.applyBranding(branding);
          this.saving.set(false);
          this.saved.set(true);
          setTimeout(() => this.saved.set(false), 3000);
        },
        error: () => {
          this.saving.set(false);
          this.errorKey.set('settings.branding.save_error');
        },
      });
  }
}
