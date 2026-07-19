import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { DialogComponent } from '../dialog/dialog.component';
import { ButtonComponent } from '../button/button.component';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';

const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;
const DEFAULT_COLOR = '#4F46E5';

@Component({
  selector: 'app-category-form-dialog',
  imports: [DialogComponent, ButtonComponent, TranslatePipe],
  templateUrl: './category-form-dialog.component.html',
  styleUrl: './category-form-dialog.component.scss',
})
export class CategoryFormDialogComponent {
  private readonly categoryService = inject(CategoryService);

  readonly isOpen = input(false);
  readonly category = input<Category | null>(null);

  readonly saved = output<Category>();
  readonly cancelled = output<void>();

  protected readonly isEditMode = computed(() => !!this.category());

  protected readonly name = signal('');
  protected readonly color = signal(DEFAULT_COLOR);
  protected readonly description = signal('');
  protected readonly saving = signal(false);
  protected readonly errorKey = signal<string | null>(null);

  protected readonly colorValid = computed(() => HEX_COLOR_PATTERN.test(this.color()));
  protected readonly canSubmit = computed(() =>
    this.name().trim().length > 0 && this.colorValid() && !this.saving());

  constructor() {
    effect(() => {
      if (!this.isOpen()) return;
      const current = this.category();
      this.name.set(current?.name ?? '');
      this.color.set(current?.color ?? DEFAULT_COLOR);
      this.description.set(current?.description ?? '');
      this.errorKey.set(null);
    });
  }

  protected submit(): void {
    if (!this.canSubmit()) return;
    this.saving.set(true);
    this.errorKey.set(null);

    const payload = {
      name: this.name().trim(),
      color: this.color(),
      description: this.description().trim() || null,
    };

    const request$ = this.isEditMode()
      ? this.categoryService.update(this.category()!.id, payload)
      : this.categoryService.create(payload);

    request$.subscribe({
      next: (result) => {
        this.saving.set(false);
        this.saved.emit(result);
      },
      error: (err: { status?: number }) => {
        this.saving.set(false);
        this.errorKey.set(
          err?.status === 409
            ? 'categories.dialog.error_duplicate_name'
            : 'categories.dialog.error_generic',
        );
      },
    });
  }

  protected cancel(): void {
    if (this.saving()) return;
    this.cancelled.emit();
  }
}
