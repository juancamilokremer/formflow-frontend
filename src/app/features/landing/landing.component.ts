import { Component, DOCUMENT, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { NavbarPublicComponent } from '../../shared/components/navbar-public/navbar-public.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { PricingSectionComponent } from '../../shared/components/pricing-section/pricing-section.component';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { FeaturesSectionComponent } from './components/features-section/features-section.component';
import { UseCasesSectionComponent } from './components/use-cases-section/use-cases-section.component';
import { HowItWorksSectionComponent } from './components/how-it-works-section/how-it-works-section.component';
import { TestimonialsSectionComponent } from './components/testimonials-section/testimonials-section.component';
import { CtaBannerComponent } from './components/cta-banner/cta-banner.component';

const JSON_LD_SCRIPT_ID = 'landing-json-ld';

@Component({
  selector: 'app-landing',
  imports: [
    NavbarPublicComponent, FooterComponent, PricingSectionComponent,
    HeroSectionComponent, FeaturesSectionComponent, UseCasesSectionComponent,
    HowItWorksSectionComponent, TestimonialsSectionComponent, CtaBannerComponent,
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent {
  private readonly titleService = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  constructor() {
    this.titleService.setTitle('FormFlow — Crea formularios inteligentes, analiza resultados');
    this.meta.updateTag({
      name: 'description',
      content:
        'Diseña encuestas dinámicas, recolecta respuestas y obtén estadísticas visuales automáticas con scoring por categoría y convocatorias.',
    });
    this.meta.updateTag({ property: 'og:title', content: 'FormFlow' });
    this.meta.updateTag({
      property: 'og:description',
      content: 'Crea formularios, analiza resultados y gestiona convocatorias con scoring automático.',
    });
    this.meta.updateTag({ property: 'og:image', content: 'https://app.formflow.app/favicon.ico' });
    this.injectJsonLd();
  }

  private injectJsonLd(): void {
    if (this.document.getElementById(JSON_LD_SCRIPT_ID)) return;

    const script = this.document.createElement('script');
    script.id = JSON_LD_SCRIPT_ID;
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'FormFlow',
      applicationCategory: 'BusinessApplication',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    });
    this.document.head.appendChild(script);
  }
}
