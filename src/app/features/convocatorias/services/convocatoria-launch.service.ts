import { Injectable, inject } from '@angular/core';
import { Observable, catchError, concatMap, from, map, of, switchMap, throwError, toArray } from 'rxjs';
import { ConvocatoriaService } from './convocatoria.service';
import {
  CandidateAddFailure, ConvocatoriaDraft, LaunchError, LaunchResult,
} from '../models/convocatoria-wizard.model';
import { ConvocatoriaDetail, CreateConvocatoriaRequest } from '../models/convocatoria.model';

/**
 * Orchestrates the create -> add/import candidates -> launch sequence for a convocatoria.
 * Kept separate from ConvocatoriaWizardComponent so the retry/failure-tolerance policy is
 * unit-testable on its own and reusable outside the wizard's UI lifecycle.
 */
@Injectable({ providedIn: 'root' })
export class ConvocatoriaLaunchService {
  private readonly convocatoriaService = inject(ConvocatoriaService);

  /**
   * @param existingConvocatoriaId set on retry once `create` has already succeeded once, so it isn't repeated.
   * @param alreadySucceededEmails manual candidates confirmed added in a previous attempt, so they aren't resent.
   */
  launch(
    draft: ConvocatoriaDraft,
    existingConvocatoriaId: string | null,
    alreadySucceededEmails: ReadonlySet<string>,
  ): Observable<LaunchResult> {
    const create$ = existingConvocatoriaId
      ? of({ id: existingConvocatoriaId } as ConvocatoriaDetail)
      : this.convocatoriaService.create(this.buildCreateRequest(draft));

    return create$.pipe(
      catchError(() => throwError(() => ({ stage: 'create' } satisfies LaunchError))),
      switchMap((c) =>
        this.addOrImportCandidates(c.id, draft, alreadySucceededEmails).pipe(
          map((failures) => ({ convocatoriaId: c.id, failures })),
          catchError((err: LaunchError) => throwError(() => ({ ...err, convocatoriaId: c.id }))),
        ),
      ),
      switchMap(({ convocatoriaId, failures }) =>
        this.convocatoriaService.launch(convocatoriaId).pipe(
          map((launched): LaunchResult => ({ launched, convocatoriaId, failures })),
          catchError(() => throwError(() => (
            { stage: 'launch', convocatoriaId, failures } satisfies LaunchError
          ))),
        ),
      ),
    );
  }

  buildCreateRequest(draft: ConvocatoriaDraft): CreateConvocatoriaRequest {
    const total = Object.values(draft.weights).reduce((a, b) => a + b, 0);
    return {
      name: draft.name.trim(),
      formId: draft.formId!,
      categoryWeights: total === 0
        ? undefined
        : Object.entries(draft.weights)
            .filter(([, weight]) => weight > 0)
            .map(([categoryId, weight]) => ({ categoryId, weight })),
      scoringConfig: { aptoMin: draft.aptoMin, revisarMin: draft.revisarMin },
    };
  }

  private addOrImportCandidates(
    convocatoriaId: string,
    draft: ConvocatoriaDraft,
    alreadySucceededEmails: ReadonlySet<string>,
  ): Observable<CandidateAddFailure[]> {
    if (draft.csvFile) {
      return this.convocatoriaService.importCandidates(convocatoriaId, draft.csvFile).pipe(
        map(() => []),
        catchError(() => throwError(() => ({ stage: 'candidates', failures: [] } satisfies LaunchError))),
      );
    }

    const pending = draft.manualCandidates.filter((c) => !alreadySucceededEmails.has(c.email));
    const someAlreadySucceeded = alreadySucceededEmails.size > 0;

    if (pending.length === 0) {
      return of([]);
    }

    return from(pending).pipe(
      concatMap((candidate) =>
        this.convocatoriaService.addCandidate(convocatoriaId, candidate).pipe(
          map(() => ({ ok: true as const, candidate })),
          catchError((error) => of({ ok: false as const, candidate, error })),
        ),
      ),
      toArray(),
      switchMap((results) => {
        const failures = results.filter((r) => !r.ok) as CandidateAddFailure[];
        const succeededThisRound = results.length - failures.length;
        if (succeededThisRound === 0 && !someAlreadySucceeded) {
          return throwError(() => ({ stage: 'candidates', failures } satisfies LaunchError));
        }
        return of(failures);
      }),
    );
  }
}
