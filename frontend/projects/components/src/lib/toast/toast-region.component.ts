import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastComponent } from './toast.component';
import { ToastService } from './toast.service';

/** The live region that stays in the page so screen readers announce toasts as they arrive. */
@Component({
  selector: 'ui-toast-region',
  imports: [ToastComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast-region" role="status" aria-live="polite">
      @for (toast of toasts.toasts(); track toast.id) {
        <ui-toast [toast]="toast" (dismiss)="toasts.dismiss(toast.id)" />
      }
    </div>
  `,
})
export class ToastRegionComponent {
  protected readonly toasts = inject(ToastService);
}
