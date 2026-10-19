import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

/** Navigates the client router to the path built from its route segments. */
@Component({
  selector: 'ui-link',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.active]': 'active()',
    '(click)': 'navigate($event)',
    style: 'cursor: pointer',
  },
  template: `<a class="nav-link" [attr.href]="path()" [attr.aria-current]="active() ? 'page' : null"><ng-content /></a>`,
})
export class LinkComponent {
  private readonly router = inject(Router);

  readonly routeSegments = input<string[]>([]);

  protected readonly path = computed(() => '/' + this.routeSegments().join('/'));
  private readonly currentPath = signal(this.pathOf(this.router.url));
  protected readonly active = computed(() => this.currentPath() === this.path());

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((e) => this.currentPath.set(this.pathOf(e.urlAfterRedirects)));
  }

  protected navigate(event: Event): void {
    event.preventDefault();
    void this.router.navigate(['/', ...this.routeSegments()]);
  }

  private pathOf(url: string): string {
    return url.split(/[?#]/)[0] || '/';
  }
}
