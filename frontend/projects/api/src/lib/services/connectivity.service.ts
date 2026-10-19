import { DestroyRef, Injectable, inject, signal } from '@angular/core';

/** Whether the browser can reach the API; driven by window events and request outcomes. */
@Injectable({ providedIn: 'root' })
export class ConnectivityService {
  private readonly _online = signal(typeof navigator === 'undefined' ? true : navigator.onLine);
  readonly online = this._online.asReadonly();

  constructor() {
    const up = (): void => this.reportOnline();
    const down = (): void => this.reportOffline();
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    inject(DestroyRef).onDestroy(() => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    });
  }

  reportOffline(): void {
    this._online.set(false);
  }

  reportOnline(): void {
    this._online.set(true);
  }
}
