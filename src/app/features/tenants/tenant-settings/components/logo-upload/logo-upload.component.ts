import { Component, DestroyRef, OnDestroy, computed, inject, input, output, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Branding } from '../../../../../core/models/tenant.model';
import { TenantSettingsService } from '../../services/tenant-settings.service';

const MAX_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml'];

@Component({
  selector: 'app-logo-upload',
  imports: [TranslatePipe, ButtonComponent, ConfirmDialogComponent],
  templateUrl: './logo-upload.component.html',
  styleUrl: './logo-upload.component.scss',
})
export class LogoUploadComponent implements OnDestroy {
  private readonly tenantSettingsService = inject(TenantSettingsService);

  readonly logoUrl = input<string | null>(null);
  readonly brandingChanged = output<Branding>();

  protected readonly dragOver = signal(false);
  protected readonly uploading = signal(false);
  protected readonly deleting = signal(false);
  protected readonly confirmingDelete = signal(false);
  protected readonly errorKey = signal<string | null>(null);

  private readonly stagedFile = signal<File | null>(null);
  private stagedPreviewUrl: string | null = null;
  protected readonly stagedPreview = signal<string | null>(null);

  protected readonly previewUrl = computed(() => this.stagedPreview() ?? this.logoUrl());

  constructor() {
    inject(DestroyRef).onDestroy(() => this.revokeStagedPreview());
  }

  ngOnDestroy(): void {
    this.revokeStagedPreview();
  }

  /** Extracted so it's directly unit-testable without touching the DOM/File APIs. */
  protected validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) return 'settings.branding.logo.error_type';
    if (file.size > MAX_SIZE_BYTES) return 'settings.branding.logo.error_size';
    return null;
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(true);
  }

  protected onDragLeave(): void {
    this.dragOver.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) this.stageFile(file);
  }

  protected onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.stageFile(file);
  }

  private stageFile(file: File): void {
    const error = this.validateFile(file);
    if (error) {
      this.errorKey.set(error);
      return;
    }
    this.errorKey.set(null);
    this.revokeStagedPreview();
    this.stagedPreviewUrl = URL.createObjectURL(file);
    this.stagedPreview.set(this.stagedPreviewUrl);
    this.stagedFile.set(file);
  }

  private revokeStagedPreview(): void {
    if (this.stagedPreviewUrl) {
      URL.revokeObjectURL(this.stagedPreviewUrl);
      this.stagedPreviewUrl = null;
    }
  }

  protected upload(): void {
    const file = this.stagedFile();
    if (!file) return;

    this.uploading.set(true);
    this.errorKey.set(null);
    this.tenantSettingsService.uploadLogo(file).subscribe({
      next: (branding) => {
        this.uploading.set(false);
        this.stagedFile.set(null);
        this.revokeStagedPreview();
        this.stagedPreview.set(null);
        this.brandingChanged.emit(branding);
      },
      error: () => {
        this.uploading.set(false);
        this.errorKey.set('settings.branding.logo.error_upload');
      },
    });
  }

  protected cancelStagedFile(): void {
    this.stagedFile.set(null);
    this.revokeStagedPreview();
    this.stagedPreview.set(null);
    this.errorKey.set(null);
  }

  protected confirmDelete(): void {
    this.deleting.set(true);
    this.tenantSettingsService.deleteLogo().subscribe({
      next: (branding) => {
        this.deleting.set(false);
        this.confirmingDelete.set(false);
        this.brandingChanged.emit(branding);
      },
      error: () => {
        this.deleting.set(false);
        this.confirmingDelete.set(false);
        this.errorKey.set('settings.branding.logo.error_delete');
      },
    });
  }
}
