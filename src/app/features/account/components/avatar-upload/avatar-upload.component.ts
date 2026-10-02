import { Component, DestroyRef, OnDestroy, computed, inject, input, output, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { UserAvatarComponent } from '../../../../shared/components/user-avatar/user-avatar.component';
import { AccountService } from '../../services/account.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { Me } from '../../models/account.model';

const MAX_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg'];

/** Same drag&drop/staged-file pattern as LogoUploadComponent (frontend#5), but for the
 *  user's own photo instead of the tenant's logo — different backend, different model,
 *  not worth parameterizing the existing one for a single extra caller. */
@Component({
  selector: 'app-avatar-upload',
  imports: [TranslatePipe, ButtonComponent, ConfirmDialogComponent, UserAvatarComponent],
  templateUrl: './avatar-upload.component.html',
  styleUrl: './avatar-upload.component.scss',
})
export class AvatarUploadComponent implements OnDestroy {
  private readonly accountService = inject(AccountService);
  private readonly authService = inject(AuthService);

  readonly avatarUrl = input<string | null>(null);
  readonly firstName = input.required<string>();
  readonly lastName = input.required<string>();
  readonly avatarChanged = output<string | null>();

  protected readonly dragOver = signal(false);
  protected readonly uploading = signal(false);
  protected readonly deleting = signal(false);
  protected readonly confirmingDelete = signal(false);
  protected readonly errorKey = signal<string | null>(null);

  private readonly stagedFile = signal<File | null>(null);
  private stagedPreviewUrl: string | null = null;
  protected readonly stagedPreview = signal<string | null>(null);

  protected readonly previewUrl = computed(() => this.stagedPreview() ?? this.avatarUrl());

  constructor() {
    inject(DestroyRef).onDestroy(() => this.revokeStagedPreview());
  }

  ngOnDestroy(): void {
    this.revokeStagedPreview();
  }

  /** Extracted so it's directly unit-testable without touching the DOM/File APIs. */
  protected validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) return 'account.avatar.error_type';
    if (file.size > MAX_SIZE_BYTES) return 'account.avatar.error_size';
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
    this.accountService.uploadAvatar(file).subscribe({
      next: (me) => {
        this.uploading.set(false);
        this.stagedFile.set(null);
        this.revokeStagedPreview();
        this.stagedPreview.set(null);
        this.reflectInHeader(me);
        this.avatarChanged.emit(me.avatarUrl);
      },
      error: () => {
        this.uploading.set(false);
        this.errorKey.set('account.avatar.error_upload');
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
    this.accountService.deleteAvatar().subscribe({
      next: (me) => {
        this.deleting.set(false);
        this.confirmingDelete.set(false);
        this.reflectInHeader(me);
        this.avatarChanged.emit(me.avatarUrl);
      },
      error: () => {
        this.deleting.set(false);
        this.confirmingDelete.set(false);
        this.errorKey.set('account.avatar.error_delete');
      },
    });
  }

  /** So the header's avatar updates immediately, without waiting for the next token
   *  refresh — same reasoning as AuthService.markEmailVerified(). */
  private reflectInHeader(me: Me): void {
    const user = this.authService.currentUser();
    if (user) {
      this.authService.currentUser.set({ ...user, avatarUrl: me.avatarUrl });
    }
  }
}
