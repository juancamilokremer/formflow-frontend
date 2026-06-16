import { Component, input, inject, computed } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ICON_PATHS, IconName } from './icon.registry';

@Component({
  selector: 'app-icon',
  standalone: true,
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss',
})
export class IconComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly name = input.required<IconName>();
  readonly size = input(20);

  protected readonly svgMarkup = computed(() =>
    this.sanitizer.bypassSecurityTrustHtml(ICON_PATHS[this.name()])
  );
}
