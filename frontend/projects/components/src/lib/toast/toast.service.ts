import { Injectable, signal } from '@angular/core';

export type ToastTone = 'info' | 'success' | 'warning' | 'danger';

export interface ToastOptions {
  tone: ToastTone;
  title: string;
  text?: string;
  /** Label of the optional action button; `action` runs when it is pressed. */
  actionLabel?: string;
  action?: () => void;
  /** A persistent toast never closes by itself; danger toasts are always persistent. */
  persistent?: boolean;
}

export interface Toast extends ToastOptions {
  readonly id: number;
}

/** Raises toasts; the `ui-toast-region` in the application shell renders them. */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  private readonly _toasts = signal<Toast[]>([]);

  readonly toasts = this._toasts.asReadonly();

  show(options: ToastOptions): number {
    const id = this.nextId++;
    this._toasts.update((list) => [...list, { ...options, id }]);
    return id;
  }

  dismiss(id: number): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
