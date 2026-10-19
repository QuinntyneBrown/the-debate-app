import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MeetingDto } from '@the-debate-app/api';
import { monthShort, parseDate, whenLabel } from '../meeting-format';

/** One row of the meetings page; raises `edit`, `view` and `delete` with the meeting id. */
@Component({
  selector: 'li[ui-meeting-item]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'meeting', '[class.meeting--past]': 'past()' },
  template: `
    <div class="meeting__date" aria-hidden="true">
      <span class="meeting__day">{{ day() }}</span><span class="meeting__month">{{ month() }}</span>
    </div>
    <div class="meeting__body">
      <h2 class="meeting__title">
        <a [attr.href]="viewPath()" [attr.title]="meeting().name" (click)="raise($event, 'view')">{{ meeting().name }}</a>
      </h2>
      <div class="meeting__when">{{ when() }}</div>
      @if (meeting().abstract) {
        <p class="meeting__excerpt" [attr.title]="excerptTitle()" [innerHTML]="meeting().abstract"></p>
      } @else {
        <p class="meeting__excerpt text-muted" title="No abstract yet">No abstract yet</p>
      }
    </div>
    <div class="meeting__actions">
      <a class="btn btn--ghost btn--sm btn--icon" [attr.href]="viewPath()" [attr.aria-label]="'View ' + meeting().name" (click)="raise($event, 'view')">
        <svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
      </a>
      <a class="btn btn--ghost btn--sm btn--icon" [attr.href]="editPath()" [attr.aria-label]="'Edit ' + meeting().name" (click)="raise($event, 'edit')">
        <svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3z" /><path d="m13 7 3 3" /></svg>
      </a>
      <button class="btn btn--ghost btn--sm btn--icon" type="button" [attr.aria-label]="'Delete ' + meeting().name" (click)="delete.emit(meeting().id)">
        <svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>
      </button>
    </div>
  `,
})
export class MeetingItemComponent {
  readonly meeting = input.required<MeetingDto>();
  readonly past = input(false);
  /** The date used to word "Today" and "Tomorrow". */
  readonly today = input(new Date());

  readonly edit = output<number>();
  readonly view = output<number>();
  readonly delete = output<number>();

  private readonly date = computed(() => parseDate(this.meeting().date));
  protected readonly day = computed(() => this.date()?.getDate() ?? '—');
  protected readonly month = computed(() => (this.date() ? monthShort(this.date()!) : 'tbc'));
  protected readonly when = computed(() => whenLabel(this.meeting(), this.today()));
  protected readonly viewPath = computed(() => `/meeting/${this.meeting().id}`);
  protected readonly editPath = computed(() => `/meeting/${this.meeting().id}/edit`);
  protected readonly excerptTitle = computed(() => this.meeting().abstract.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());

  protected raise(event: Event, kind: 'edit' | 'view'): void {
    event.preventDefault();
    (kind === 'edit' ? this.edit : this.view).emit(this.meeting().id);
  }
}
