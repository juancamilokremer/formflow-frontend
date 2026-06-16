import { Injectable, inject } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { StorageKeys } from '../storage/storage-keys.constants';
import { AuthTokens, JwtPayload } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class TokenService {
  protected readonly storage = inject(StorageService);

  private accessToken: string | null = null;

  setTokens(tokens: AuthTokens, tenantSlug: string): void {
    this.accessToken = tokens.accessToken;
    this.storage.set(StorageKeys.REFRESH_TOKEN, tokens.refreshToken);
    this.storage.set(StorageKeys.TENANT_SLUG, tenantSlug);
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.storage.get<string>(StorageKeys.REFRESH_TOKEN);
  }

  getTenantSlug(): string | null {
    return this.storage.get<string>(StorageKeys.TENANT_SLUG);
  }

  clearTokens(): void {
    this.accessToken = null;
    this.storage.remove(StorageKeys.REFRESH_TOKEN);
    this.storage.remove(StorageKeys.TENANT_SLUG);
  }

  decodeJwt(token: string): JwtPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = parts[1];
      const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
      return JSON.parse(atob(padded)) as JwtPayload;
    } catch {
      return null;
    }
  }

  isTokenExpired(token: string): boolean {
    const payload = this.decodeJwt(token);
    if (!payload) return true;
    return Date.now() >= payload.exp * 1000;
  }
}
