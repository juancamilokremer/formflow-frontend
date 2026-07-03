import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '../../../../shared/icons/icon.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { FormFillerComponent } from '../../form-filler/form-filler.component';
import { PublicResponseService } from '../../services/public-response.service';
import { PublicForm, SubmitPublicResponsePayload, SubmitPublicResponseResult } from '../../models/public-form.model';

type PageView = 'loading' | 'not_found' | 'closed' | 'already_responded' | 'ready';

@Component({
  selector: 'app-candidate-form-page',
  imports: [TranslatePipe, IconComponent, LoadingSpinnerComponent, FormFillerComponent],
  templateUrl: './candidate-form-page.component.html',
  styleUrl: './candidate-form-page.component.scss',
})
export class CandidateFormPageComponent implements OnInit {
  private readonly route      = inject(ActivatedRoute);
  private readonly svc        = inject(PublicResponseService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly view             = signal<PageView>('loading');
  protected readonly form             = signal<PublicForm | null>(null);
  protected readonly candidateName    = signal<string | null>(null);
  protected readonly convocatoriaName = signal<string | null>(null);

  // Signal so doSubmit reads reactively without a mutable private field.
  private readonly token = signal<string | null>(null);

  readonly doSubmit = (payload: SubmitPublicResponsePayload): Observable<SubmitPublicResponseResult> =>
    this.svc.submitCandidateResponse(this.token()!, payload);

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');
    if (!token) { this.view.set('not_found'); return; }

    this.token.set(token);

    this.svc.getCandidateForm(token)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.candidateName.set(data.candidateName);
          this.convocatoriaName.set(data.convocatoriaName);
          this.form.set(data.form);
          this.view.set(data.alreadyResponded ? 'already_responded' : 'ready');
        },
        error: (e) => this.view.set(e?.status === 404 ? 'not_found' : 'closed'),
      });
  }
}
