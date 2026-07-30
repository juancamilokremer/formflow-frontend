import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '../../../../shared/icons/icon.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { FormFillerComponent } from '../../form-filler/form-filler.component';
import { PublicResponseService } from '../../services/public-response.service';
import {
  CandidateChecklist,
  CandidateChecklistFormItem,
  PublicForm,
  SubmitPublicResponsePayload,
  SubmitPublicResponseResult,
} from '../../models/public-form.model';

type PageView = 'loading' | 'not_found' | 'closed' | 'checklist' | 'form_ready' | 'form_already_done';

@Component({
  selector: 'app-candidate-form-page',
  imports: [TranslatePipe, IconComponent, ButtonComponent, LoadingSpinnerComponent, FormFillerComponent],
  templateUrl: './candidate-form-page.component.html',
  styleUrl: './candidate-form-page.component.scss',
})
export class CandidateFormPageComponent implements OnInit {
  private readonly route      = inject(ActivatedRoute);
  private readonly svc        = inject(PublicResponseService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly view      = signal<PageView>('loading');
  protected readonly checklist = signal<CandidateChecklist | null>(null);
  protected readonly form      = signal<PublicForm | null>(null);

  protected readonly selectedFormId = signal<string | null>(null);
  protected readonly pendingFormId  = signal<string | null>(null);

  // Signal so doSubmit reads reactively without a mutable private field.
  private readonly token = signal<string | null>(null);

  protected readonly selectedFormName = computed<string | null>(
    () => this.checklist()?.forms.find((formItem) => formItem.formId === this.selectedFormId())?.name ?? null,
  );

  readonly doSubmit = (payload: SubmitPublicResponsePayload): Observable<SubmitPublicResponseResult> =>
    this.svc.submitCandidateResponse(this.token()!, this.selectedFormId()!, payload);

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');
    if (!token) { this.view.set('not_found'); return; }

    this.token.set(token);

    this.svc.getCandidateChecklist(token)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (checklist) => {
          this.checklist.set(checklist);
          this.view.set('checklist');
        },
        error: (error) => this.view.set(error?.status === 404 ? 'not_found' : 'closed'),
      });
  }

  protected selectForm(item: CandidateChecklistFormItem): void {
    if (this.pendingFormId()) return;
    this.selectedFormId.set(item.formId);

    if (item.completed) {
      this.view.set('form_already_done');
      return;
    }

    this.pendingFormId.set(item.formId);
    this.svc.getCandidateForm(this.token()!, item.formId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.pendingFormId.set(null);
          this.form.set(data.form);
          if (data.alreadyResponded) {
            this.markCompleted(item.formId);
            this.view.set('form_already_done');
          } else {
            this.view.set('form_ready');
          }
        },
        error: (error) => {
          this.pendingFormId.set(null);
          this.view.set(error?.status === 404 ? 'not_found' : 'closed');
        },
      });
  }

  protected onBackToChecklist(): void {
    const formId = this.selectedFormId();
    if (formId) this.markCompleted(formId);
    this.selectedFormId.set(null);
    this.form.set(null);
    this.view.set('checklist');
  }

  private markCompleted(formId: string): void {
    const current = this.checklist();
    if (!current) return;
    const forms = current.forms.map((formItem) =>
      formItem.formId === formId ? { ...formItem, completed: true } : formItem,
    );
    this.checklist.set({ ...current, forms, allCompleted: forms.every((formItem) => formItem.completed) });
  }
}
