import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { encuestaDetailPath } from '../../../../core/constants/route.constants';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ConvocatoriaService } from '../../../convocatorias/services/convocatoria.service';
import { BasicInfoFormComponent } from '../../../convocatorias/components/convocatoria-create/components/basic-info-form/basic-info-form.component';

@Component({
  selector: 'app-encuesta-create',
  imports: [TranslatePipe, ButtonComponent, CardComponent, PageHeaderComponent, BasicInfoFormComponent],
  templateUrl: './encuesta-create.component.html',
  styleUrl: './encuesta-create.component.scss',
})
export class EncuestaCreateComponent {
  private readonly convocatoriaService = inject(ConvocatoriaService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);

  protected readonly name = signal(this.route.snapshot.queryParamMap.get('name') ?? '');
  protected readonly creating = signal(false);
  protected readonly createError = signal(false);

  protected readonly isValid = computed(() => this.name().trim().length > 0);

  protected onNameChanged(name: string): void {
    this.name.set(name);
  }

  protected submit(): void {
    if (!this.isValid() || this.creating()) return;
    this.creating.set(true);
    this.createError.set(false);

    this.convocatoriaService.create({ name: this.name().trim(), type: 'REGISTRATION' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (detail) => this.router.navigate(encuestaDetailPath(detail.id)),
        error: () => {
          this.creating.set(false);
          this.createError.set(true);
        },
      });
  }
}
