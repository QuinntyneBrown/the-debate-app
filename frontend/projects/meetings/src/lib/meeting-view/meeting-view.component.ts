import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MeetingDto, MeetingsService } from '@the-debate-app/api';
import { TabComponent, TabStripComponent } from '@the-debate-app/components';
import { Subscription } from 'rxjs';
import { MEETINGS_NOW, isUpcoming, parseDate, plainDate, timeRange } from '../meeting-format';

type ViewStatus = 'loading' | 'ready' | 'error';

/** Read-only meeting page at `/meeting/:id`: name, when, Edit and the Abstract, Agenda and Minutes tabs. */
@Component({
  selector: 'ui-meeting-view',
  imports: [RouterLink, TabStripComponent, TabComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="main" class="container">
      <a class="btn btn--ghost btn--sm" routerLink="/meetings" style="margin-top: var(--space-4)">
        <svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><path d="m15 6-6 6 6 6" /></svg>Meetings
      </a>

      @if (status() === 'error') {
        <div class="empty empty--error">
          <span class="empty__icon">
            <svg class="icon icon--lg" aria-hidden="true" viewBox="0 0 24 24"><path d="M2 2l20 20M7 18h11a4 4 0 0 0 1.5-7.7A7 7 0 0 0 8 8.5M4.5 10.5A4 4 0 0 0 7 18" /></svg>
          </span>
          <h1 class="empty__title">We couldn't open this meeting</h1>
          <p class="empty__text">It may have been deleted, or the connection dropped.</p>
          <div class="empty__actions">
            <button class="btn btn--primary" type="button" (click)="load()">
              <svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5" /></svg>Try again
            </button>
            <a class="btn" routerLink="/meetings">Back to meetings</a>
          </div>
        </div>
      } @else {
        <div class="page-header">
          <div>
            @if (meeting(); as m) {
              <h1>{{ m.name }}</h1>
              @if (when()) {
                <p class="subtitle">{{ when() }}</p>
              }
            } @else {
              <h1><span class="skeleton skeleton--title" style="width: 16rem; display: inline-block" aria-hidden="true"></span></h1>
              <p class="subtitle"><span class="skeleton skeleton--text" style="width: 10rem; display: inline-block" aria-hidden="true"></span></p>
            }
          </div>
          <div class="cluster">
            <a class="btn btn--primary" [routerLink]="editPath()">
              <svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3z" /><path d="m13 7 3 3" /></svg>Edit
            </a>
          </div>
        </div>

        @if (meeting(); as m) {
          <ui-tab-strip aria-label="Meeting sections">
            @for (section of sections(); track section.title) {
              <ui-tab [title]="section.title" [selected]="section.title === first()">
                <div class="card prose">
                  @if (section.html) {
                    <div [innerHTML]="section.html"></div>
                  } @else {
                    <p class="text-muted">Nothing here yet.</p>
                  }
                </div>
              </ui-tab>
            }
          </ui-tab-strip>
        } @else {
          <div class="tabs__panel card" aria-busy="true" aria-label="Loading meeting">
            <span class="skeleton skeleton--text" aria-hidden="true"></span>
            <span class="skeleton skeleton--text" aria-hidden="true"></span>
            <span class="skeleton skeleton--text" aria-hidden="true"></span>
            <span class="skeleton skeleton--text" aria-hidden="true"></span>
          </div>
        }
      }
    </main>
  `,
})
export class MeetingViewComponent {
  private readonly api = inject(MeetingsService);
  private readonly now = inject(MEETINGS_NOW);

  /** The `:id` route parameter. */
  readonly id = input<string | undefined>(undefined);

  protected readonly status = signal<ViewStatus>('loading');
  protected readonly meeting = signal<MeetingDto | null>(null);

  protected readonly editPath = computed(() => `/meeting/${this.id()}/edit`);
  protected readonly when = computed(() => {
    const m = this.meeting();
    if (!m) return '';
    const date = parseDate(m.date);
    return [date ? plainDate(date) : '', timeRange(m.start, m.end)].filter(Boolean).join(' · ');
  });
  protected readonly sections = computed(() => {
    const m = this.meeting();
    return [
      { title: 'Abstract', html: m?.abstract ?? '' },
      { title: 'Agenda', html: m?.agenda ?? '' },
      { title: 'Minutes', html: m?.minutes ?? '' },
    ];
  });
  /** Minutes open first for a past meeting, Abstract for an upcoming one. */
  protected readonly first = computed(() => {
    const m = this.meeting();
    return m && !isUpcoming(m, this.now()) ? 'Minutes' : 'Abstract';
  });

  private request?: Subscription;

  constructor() {
    effect(() => {
      this.id();
      untracked(() => this.load());
    });
    inject(DestroyRef).onDestroy(() => this.request?.unsubscribe());
  }

  protected load(): void {
    const id = Number(this.id());
    this.request?.unsubscribe();
    this.status.set('loading');
    this.meeting.set(null);
    if (!Number.isInteger(id)) {
      this.status.set('error');
      return;
    }
    this.request = this.api.getById(id).subscribe({
      next: (m) => {
        this.meeting.set(m);
        this.status.set('ready');
      },
      error: () => this.status.set('error'),
    });
  }
}
