import { Component, computed, inject, signal } from '@angular/core';
import { LowerCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { formBuilderPath } from '../../core/constants/route.constants';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { IconComponent } from '../../shared/icons/icon.component';
import { FormsService } from './services/forms.service';
import { Form, FormStatus, FormType } from './models/form.model';

interface FormTypeOption {
  value: FormType;
  labelKey: string;
  descKey: string;
}

const FORM_TYPE_OPTIONS: FormTypeOption[] = [
  { value: 'CANDIDATES', labelKey: 'forms.type.candidates', descKey: 'forms.type.candidates_desc' },
  { value: 'DIAGNOSTIC', labelKey: 'forms.type.diagnostic', descKey: 'forms.type.diagnostic_desc' },
  { value: 'REGISTRATION', labelKey: 'forms.type.registration', descKey: 'forms.type.registration_desc' },
];

const STATUS_FILTER_OPTIONS: Array<{ value: FormStatus | 'ALL'; labelKey: string }> = [
  { value: 'ALL', labelKey: 'forms.filter.all' },
  { value: 'ACTIVE', labelKey: 'forms.filter.active' },
  { value: 'DRAFT', labelKey: 'forms.filter.draft' },
  { value: 'ARCHIVED', labelKey: 'forms.filter.archived' },
];

@Component({
  selector: 'app-forms',
  imports: [TranslatePipe, LowerCasePipe, ButtonComponent, IconComponent],
  templateUrl: './forms.component.html',
  styleUrl: './forms.component.scss',
})
export class FormsComponent {
  private readonly formsService = inject(FormsService);
  private readonly router = inject(Router);

  protected readonly forms = signal<Form[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);
  protected readonly searchQuery = signal('');
  protected readonly statusFilter = signal<FormStatus | 'ALL'>('ALL');

  protected readonly showDialog = signal(false);
  protected readonly newName = signal('');
  protected readonly newType = signal<FormType>('CANDIDATES');
  protected readonly creating = signal(false);

  protected readonly pendingDeleteId = signal<string | null>(null);

  protected readonly formTypeOptions = FORM_TYPE_OPTIONS;
  protected readonly statusFilterOptions = STATUS_FILTER_OPTIONS;

  protected readonly totalResponses = computed(() =>
    this.forms().reduce((acc, f) => acc + f.responseCount, 0),
  );

  protected readonly activeCount = computed(
    () => this.forms().filter((f) => f.status === 'ACTIVE').length,
  );

  protected readonly draftCount = computed(
    () => this.forms().filter((f) => f.status === 'DRAFT').length,
  );

  protected readonly filteredForms = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const s = this.statusFilter();
    return this.forms().filter(
      (f) =>
        (s === 'ALL' || f.status === s) &&
        (!q || f.name.toLowerCase().includes(q)),
    );
  });

  constructor() {
    this.loadForms();
  }

  private loadForms(): void {
    this.formsService.getAll().subscribe({
      next: (forms) => {
        this.forms.set(forms);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.loading.set(false);
      },
    });
  }

  protected onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  protected onStatusFilter(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value as FormStatus | 'ALL');
  }

  protected openDialog(): void {
    this.newName.set('');
    this.newType.set('CANDIDATES');
    this.showDialog.set(true);
  }

  protected closeDialog(): void {
    if (!this.creating()) this.showDialog.set(false);
  }

  protected selectType(type: FormType): void {
    this.newType.set(type);
  }

  protected createForm(): void {
    const name = this.newName().trim();
    if (!name) return;
    this.creating.set(true);
    this.formsService.create({ name, type: this.newType() }).subscribe({
      next: (form) => {
        this.router.navigate(formBuilderPath(form.id));
      },
      error: () => {
        this.creating.set(false);
      },
    });
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

  protected deleteForm(id: string): void {
    this.formsService.remove(id).subscribe({
      next: () => {
        this.forms.update((list) => list.filter((f) => f.id !== id));
        this.pendingDeleteId.set(null);
      },
    });
  }

  protected formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  protected formatRelative(iso: string | null): string {
    if (!iso) return '—';
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `hace ${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `hace ${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `hace ${days}d`;
  }
}
