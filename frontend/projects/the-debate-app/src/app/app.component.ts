import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, inject, signal, untracked } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { AuthService, ConnectivityService } from '@the-debate-app/api';
import { AccountMenuComponent, BannerComponent, HeaderComponent, HeaderLink, ToastRegionComponent } from '@the-debate-app/components';
import { filter, map } from 'rxjs';

/** Pages that use the full-page layout of the mocks and therefore have no header. */
const HEADERLESS_PATHS = ['/', '/login'];
const RECOVERY_BANNER_MS = 8000;

/** Application shell: connectivity banners, header with account menu, and the routed view. */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, AccountMenuComponent, BannerComponent, ToastRegionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:click)': 'onDocumentClick($event)' },
  template: `
    <a class="skip-link" href="#main">Skip to content</a>
    @if (!connectivity.online()) {
      <ui-banner tone="warning" [persistent]="true" title="You're offline.">
        Changes can't be saved until the connection is back.
      </ui-banner>
    } @else if (recovered()) {
      <ui-banner tone="success" title="You're back online." (dismiss)="recovered.set(false)">
        Everything is up to date.
      </ui-banner>
    }
    @if (showHeader()) {
      <div class="shell-header" (keydown)="onHeaderKeydown($event)">
        <ui-header
          title="The Debate App"
          [links]="links"
          [signedIn]="auth.signedIn()"
          [initials]="initials()"
          (titleClick)="goHome()"
          (accountClick)="toggleMenu()"
        />
        @if (menuOpen()) {
          <div class="shell-header__menu">
            <ui-account-menu
              [name]="auth.user()?.name ?? ''"
                            (signOut)="signOut()"
              (dismiss)="closeMenu(true)"
            />
          </div>
        }
      </div>
    }
    <router-outlet />
    <ui-toast-region />
  `,
  styles: `
    :host { display: block; }
    .shell-header { position: relative; }
    .shell-header__menu { position: absolute; z-index: var(--z-dropdown); top: calc(100% + var(--space-1)); right: var(--layout-margin); }
  `,
})
export class AppComponent {
  protected readonly auth = inject(AuthService);
  protected readonly connectivity = inject(ConnectivityService);
  private readonly router = inject(Router);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly links: HeaderLink[] = [
    { label: 'Meetings', routeSegments: ['meetings'] },
    { label: 'New meeting', routeSegments: ['meeting', 'create'] },
  ];
  protected readonly menuOpen = signal(false);
  protected readonly recovered = signal(false);

  private readonly path = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects.split(/[?#]/)[0] || '/'),
    ),
    { initialValue: this.router.url.split(/[?#]/)[0] || '/' },
  );
  protected readonly showHeader = computed(() => !HEADERLESS_PATHS.includes(this.path()));
  protected readonly initials = computed(() => (this.auth.user()?.name.trim().charAt(0) || 'U').toUpperCase());

  private wasOffline = false;

  constructor() {
    effect(() => {
      if (this.auth.signedIn()) {
        untracked(() => this.auth.getCurrentUser().subscribe({ error: () => undefined }));
      }
    });

    effect((onCleanup) => {
      if (!this.connectivity.online()) {
        this.wasOffline = true;
        this.recovered.set(false);
      } else if (this.wasOffline) {
        this.wasOffline = false;
        this.recovered.set(true);
        const timer = setTimeout(() => this.recovered.set(false), RECOVERY_BANNER_MS);
        onCleanup(() => clearTimeout(timer));
      }
    });

    this.auth.sessionExpired$.pipe(takeUntilDestroyed()).subscribe(() => {
      this.menuOpen.set(false);
      const current = this.router.url;
      const returnUrl = current.startsWith('/login') ? undefined : current;
      void this.router.navigate(['/login'], { queryParams: { state: 'expired', returnUrl } });
    });
  }

  protected goHome(): void {
    void this.router.navigateByUrl('/');
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(restoreFocus: boolean): void {
    this.menuOpen.set(false);
    if (restoreFocus) this.avatar()?.focus();
  }

  protected signOut(): void {
    this.auth.signOut();
    this.menuOpen.set(false);
    void this.router.navigate(['/login'], { queryParams: { state: 'signed-out' } });
  }

  protected onHeaderKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' && event.target === this.avatar() && !this.menuOpen()) {
      event.preventDefault();
      this.menuOpen.set(true);
    }
  }

  protected onDocumentClick(event: Event): void {
    const target = event.target as Node | null;
    if (!this.menuOpen() || !target) return;
    const inside = this.host.nativeElement.querySelector('.shell-header__menu')?.contains(target) || this.avatar()?.contains(target);
    if (!inside) this.menuOpen.set(false);
  }

  private avatar(): HTMLElement | null {
    return this.host.nativeElement.querySelector('ui-header button.avatar');
  }
}
