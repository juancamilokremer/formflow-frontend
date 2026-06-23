import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { FilePropertiesComponent } from './file-properties.component';

const MOCK_Q = {
  id: '1', type: 'file' as const, title: 'Q', description: null,
  position: 0, required: false, categoryId: null, config: {},
};

describe('FilePropertiesComponent', () => {
  let component: FilePropertiesComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilePropertiesComponent],
      providers: [provideTranslateService({ lang: 'es' })],
    }).compileComponents();
    const fixture = TestBed.createComponent(FilePropertiesComponent);
    fixture.componentRef.setInput('question', MOCK_Q);
    component = fixture.componentInstance;
  });

  it('creates', () => expect(component).toBeTruthy());

  it('emits required toggle', () => {
    const spy = spyOn(component.changed, 'emit');
    (component as any).onRequiredChange({ target: { checked: true } } as unknown as Event);
    expect(spy).toHaveBeenCalledWith({ required: true });
  });
});
