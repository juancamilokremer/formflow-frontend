import { LockBannerComponent } from './lock-banner.component';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';

describe('LockBannerComponent', () => {
  let fixture: ComponentFixture<LockBannerComponent>;
  let component: LockBannerComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LockBannerComponent],
      providers: [provideTranslateService({ lang: 'es' })],
    }).compileComponents();

    fixture = TestBed.createComponent(LockBannerComponent);
    fixture.componentRef.setInput('status', 'ACTIVE');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('accepts the status input', () => {
    expect(component.status()).toBe('ACTIVE');
  });
});
