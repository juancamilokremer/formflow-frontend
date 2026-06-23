import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { PropertiesPanelComponent } from './properties-panel.component';

describe('PropertiesPanelComponent', () => {
  it('should instantiate', async () => {
    await TestBed.configureTestingModule({
      imports: [PropertiesPanelComponent],
      providers: [provideTranslateService({ lang: 'es' })],
    }).compileComponents();
    const fixture = TestBed.createComponent(PropertiesPanelComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
