import { TestBed, ComponentFixture } from '@angular/core/testing';
import { SuccessCardComponent } from './success-card.component';

describe('SuccessCardComponent', () => {
  let component: SuccessCardComponent;
  let fixture: ComponentFixture<SuccessCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuccessCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SuccessCardComponent);
    fixture.componentRef.setInput('title', 'Listo');
    fixture.componentRef.setInput('message', 'Todo salió bien');
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('exposes the title and message inputs', () => {
    expect(component.title()).toBe('Listo');
    expect(component.message()).toBe('Todo salió bien');
  });
});
