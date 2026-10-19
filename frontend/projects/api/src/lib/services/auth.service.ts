import { Injectable, inject, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { Credentials, TokenResponse } from '../models/auth.models';
import { UserDto } from '../models/user.dto';
import { SessionService } from '../storage/session.service';
import { ApiClient } from './api-client';

/** Token endpoint, current user and the signed-in flag. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiClient);
  private readonly session = inject(SessionService);

  private readonly _signedIn = signal(this.session.get({ name: 'token' }) !== null);
  private readonly _user = signal<UserDto | null>(null);

  readonly signedIn = this._signedIn.asReadonly();
  readonly user = this._user.asReadonly();
  readonly sessionExpired$ = this.session.expired$;

  constructor() {
    this.session.expired$.subscribe(() => this.reset());
  }

  tryToLogin(credentials: Credentials): Observable<TokenResponse> {
    const body = new URLSearchParams({
      username: credentials.username,
      password: credentials.password,
      grant_type: 'password',
    }).toString();
    return this.api
      .request<TokenResponse>('POST', 'user/token', {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: body,
      })
      .pipe(
        tap((response) => {
          this.session.put({ name: 'token', value: response.access_token });
          this._signedIn.set(true);
        }),
      );
  }

  getCurrentUser(): Observable<UserDto | null> {
    return this.api.request<UserDto | null>('GET', 'user/current').pipe(
      map((user) => (user !== null && typeof user === 'object' ? user : null)),
      tap((user) => this._user.set(user)),
    );
  }

  signOut(): void {
    this.session.clear();
    this.reset();
  }

  private reset(): void {
    this._signedIn.set(false);
    this._user.set(null);
  }
}
