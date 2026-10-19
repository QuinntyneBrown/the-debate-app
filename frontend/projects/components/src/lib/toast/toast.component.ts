import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, input, output, signal } from '@angular/core';
import { Toast } from './toast.service';

export const TOAST_DURATION_MS = 8000;

const ICON_PATHS: Record<Toast['tone'], string> = {
  info: 'M12 8h.01M12 11v5',
  success: 'm8 12 3 3 5-6',
  warning: 'M12 8v5M12 16h.01',
  danger: 'M12 8v4M12 16h.01',
};

/** One toast: closes itself after 8 s (not danger, not persistent), pausing while hovered or focused. */
@Component({
  selector: 'ui-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [class]="'toast toast--' + toast().tone"
      [attr.role]="toast().tone === 'danger' ? 'alert' : null"
      (mouseenter)="pause()"
      (mouseleave)="resume()"
      (focusin)="pause()"
      (focusout)="resume()"
    >
      <svg class="icon" aria-hidden="true" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path [attr.d]="iconPath()" />
      </svg>
      <div class="toast__body">
        <div class="toast__title">{{ toast().title }}</div>
        @if (toast().text) {
          <div class="toast__text">{{ toast().text }}</div>
        }
        @if (toast().actionLabel) {
          <button class="toast__action" type="button" (click)="act()">{{ toast().actionLabel }}</button>
        }
      </div>
      <button class="close" type="button" aria-label="Dismiss" (click)="dismiss.emit()">
        <svg class="icon icon--sm" aria-hidden="true" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" /></svg>
      </button>
      @if (autoCloses()) {
        <span class="toast__progress" [class.toast__progress--paused]="paused()" aria-hidden="true"></span>
      }
    </div>
  `,
  styles: `
    :host { display: block; }
    .toast__progress { width: 100%; transform-origin: left; animation: toast-countdown 8s linear forwards; }
    .toast__progress--paused { animation-play-state: paused; }
    @keyframes toast-countdown { from { transform: scaleX(1); } to { transform: scaleX(0); } }
  `,
})
export class ToastComponent implements OnInit, OnDestroy {
  readonly toast = input.required<Toast>();
  readonly dismiss = output<void>();

  protected readonly paused = signal(false);
  protected readonly autoCloses = computed(() => this.toast().tone !== 'danger' && !this.toast().persistent);
  protected readonly iconPath = computed(() => ICON_PATHS[this.toast().tone]);

  private remaining = TOAST_DURATION_MS;
  private startedAt = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;

  ngOnInit(): void {
    if (this.autoCloses()) this.start();
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
  }

  protected pause(): void {
    if (!this.autoCloses() || this.paused()) return;
    clearTimeout(this.timer);
    this.remaining -= Date.now() - this.startedAt;
    this.paused.set(true);
  }

  protected resume(): void {
    if (!this.autoCloses() || !this.paused()) return;
    this.paused.set(false);
    this.start();
  }

  protected act(): void {
    this.toast().action?.();
    this.dismiss.emit();
  }

  private start(): void {
    this.startedAt = Date.now();
    this.timer = setTimeout(() => this.dismiss.emit(), Math.max(0, this.remaining));
  }
}
