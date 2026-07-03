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

type PageView = 'loading' | 'not_found' | 'error' | 'ready';

@Component({
  selector: 'app-anonymous-form-page',
  imports: [TranslatePipe, IconComponent, LoadingSpinnerComponent, FormFillerComponent],
  templateUrl: './anonymous-form-page.component.html',
  styleUrl: './anonymous-form-page.component.scss',
})
export class AnonymousFormPageComponent implements OnInit {
  private readonly route      = inject(ActivatedRoute);
  private readonly svc        = inject(PublicResponseService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly view = signal<PageView>('loading');
  protected readonly form = signal<PublicForm | null>(null);

  readonly doSubmit = (payload: SubmitPublicResponsePayload): Observable<SubmitPublicResponseResult> =>
    this.svc.submitResponse(this.form()!.formId, payload);

  ngOnInit(): void {
    const formId = this.route.snapshot.paramMap.get('formId');
    if (!formId) { this.view.set('not_found'); return; }

    this.svc.getForm(formId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next:  (f) => { this.form.set(f); this.view.set('ready'); },
        error: (e) => this.view.set(e?.status === 404 ? 'not_found' : 'error'),
      });
  }
}
