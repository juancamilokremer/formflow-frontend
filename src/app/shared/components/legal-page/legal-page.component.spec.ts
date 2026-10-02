import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { LegalPageComponent } from './legal-page.component';

describe('LegalPageComponent', () => {
  let component: LegalPageComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LegalPageComponent],
      providers: [provideRouter([]), provideTranslateService({ lang: 'es' })],
    });

    const fixture = TestBed.createComponent(LegalPageComponent);
    fixture.componentRef.setInput('title', 'Términos');
    fixture.componentRef.setInput('lastUpdated', '1 de enero de 2026');
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
