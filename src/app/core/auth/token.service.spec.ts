import { TestBed } from '@angular/core/testing';
import { TokenService } from './token.service';

const VALID_PAYLOAD = { sub: 'uid1', tenantId: 'tid1', email: 'a@b.com', role: 'TENANT_ADMIN', exp: 9999999999, iat: 0 };
const buildToken = (payload: object) =>
  'header.' + btoa(JSON.stringify(payload)).replace(/=/g, '') + '.sig';

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [TokenService] });
    service = TestBed.inject(TokenService);
  });

  describe('setTokens / getters', () => {
    it('stores access token in memory and refresh + slug in localStorage', () => {
      service.setTokens({ accessToken: 'acc', refreshToken: 'ref' }, 'acme');
      expect(service.getAccessToken()).toBe('acc');
      expect(service.getRefreshToken()).toBe('ref');
      expect(service.getTenantSlug()).toBe('acme');
    });
  });

  describe('clearTokens', () => {
    it('wipes memory and localStorage', () => {
      service.setTokens({ accessToken: 'acc', refreshToken: 'ref' }, 'acme');
      service.clearTokens();
      expect(service.getAccessToken()).toBeNull();
      expect(service.getRefreshToken()).toBeNull();
      expect(service.getTenantSlug()).toBeNull();
    });
  });

  describe('decodeJwt', () => {
    it('returns payload for a valid token', () => {
      const token = buildToken(VALID_PAYLOAD);
      const decoded = service.decodeJwt(token);
      expect(decoded?.sub).toBe('uid1');
      expect(decoded?.email).toBe('a@b.com');
    });

    it('returns null for a malformed token', () => {
      expect(service.decodeJwt('not.a.token!!')).toBeNull();
      expect(service.decodeJwt('only-one-part')).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    it('returns false for a future exp', () => {
      const token = buildToken(VALID_PAYLOAD);
      expect(service.isTokenExpired(token)).toBe(false);
    });

    it('returns true for a past exp', () => {
      const token = buildToken({ ...VALID_PAYLOAD, exp: 1 });
      expect(service.isTokenExpired(token)).toBe(true);
    });

    it('returns true for a malformed token', () => {
      expect(service.isTokenExpired('bad')).toBe(true);
    });
  });
});
