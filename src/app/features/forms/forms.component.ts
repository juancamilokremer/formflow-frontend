import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { formBuilderPath } from '../../core/constants/route.constants';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { IconComponent } from '../../shared/icons/icon.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { CreateFormDialogComponent } from './components/create-form-dialog/create-form-dialog.component';
import { FormsListComponent } from './components/forms-list/forms-list.component';
import { FormsService } from './services/forms.service';
import { Form } from './models/form.model';

@Component({
  selector: 'app-forms',
  imports: [
    TranslatePipe,
    ButtonComponent, IconComponent,
    PageHeaderComponent, StatCardComponent, EmptyStateComponent,
    ConfirmDialogComponent, CreateFormDialogComponent,
    FormsListComponent,
  ],
  templateUrl: './forms.component.html',
  styleUrl: './forms.component.scss',
})
export class FormsComponent {
  private readonly formsService = inject(FormsService);
  private readonly router = inject(Router);

  protected readonly forms      = signal<Form[]>([]);
  protected readonly loading    = signal(true);
  protected readonly loadError  = signal(false);
  protected readonly showCreateDialog = signal(false);
  protected readonly pendingDeleteId  = signal<string | null>(null);

  protected readonly totalResponses = computed(() =>
    this.forms().reduce((acc, f) => acc + f.responseCount, 0),
  );
  protected readonly activeCount = computed(
    () => this.forms().filter((f) => f.status === 'ACTIVE').length,
  );
  protected readonly draftCount = computed(
    () => this.forms().filter((f) => f.status === 'DRAFT').length,
  );

  constructor() {
    this.loadForms();
  }

  private loadForms(): void {
    this.formsService.getAll().subscribe({
      next: (forms) => { this.forms.set(forms); this.loading.set(false); },
      error: ()      => { this.loadError.set(true); this.loading.set(false); },
    });
  }

  protected onFormCreated(form: Form): void {
    this.forms.update((list) => [form, ...list]);
    this.showCreateDialog.set(false);
    this.router.navigate(formBuilderPath(form.id));
  }

  protected editForm(id: string): void {
    this.router.navigate(formBuilderPath(id));
  }

  protected viewResults(id: string): void {
    this.router.navigate(['forms', id, 'results']);
  }

  protected confirmDelete(id: string): void {
    this.pendingDeleteId.set(id);
  }

  protected cancelDelete(): void {
    this.pendingDeleteId.set(null);
  }

  protected deleteForm(): void {
    const id = this.pendingDeleteId();
    if (!id) return;
    this.formsService.remove(id).subscribe({
      next: () => {
        this.forms.update((list) => list.filter((f) => f.id !== id));
        this.pendingDeleteId.set(null);
      },
    });
  }
}
