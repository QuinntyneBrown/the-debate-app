import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { SessionItem } from '../models/auth.models';

/** Local storage key holding the session items. */
export const SESSION_STORAGE_KEY = 'theDebateApp';

/** Named key/value list persisted to local storage when the window unloads. */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly _items = signal<SessionItem[]>(this.read());
  private readonly expiredSubject = new Subject<void>();

  readonly items = this._items.asReadonly();
  /** Emits when an authenticated request was refused and the token was removed. */
  readonly expired$: Observable<void> = this.expiredSubject.asObservable();

  constructor() {
    const flush = (): void => this.write();
    window.addEventListener('beforeunload', flush);
    inject(DestroyRef).onDestroy(() => window.removeEventListener('beforeunload', flush));
  }

  put(item: SessionItem): void {
    this._items.update((items) =>
      items.some((i) => i.name === item.name)
        ? items.map((i) => (i.name === item.name ? { ...i, value: item.value } : i))
        : [...items, { ...item }],
    );
  }

  get(query: { name: string }): string | null {
    return this._items().find((i) => i.name === query.name)?.value ?? null;
  }

  clear(): void {
    this._items.set([]);
  }

  /** Removes the stored items and tells listeners that the session ended. */
  expire(): void {
    this.clear();
    this.expiredSubject.next();
  }

  private read(): SessionItem[] {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) ?? 'null');
      return Array.isArray(parsed) ? (parsed as SessionItem[]) : [];
    } catch {
      return [];
    }
  }

  private write(): void {
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(this._items()));
    } catch {
      // Storage may be unavailable (private mode, quota); the session then lives for this page only.
    }
  }
}
