import { TestBed, ComponentFixture } from '@angular/core/testing';
import { IconComponent } from './icon.component';

describe('IconComponent', () => {
  let component: IconComponent;
  let fixture: ComponentFixture<IconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IconComponent);
    fixture.componentRef.setInput('name', 'eye');
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('size defaults to 20', () => {
    expect(component.size()).toBe(20);
  });

  it('accepts eye-off name', () => {
    fixture.componentRef.setInput('name', 'eye-off');
    expect(component.name()).toBe('eye-off');
  });

  it('resolves a trusted svgMarkup for the registry entry', () => {
    expect((component as any).svgMarkup()).toBeTruthy();
  });
});
