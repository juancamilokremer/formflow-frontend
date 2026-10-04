import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { LandingComponent } from './landing.component';

describe('LandingComponent', () => {
  let mockTitle: { setTitle: ReturnType<typeof vi.fn> };
  let mockMeta: { updateTag: ReturnType<typeof vi.fn> };

  afterEach(() => {
    TestBed.resetTestingModule();
    document.getElementById('landing-json-ld')?.remove();
  });

  function setup() {
    mockTitle = { setTitle: vi.fn() };
    mockMeta = { updateTag: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: Title, useValue: mockTitle },
        { provide: Meta, useValue: mockMeta },
      ],
    });

    return TestBed.runInInjectionContext(() => new LandingComponent());
  }

  it('sets the page title', () => {
    setup();
    expect(mockTitle.setTitle).toHaveBeenCalledWith(
      expect.stringContaining('FormFlow'),
    );
  });

  it('sets description and og: meta tags', () => {
    setup();
    expect(mockMeta.updateTag).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'description' }),
    );
    expect(mockMeta.updateTag).toHaveBeenCalledWith(
      expect.objectContaining({ property: 'og:title' }),
    );
  });

  it('injects a JSON-LD SoftwareApplication script into <head>', () => {
    const component = setup();
    const document = TestBed.inject(DOCUMENT);
    const script = document.getElementById('landing-json-ld');

    expect(script).toBeTruthy();
    expect(script?.getAttribute('type')).toBe('application/ld+json');
    expect(JSON.parse(script!.textContent!)).toMatchObject({ '@type': 'SoftwareApplication' });
    expect(component).toBeTruthy();
  });

  it('does not duplicate the JSON-LD script if the component is created twice', () => {
    setup();
    const document = TestBed.inject(DOCUMENT);
    TestBed.resetTestingModule();

    setup();

    expect(document.querySelectorAll('#landing-json-ld').length).toBe(1);
  });
});
