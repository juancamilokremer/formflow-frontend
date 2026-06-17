import { Component, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

const SUPPORTED_LANGS = ['es', 'en'] as const;
type Lang = (typeof SUPPORTED_LANGS)[number];

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  templateUrl: './language-switcher.component.html',
  styleUrl: './language-switcher.component.scss',
})
export class LanguageSwitcherComponent {
  private readonly translate = inject(TranslateService);

  protected readonly langs = SUPPORTED_LANGS;

  protected get current(): Lang {
    return (this.translate.currentLang() ?? 'es') as Lang;
  }

  protected switch(lang: Lang): void {
    if (lang === this.current) return;
    this.translate.use(lang);
  }
}
