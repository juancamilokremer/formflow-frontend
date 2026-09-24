import { Component, DestroyRef, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { FileDownloadService } from '../../../../core/services/file-download.service';
import { FormsService } from '../../services/forms.service';
import { ExportFormat } from '../../models/form-response.model';

/**
 * Excel/CSV export for a form's responses. Owns the request, the per-format loading state
 * and the error message, so every place that offers the export behaves the same instead of
 * repeating the wiring.
 */
@Component({
  selector: 'app-response-export',
  imports: [TranslatePipe, ButtonComponent],
  templateUrl: './response-export.component.html',
  styleUrl: './response-export.component.scss',
})
export class ResponseExportComponent {
  private readonly formsService = inject(FormsService);
  private readonly fileDownload = inject(FileDownloadService);
  private readonly destroyRef = inject(DestroyRef);

  readonly formId = input.required<string>();
  /** Optional ISO range; when absent the backend exports every response. */
  readonly from = input<string | undefined>(undefined);
  readonly to = input<string | undefined>(undefined);

  protected readonly exportingExcel = signal(false);
  protected readonly exportingCsv = signal(false);
  protected readonly exportError = signal(false);

  protected exportResponses(format: ExportFormat): void {
    const exporting = format === 'excel' ? this.exportingExcel : this.exportingCsv;
    if (exporting()) return;
    exporting.set(true);
    this.exportError.set(false);

    this.formsService.exportResponses(this.formId(), format, this.from(), this.to())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (file) => {
          this.fileDownload.download(file.blob, file.filename);
          exporting.set(false);
        },
        error: () => {
          this.exportError.set(true);
          exporting.set(false);
        },
      });
  }
}
