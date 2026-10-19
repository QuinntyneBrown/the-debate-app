import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MeetingDto, MeetingsService } from '@the-debate-app/api';
import { ToastService } from '@the-debate-app/components';
import { Subscription } from 'rxjs';
import { DeleteDialogState, DeleteMeetingDialogComponent } from '../dialogs/delete-meeting-dialog.component';
import { MeetingDeleteSelect, MeetingDeleteSuccess, MeetingEditSelect, MeetingViewSelect } from '../meeting-events';
import { MEETINGS_NOW, groupMeetings, listSummary } from '../meeting-format';
import { MeetingItemComponent } from '../meeting-item/meeting-item.component';

/** The request must be outstanding this long before the skeleton replaces the empty page. */
const LOADING_DELAY_MS = 300;

type ListStatus = 'pending' | 'loading' | 'ready' | 'error';

/** The meetings page: loads every meeting, groups it into Upcoming and Past, and deletes with confirmation. */
@Component({
  selector: 'ui-meeting-list',
  imports: [RouterLink, MeetingItemComponent, DeleteMeetingDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="main" class="container">
      <div class="page-header">
        <div>
          <h1>Meetings</h1>
          @if (status() === 'ready' && meetings().length > 0) {
            <p class="subtitle">{{ summary() }}</p>
          } @else if (status() === 'loading') {
            <p class="subtitle"><span class="skeleton skeleton--text" style="width: 14rem; display: inline-block" aria-hidden="true"></span></p>
          }
        </div>
        @if (status() !== 'ready' || meetings().length > 0) {
          <div class="cluster">
            <a class="btn btn--primary" routerLink="/meeting/create">
              <svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>New meeting
            </a>
          </div>
        }
      </div>

      @switch (status()) {
        @case ('loading') {
          <div class="stack" aria-busy="true" aria-label="Loading meetings">
            @for (group of skeletonGroups; track group.title) {
              <section class="stack">
                <h2 class="overline">{{ group.title }}</h2>
                <ul class="list card card--flush">
                  @for (row of group.rows; track row) {
                    <li class="meeting" aria-hidden="true">
                      <span class="skeleton skeleton--rect" style="width: 3.5rem; height: 3.5rem"></span>
                      <div class="meeting__body">
                        <span class="skeleton skeleton--title" style="width: 60%"></span>
                        <span class="skeleton skeleton--text" style="width: 35%"></span>
                        <span class="skeleton skeleton--text" style="width: 80%"></span>
                      </div>
                    </li>
                  }
                </ul>
              </section>
            }
          </div>
        }
        @case ('error') {
          <div class="empty empty--error">
            <span class="empty__icon">
              <svg class="icon icon--lg" aria-hidden="true" viewBox="0 0 24 24"><path d="M2 2l20 20M7 18h11a4 4 0 0 0 1.5-7.7A7 7 0 0 0 8 8.5M4.5 10.5A4 4 0 0 0 7 18" /></svg>
            </span>
            <h2 class="empty__title">We couldn't load the meetings</h2>
            <p class="empty__text">Check your connection and try again.</p>
            <div class="empty__actions">
              <button class="btn btn--primary" type="button" (click)="load()">
                <svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5" /></svg>Try again
              </button>
            </div>
          </div>
        }
        @case ('ready') {
          @if (meetings().length === 0) {
            <div class="empty">
              <span class="empty__icon">
                <svg class="icon icon--lg" aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
              </span>
              <h2 class="empty__title">No meetings yet</h2>
              <p class="empty__text">Create the first one and the club has a place to meet.</p>
              <div class="empty__actions">
                <a class="btn btn--primary" routerLink="/meeting/create">
                  <svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>New meeting
                </a>
              </div>
            </div>
          } @else {
            @if (groups().upcoming.length > 0) {
              <section class="stack" aria-labelledby="upcoming-h">
                <h2 class="overline" id="upcoming-h">Upcoming</h2>
                <ul class="list card card--flush">
                  @for (m of groups().upcoming; track m.id) {
                    <li ui-meeting-item [meeting]="m" [today]="today()" (edit)="edit($event)" (view)="view($event)" (delete)="askDelete($event)"></li>
                  }
                </ul>
              </section>
            }
            @if (groups().past.length > 0) {
              <section class="stack" aria-labelledby="past-h">
                <h2 class="overline" id="past-h">Past</h2>
                <ul class="list card card--flush">
                  @for (m of groups().past; track m.id) {
                    <li ui-meeting-item [meeting]="m" [past]="true" [today]="today()" (edit)="edit($event)" (view)="view($event)" (delete)="askDelete($event)"></li>
                  }
                </ul>
              </section>
            }
          }
        }
      }
    </main>
    @if (pendingDelete(); as target) {
      <ui-delete-meeting-dialog [name]="target.name" [state]="deleteState()" (confirm)="confirmDelete()" (cancel)="cancelDelete()" />
    }
  `,
})
export class MeetingListComponent {
  private readonly api = inject(MeetingsService);
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastService);
  private readonly now = inject(MEETINGS_NOW);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly status = signal<ListStatus>('pending');
  protected readonly meetings = signal<MeetingDto[]>([]);
  protected readonly today = signal(this.now());
  protected readonly pendingDelete = signal<MeetingDto | null>(null);
  protected readonly deleteState = signal<DeleteDialogState>('default');

  protected readonly groups = computed(() => groupMeetings(this.meetings(), this.today()));
  protected readonly summary = computed(() => listSummary(this.groups().upcoming, this.today()));
  protected readonly skeletonGroups = [
    { title: 'Upcoming', rows: [1, 2] },
    { title: 'Past', rows: [1, 2, 3] },
  ];

  private request?: Subscription;
  private loadingTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    this.load();
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.loadingTimer);
      this.request?.unsubscribe();
    });
  }

  protected load(): void {
    this.request?.unsubscribe();
    clearTimeout(this.loadingTimer);
    this.status.set('pending');
    this.today.set(this.now());
    this.loadingTimer = setTimeout(() => this.status.update((s) => (s === 'pending' ? 'loading' : s)), LOADING_DELAY_MS);
    this.request = this.api.get().subscribe({
      next: (meetings) => {
        clearTimeout(this.loadingTimer);
        this.meetings.set(meetings);
        this.status.set('ready');
      },
      error: () => {
        clearTimeout(this.loadingTimer);
        this.status.set('error');
      },
    });
  }

  protected edit(id: number): void {
    this.host.nativeElement.dispatchEvent(MeetingEditSelect(id));
    void this.router.navigateByUrl(`/meeting/${id}/edit`);
  }

  protected view(id: number): void {
    this.host.nativeElement.dispatchEvent(MeetingViewSelect(id));
    void this.router.navigateByUrl(`/meeting/${id}`);
  }

  protected askDelete(id: number): void {
    const target = this.meetings().find((m) => m.id === id);
    if (!target) return;
    this.host.nativeElement.dispatchEvent(MeetingDeleteSelect(id));
    this.deleteState.set('default');
    this.pendingDelete.set(target);
  }

  protected cancelDelete(): void {
    this.pendingDelete.set(null);
  }

  protected confirmDelete(): void {
    const target = this.pendingDelete();
    if (!target) return;
    this.deleteState.set('busy');
    this.api.remove(target.id).subscribe({
      next: () => {
        this.meetings.update((list) => list.filter((m) => m.id !== target.id));
        this.pendingDelete.set(null);
        this.toasts.show({ tone: 'success', title: 'Meeting deleted', text: target.name });
        this.host.nativeElement.dispatchEvent(MeetingDeleteSuccess(target.id));
      },
      error: () => this.deleteState.set('failed'),
    });
  }
}
