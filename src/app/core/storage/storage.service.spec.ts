import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    service = new StorageService();
  });

  describe('localStorage', () => {
    it('returns null for missing key', () => {
      expect(service.get('missing')).toBeNull();
    });

    it('stores and retrieves a string value', () => {
      service.set('key', 'hello');
      expect(service.get<string>('key')).toBe('hello');
    });

    it('stores and retrieves an object', () => {
      const obj = { id: 1, name: 'FormFlow' };
      service.set('obj', obj);
      expect(service.get('obj')).toEqual(obj);
    });

    it('removes a key', () => {
      service.set('key', 'value');
      service.remove('key');
      expect(service.get('key')).toBeNull();
    });

    it('clears all keys', () => {
      service.set('a', 1);
      service.set('b', 2);
      service.clear();
      expect(service.get('a')).toBeNull();
      expect(service.get('b')).toBeNull();
    });
  });

  describe('sessionStorage', () => {
    it('returns null for missing key', () => {
      expect(service.getSession('missing')).toBeNull();
    });

    it('stores and retrieves a value', () => {
      service.setSession('token', 'abc123');
      expect(service.getSession<string>('token')).toBe('abc123');
    });

    it('removes a session key', () => {
      service.setSession('key', 'value');
      service.removeSession('key');
      expect(service.getSession('key')).toBeNull();
    });

    it('clears all session keys', () => {
      service.setSession('x', 1);
      service.setSession('y', 2);
      service.clearSession();
      expect(service.getSession('x')).toBeNull();
    });
  });
});
