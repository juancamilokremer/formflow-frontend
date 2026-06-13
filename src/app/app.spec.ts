import { App } from './app';

describe('App', () => {
  let component: App;

  beforeEach(() => {
    component = new App();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
