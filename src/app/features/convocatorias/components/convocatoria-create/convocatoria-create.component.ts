import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { convocatoriaDetailPath, encuestaDetailPath } from '../../../../core/constants/route.constants';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ConvocatoriaService } from '../../services/convocatoria.service';
import { ProcessType } from '../../models/convocatoria.model';
import { BasicInfoFormComponent } from './components/basic-info-form/basic-info-form.component';

@Component({
  selector: 'app-convocatoria-create',
  imports: [TranslatePipe, ButtonComponent, CardComponent, PageHeaderComponent, BasicInfoFormComponent],
  templateUrl: './convocatoria-create.component.html',
  styleUrl: './convocatoria-create.component.scss',
})
export class ConvocatoriaCreateComponent {
  private readonly convocatoriaService = inject(ConvocatoriaService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);

  protected readonly isSurveyMode = this.route.snapshot.data['fixedType'] === 'REGISTRATION';
  protected readonly copyPrefix = this.isSurveyMode ? 'encuestas.create' : 'convocatorias.create';

  protected readonly name = signal(this.route.snapshot.queryParamMap.get('name') ?? '');
  protected readonly processType = signal<ProcessType>(
    this.isSurveyMode ? 'REGISTRATION' : this.resolveInitialProcessType());
  protected readonly creating = signal(false);
  protected readonly createError = signal(false);

  protected readonly isValid = computed(() => this.name().trim().length > 0);

  private resolveInitialProcessType(): ProcessType {
    return this.route.snapshot.queryParamMap.get('type') === 'DIAGNOSTIC' ? 'DIAGNOSTIC' : 'CANDIDATES';
  }

  protected onBasicInfoChanged(patch: { name: string; processType: ProcessType }): void {
    this.name.set(patch.name);
    this.processType.set(patch.processType);
  }

  protected submit(): void {
    if (!this.isValid() || this.creating()) return;
    this.creating.set(true);
    this.createError.set(false);

    this.convocatoriaService.create({ name: this.name().trim(), type: this.processType() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (detail) => this.router.navigate(
          this.isSurveyMode ? encuestaDetailPath(detail.id) : convocatoriaDetailPath(detail.id)),
        error: () => {
          this.creating.set(false);
          this.createError.set(true);
        },
      });
  }
}
