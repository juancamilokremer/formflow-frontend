import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { RouteConstants } from '../../../../../core/constants/route.constants';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../../shared/components/card/card.component';
import { PlanBadgeComponent } from '../../../../../shared/components/plan-badge/plan-badge.component';
import { Tenant } from '../../../../../core/models/tenant.model';
import { TenantSettingsService } from '../../services/tenant-settings.service';

@Component({
  selector: 'app-company-info-form',
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe, InputComponent, ButtonComponent, CardComponent, PlanBadgeComponent],
  templateUrl: './company-info-form.component.html',
  styleUrl: './company-info-form.component.scss',
})
export class CompanyInfoFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly tenantSettingsService = inject(TenantSettingsService);

  protected readonly routeConstants = RouteConstants;
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly saved = signal(false);
  protected readonly errorKey = signal<string | null>(null);
  protected readonly tenant = signal<Tenant | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
  });

  ngOnInit(): void {
    this.tenantSettingsService.getTenant().subscribe({
      next: (tenant) => {
        this.tenant.set(tenant);
        this.form.setValue({ name: tenant.name });
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected save(): void {
    const current = this.tenant();
    const name = this.form.getRawValue().name;
    if (!current || this.form.invalid || name === current.name) return;

    this.saving.set(true);
    this.saved.set(false);
    this.errorKey.set(null);

    // PUT /tenant overwrites logoUrl/colors unconditionally — always send the tenant's
    // current values for the fields this tab doesn't own, see tenant-settings.model.ts.
    this.tenantSettingsService
      .updateTenant({
        name,
        logoUrl: current.logoUrl ?? null,
        primaryColor: current.primaryColor ?? null,
        secondaryColor: current.secondaryColor ?? null,
      })
      .subscribe({
        next: (tenant) => {
          this.tenant.set(tenant);
          this.saving.set(false);
          this.saved.set(true);
          setTimeout(() => this.saved.set(false), 3000);
        },
        error: () => {
          this.saving.set(false);
          this.errorKey.set('settings.empresa.save_error');
        },
      });
  }
}
