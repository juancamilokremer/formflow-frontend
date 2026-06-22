import { ShellComponent } from './shell.component';

describe('ShellComponent', () => {
  let component: ShellComponent;

  beforeEach(() => {
    component = new ShellComponent();
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
