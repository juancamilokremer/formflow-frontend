import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { DialogComponent } from '../../../../../../shared/components/dialog/dialog.component';
import { ButtonComponent } from '../../../../../../shared/components/button/button.component';
import { EmptyStateComponent } from '../../../../../../shared/components/empty-state/empty-state.component';
import { ManualCandidateDraft } from '../../../../models/convocatoria-wizard.model';

@Component({
  selector: 'app-candidate-import-modal',
  imports: [TranslatePipe, DialogComponent, ButtonComponent, EmptyStateComponent],
  templateUrl: './candidate-import-modal.component.html',
  styleUrl: './candidate-import-modal.component.scss',
})
export class CandidateImportModalComponent {
  readonly isOpen = input(false);
  readonly fileName = input.required<string>();
  readonly previewRows = input.required<ManualCandidateDraft[]>();
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
}
