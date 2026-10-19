import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, inject, input, output } from '@angular/core';

/** Avatar menu content: who is signed in and the Sign out item. */
@Component({
  selector: 'ui-account-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="menu" role="menu" aria-label="Account" (keydown)="onKeydown($event)">
      <li role="none" class="account-menu__who">
        <div class="list__title">{{ name() }}</div>
        @if (username()) {
          <div class="list__meta">&#64;{{ username() }}</div>
        }
      </li>
      <li class="menu__divider" role="separator"></li>
      <li role="none">
        <button type="button" class="menu__item" role="menuitem" (click)="signOut.emit()">
          <svg class="icon" aria-hidden="true" viewBox="0 0 24 24">
            <path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 8l4 4-4 4M20 12H9" />
          </svg>
          Sign out
        </button>
      </li>
    </ul>
  `,
  styles: `
    :host { display: block; }
    .account-menu__who { padding: var(--space-2) var(--space-3); }
  `,
})
export class AccountMenuComponent implements AfterViewInit {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly name = input('');
  readonly username = input('');
  readonly signOut = output<void>();
  readonly dismiss = output<void>();

  ngAfterViewInit(): void {
    this.items()[0]?.focus();
  }

  protected onKeydown(event: KeyboardEvent): void {
    const items = this.items();
    const current = items.indexOf(document.activeElement as HTMLElement);
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        items[(current + 1) % items.length]?.focus();
        break;
      case 'ArrowUp':
        event.preventDefault();
        items[(current - 1 + items.length) % items.length]?.focus();
        break;
      case 'Escape':
      case 'Tab':
        this.dismiss.emit();
        break;
    }
  }

  private items(): HTMLElement[] {
    return Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>('[role="menuitem"]'));
  }
}
