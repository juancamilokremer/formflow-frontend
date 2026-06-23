import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '../../../../shared/icons/icon.component';
import { FormsService } from '../../services/forms.service';
import { FormDetail } from '../../models/form.model';
import { BuilderTopbarComponent } from './components/builder-topbar/builder-topbar.component';
import { FieldTypesPanelComponent } from './components/field-types-panel/field-types-panel.component';
import { BuilderCanvasComponent } from './components/builder-canvas/builder-canvas.component';
import { PropertiesPanelComponent } from './components/properties-panel/properties-panel.component';

@Component({
  selector: 'app-form-builder',
  imports: [
    TranslatePipe,
    IconComponent,
    BuilderTopbarComponent,
    FieldTypesPanelComponent,
    BuilderCanvasComponent,
    PropertiesPanelComponent,
  ],
  templateUrl: './form-builder.component.html',
  styleUrl: './form-builder.component.scss',
})
export class FormBuilderComponent implements OnInit {
  private readonly route       = inject(ActivatedRoute);
  private readonly formsService = inject(FormsService);

  protected readonly loading   = signal(true);
  protected readonly loadError = signal(false);
  protected readonly form      = signal<FormDetail | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.formsService.getById(id).subscribe({
      next: (f) => { this.form.set(f); this.loading.set(false); },
      error: () => { this.loadError.set(true); this.loading.set(false); },
    });
  }

  protected onNameChanged(name: string): void {
    const form = this.form()!;
    this.formsService.update(form.id, name, form.description, form.timeLimitSeconds).subscribe({
      next: () => this.form.update((f) => (f ? { ...f, name } : f)),
    });
  }

  protected onPublishClicked(): void {
    // stub — implemented in a future issue
  }

  protected onSectionAdded(title: string): void {
    const id = this.form()!.id;
    this.formsService.createSection(id, { title }).subscribe({
      next: (section) =>
        this.form.update((f) => (f ? { ...f, sections: [...f.sections, section] } : f)),
    });
  }

  protected onSectionUpdated(update: { id: string; title: string }): void {
    const id = this.form()!.id;
    this.formsService.updateSection(id, update.id, { title: update.title }).subscribe({
      next: () =>
        this.form.update((f) =>
          f
            ? {
                ...f,
                sections: f.sections.map((s) =>
                  s.id === update.id ? { ...s, title: update.title } : s,
                ),
              }
            : f,
        ),
    });
  }

  protected onSectionDeleted(sectionId: string): void {
    const id = this.form()!.id;
    this.formsService.deleteSection(id, sectionId).subscribe({
      next: () =>
        this.form.update((f) =>
          f ? { ...f, sections: f.sections.filter((s) => s.id !== sectionId) } : f,
        ),
    });
  }
}
