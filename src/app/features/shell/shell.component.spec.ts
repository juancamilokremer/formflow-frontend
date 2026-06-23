import { ShellComponent } from './shell.component';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';

describe('ShellComponent', () => {
  let fixture: ComponentFixture<ShellComponent>;
  let component: ShellComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShellComponent],
      providers: [
        provideRouter([]),
        provideTranslateService({ lang: 'es' }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should start with sidebar closed', () => {
    expect((component as any).sidebarOpen()).toBe(false);
  });

  it('toggleSidebar should open when closed', () => {
    (component as any).toggleSidebar();
    expect((component as any).sidebarOpen()).toBe(true);
  });

  it('toggleSidebar should close when open', () => {
    (component as any).toggleSidebar();
    (component as any).toggleSidebar();
    expect((component as any).sidebarOpen()).toBe(false);
  });

  it('closeSidebar should always set to false', () => {
    (component as any).toggleSidebar();
    (component as any).closeSidebar();
    expect((component as any).sidebarOpen()).toBe(false);
  });
});
