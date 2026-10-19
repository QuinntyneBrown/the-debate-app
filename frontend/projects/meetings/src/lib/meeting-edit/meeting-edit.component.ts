import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MeetingDto, MeetingsService } from '@the-debate-app/api';
import { RichTextEditorComponent, TabComponent, TabStripComponent, ToastService } from '@the-debate-app/components';
import { Subscription } from 'rxjs';
import { DeleteDialogState, DeleteMeetingDialogComponent } from '../dialogs/delete-meeting-dialog.component';
import { DiscardChangesDialogComponent } from '../dialogs/discard-changes-dialog.component';
import { MeetingAddSuccess, MeetingDeleteSelect, MeetingDeleteSuccess } from '../meeting-events';
import { MEETINGS_NOW, isUpcoming, timeOf } from '../meeting-format';

interface MeetingForm {
  name: string;
  date: string;
  start: string;
  end: string;
  abstract: string;
  agenda: string;
  minutes: string;
}

interface FormProblem {
  field: 'name' | 'end';
  /** Message under the field. */
  message: string;
  /** Link text in the error summary. */
  summary: string;
}

type LoadStatus = 'loading' | 'ready' | 'error';
type SaveStatus = 'idle' | 'submitting' | 'error';
type TextField = 'name' | 'date' | 'start' | 'end';
type EditorField = 'abstract' | 'agenda' | 'minutes';

const EMPTY: MeetingForm = { name: '', date: '', start: '', end: '', abstract: '', agenda: '', minutes: '' };

function toForm(m: MeetingDto): MeetingForm {
  return {
    name: m.name ?? '',
    date: (m.date ?? '').slice(0, 10),
    start: timeOf(m.start),
    end: timeOf(m.end),
    abstract: m.abstract ?? '',
    agenda: m.agenda ?? '',
    minutes: m.minutes ?? '',
  };
}

/** Create and edit form for a meeting: `/meeting/create` without an `id`, `/meeting/:id/edit` with one. */
@Component({
  selector: 'ui-meeting-edit',
  imports: [RouterLink, RichTextEditorComponent, TabStripComponent, TabComponent, DeleteMeetingDialogComponent, DiscardChangesDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(window:beforeunload)': 'warnBeforeUnload($event)' },
  template: `
    <main id="main" class="container">
      <a class="btn btn--ghost btn--sm" routerLink="/meetings" style="margin-top: var(--space-4)">
        <svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><path d="m15 6-6 6 6 6" /></svg>Meetings
      </a>

      @if (loadStatus() === 'error') {
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
          <div><h1>{{ editing() ? 'Edit Meeting' : 'Create Meeting' }}</h1></div>
          <div class="cluster">
            <div class="save-bar">
              @if (loadStatus() === 'loading') {
                <button class="btn btn--primary" type="button" disabled>Save</button>
              } @else {
                @if (saveStatus() === 'submitting') {
                  <span class="inline-status" role="status"><span class="dot dot--pulse" aria-hidden="true"></span> Saving…</span>
                }
                <button class="btn btn--primary" type="submit" form="meeting-form" [attr.aria-busy]="submitting() ? 'true' : null">
                  {{ submitLabel() }}
                </button>
              }
            </div>
          </div>
        </div>

        @if (loadStatus() === 'loading') {
          <div class="stack" aria-busy="true" aria-label="Loading meeting" style="gap: var(--space-6)">
            <div class="meeting-form__header">
              @for (n of skeletonFields; track n) {
                <span class="skeleton skeleton--rect" style="height: var(--control-height-md)"></span>
              }
            </div>
            <span class="skeleton skeleton--rect" style="height: var(--control-height-md); width: 18rem"></span>
            <div class="card">
              @for (n of skeletonFields; track n) {
                <span class="skeleton skeleton--text" aria-hidden="true"></span>
              }
            </div>
          </div>
        } @else {
          <form id="meeting-form" class="stack" novalidate style="gap: var(--space-6)" (submit)="submit($event)">
            @if (saveStatus() === 'error' && !editing()) {
              <div class="alert alert--danger" role="alert">
                <svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></svg>
                <div class="alert__body">
                  <div class="alert__title">We couldn't create the meeting</div>
                  <div>Everything you typed is still here.</div>
                </div>
              </div>
            }
            @if (problems().length > 0) {
              <div #summary class="alert alert--danger form-summary" role="alert" id="summary" tabindex="-1">
                <svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></svg>
                <div class="alert__body">
                  <div class="alert__title">{{ summaryTitle() }}</div>
                  <div class="alert__actions">
                    @for (p of problems(); track p.field) {
                      <a [attr.href]="'#' + p.field" (click)="focusField($event, p.field)">{{ p.summary }}</a>
                    }
                  </div>
                </div>
              </div>
            }

            <div class="meeting-form__header">
              <div class="field">
                <label class="field__label" for="name">Name</label>
                <input
                  class="input"
                  id="name"
                  name="name"
                  type="text"
                  required
                  autocomplete="off"
                  [attr.autofocus]="editing() ? null : ''"
                  [value]="model().name"
                  [readOnly]="submitting()"
                  [attr.aria-invalid]="problemFor('name') ? 'true' : null"
                  [attr.aria-describedby]="problemFor('name') ? 'name-error' : null"
                  (input)="setText('name', $event)"
                />
                @if (problemFor('name'); as p) {
                  <div class="field__error" id="name-error">{{ p.message }}</div>
                }
              </div>
              <div class="field">
                <label class="field__label" for="date">Date</label>
                <input class="input" id="date" name="date" type="date" [value]="model().date" [readOnly]="submitting()" (input)="setText('date', $event)" />
              </div>
              <div class="field">
                <label class="field__label" for="start">Start</label>
                <input class="input" id="start" name="start" type="time" [value]="model().start" [readOnly]="submitting()" (input)="setText('start', $event)" />
              </div>
              <div class="field">
                <label class="field__label" for="end">End</label>
                <input
                  class="input"
                  id="end"
                  name="end"
                  type="time"
                  [value]="model().end"
                  [readOnly]="submitting()"
                  [attr.aria-invalid]="problemFor('end') ? 'true' : null"
                  [attr.aria-describedby]="problemFor('end') ? 'end-error' : null"
                  (input)="setText('end', $event)"
                />
                @if (problemFor('end'); as p) {
                  <div class="field__error" id="end-error">{{ p.message }}</div>
                }
              </div>
            </div>

            <ui-tab-strip aria-label="Meeting sections">
              <ui-tab title="Abstract" [selected]="firstTab() === 'Abstract'">
                <h2 class="visually-hidden">Abstract</h2>
                <ui-rich-text-editor
                  ariaLabel="Abstract"
                  placeholder="What the debate is about"
                  [value]="seed().abstract"
                  [readonly]="submitting()"
                  [busy]="submitting()"
                  (valueChange)="setEditor('abstract', $event)"
                />
              </ui-tab>
              <ui-tab title="Agenda">
                <h2 class="visually-hidden">Agenda</h2>
                <ui-rich-text-editor
                  ariaLabel="Agenda"
                  placeholder="Order of play"
                  [value]="seed().agenda"
                  [readonly]="submitting()"
                  [busy]="submitting()"
                  (valueChange)="setEditor('agenda', $event)"
                />
              </ui-tab>
              <ui-tab title="Minutes" [selected]="firstTab() === 'Minutes'">
                <h2 class="visually-hidden">Minutes</h2>
                <ui-rich-text-editor
                  ariaLabel="Minutes"
                  placeholder="What happened"
                  [value]="seed().minutes"
                  [readonly]="submitting()"
                  [busy]="submitting()"
                  (valueChange)="setEditor('minutes', $event)"
                />
              </ui-tab>
            </ui-tab-strip>
          </form>

          @if (editing()) {
            <section class="danger-zone" aria-labelledby="danger-h">
              <div>
                <h2 class="card__title" id="danger-h" style="margin-bottom: var(--space-1)">Delete this meeting</h2>
                <p class="text-muted">It disappears from the list for everyone. There's no undo.</p>
              </div>
              <button class="btn btn--danger" type="button" [disabled]="submitting()" (click)="askDelete()">
                <svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>Delete meeting
              </button>
            </section>
          }
        }
      }
    </main>

    @if (deleteOpen()) {
      <ui-delete-meeting-dialog [name]="initial().name" [state]="deleteState()" (confirm)="confirmDelete()" (cancel)="deleteOpen.set(false)" />
    }
    @if (discardOpen()) {
      <ui-discard-changes-dialog [name]="model().name.trim() || 'Untitled meeting'" (discard)="answerDiscard(true)" (keepEditing)="answerDiscard(false)" />
    }
  `,
})
export class MeetingEditComponent {
  private readonly api = inject(MeetingsService);
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastService);
  private readonly now = inject(MEETINGS_NOW);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly summary = viewChild<ElementRef<HTMLElement>>('summary');

  /** The `:id` route parameter; absent on `/meeting/create`. */
  readonly id = input<string | undefined>(undefined);

  protected readonly skeletonFields = [1, 2, 3, 4];
  protected readonly editing = computed(() => this.id() !== undefined);
  protected readonly loadStatus = signal<LoadStatus>('ready');
  protected readonly saveStatus = signal<SaveStatus>('idle');
  protected readonly submitting = computed(() => this.saveStatus() === 'submitting');

  /** Current field values. */
  protected readonly model = signal<MeetingForm>(EMPTY);
  /** The values as last loaded or saved; the form is dirty when `model` differs. */
  protected readonly initial = signal<MeetingForm>(EMPTY);
  /** Values pushed into the editors; only changed by a load so typing never resets the cursor. */
  protected readonly seed = signal<Pick<MeetingForm, EditorField>>({ abstract: '', agenda: '', minutes: '' });
  protected readonly attempted = signal(false);
  protected readonly dirty = computed(() => JSON.stringify(this.model()) !== JSON.stringify(this.initial()));

  protected readonly problems = computed<FormProblem[]>(() => {
    if (!this.attempted()) return [];
    const m = this.model();
    const list: FormProblem[] = [];
    if (!m.name.trim()) list.push({ field: 'name', message: 'Enter a name.', summary: 'Enter a name' });
    if (m.start && m.end && m.end <= m.start) {
      list.push({ field: 'end', message: 'End must be after start.', summary: 'End must be after start' });
    }
    return list;
  });
  protected readonly summaryTitle = computed(() => {
    const n = this.problems().length;
    return `Fix ${n} ${n === 1 ? 'thing' : 'things'} to ${this.editing() ? 'save' : 'create the meeting'}`;
  });
  protected readonly submitLabel = computed(() => {
    if (this.editing()) return this.submitting() ? 'Saving…' : 'Save';
    return this.submitting() ? 'Creating…' : 'Create meeting';
  });
  protected readonly firstTab = computed<'Abstract' | 'Agenda' | 'Minutes'>(() => {
    const m = this.initial();
    return m.date && !isUpcoming({ date: m.date } as MeetingDto, this.now()) ? 'Minutes' : 'Abstract';
  });

  protected readonly deleteOpen = signal(false);
  protected readonly deleteState = signal<DeleteDialogState>('default');
  protected readonly discardOpen = signal(false);

  private discardAnswer?: (leave: boolean) => void;
  private request?: Subscription;

  constructor() {
    effect(() => {
      this.id();
      untracked(() => this.load());
    });
    inject(DestroyRef).onDestroy(() => this.request?.unsubscribe());
  }

  /** Route guard hook: leaving is free when nothing changed, otherwise the discard dialog decides. */
  canLeave(): Promise<boolean> {
    if (!this.dirty()) return Promise.resolve(true);
    this.discardAnswer?.(false);
    return new Promise<boolean>((resolve) => {
      this.discardAnswer = resolve;
      this.discardOpen.set(true);
    });
  }

  protected answerDiscard(leave: boolean): void {
    this.discardOpen.set(false);
    this.discardAnswer?.(leave);
    this.discardAnswer = undefined;
  }

  protected warnBeforeUnload(event: Event): void {
    if (this.dirty()) event.preventDefault();
  }

  protected load(): void {
    this.request?.unsubscribe();
    this.attempted.set(false);
    this.saveStatus.set('idle');
    const id = this.idNumber();
    if (id === null) {
      this.loadStatus.set('ready');
      this.reset(EMPTY);
      return;
    }
    if (!Number.isInteger(id)) {
      this.loadStatus.set('error');
      return;
    }
    this.loadStatus.set('loading');
    this.request = this.api.getById(id).subscribe({
      next: (meeting) => {
        this.reset(toForm(meeting));
        this.loadStatus.set('ready');
      },
      error: () => this.loadStatus.set('error'),
    });
  }

  protected problemFor(field: FormProblem['field']): FormProblem | undefined {
    return this.problems().find((p) => p.field === field);
  }

  protected setText(field: TextField, event: Event): void {
    this.model.update((m) => ({ ...m, [field]: (event.target as HTMLInputElement).value }));
  }

  protected setEditor(field: EditorField, html: string): void {
    this.model.update((m) => ({ ...m, [field]: html }));
  }

  protected focusField(event: Event, field: string): void {
    event.preventDefault();
    this.host.nativeElement.querySelector<HTMLElement>(`#${field}`)?.focus();
  }

  protected submit(event?: Event): void {
    event?.preventDefault();
    if (this.submitting() || this.loadStatus() !== 'ready') return;
    this.attempted.set(true);
    if (this.problems().length > 0) {
      afterNextRender(() => this.summary()?.nativeElement.focus(), { injector: this.injector });
      return;
    }
    const m = this.model();
    const id = this.idNumber();
    const dto = {
      ...(id === null ? {} : { id }),
      date: m.date,
      start: m.start,
      end: m.end,
      name: m.name.trim(),
      abstract: m.abstract,
      agenda: m.agenda,
      minutes: m.minutes,
    } as MeetingDto;
    this.saveStatus.set('submitting');
    this.api.add(dto).subscribe({
      next: (response) => {
        const saved = response !== null && typeof response === 'object' ? response : { ...dto, id: id ?? 0 };
        this.initial.set(this.model());
        this.saveStatus.set('idle');
        this.toasts.show({ tone: 'success', title: 'Meeting saved', text: dto.name });
        this.host.nativeElement.dispatchEvent(MeetingAddSuccess(saved));
        void this.router.navigateByUrl('/meetings');
      },
      error: () => {
        if (this.editing()) {
          this.saveStatus.set('idle');
          this.toasts.show({
            tone: 'danger',
            title: "We couldn't save the meeting",
            text: 'Your changes are still in the form.',
            actionLabel: 'Try again',
            action: () => this.submit(),
          });
        } else {
          this.saveStatus.set('error');
        }
      },
    });
  }

  protected askDelete(): void {
    const id = this.idNumber();
    if (id === null) return;
    this.host.nativeElement.dispatchEvent(MeetingDeleteSelect(id));
    this.deleteState.set('default');
    this.deleteOpen.set(true);
  }

  protected confirmDelete(): void {
    const id = this.idNumber();
    if (id === null) return;
    const name = this.initial().name;
    this.deleteState.set('busy');
    this.api.remove(id).subscribe({
      next: () => {
        this.initial.set(this.model());
        this.deleteOpen.set(false);
        this.toasts.show({ tone: 'success', title: 'Meeting deleted', text: name });
        this.host.nativeElement.dispatchEvent(MeetingDeleteSuccess(id));
        void this.router.navigateByUrl('/meetings');
      },
      error: () => this.deleteState.set('failed'),
    });
  }

  private idNumber(): number | null {
    const id = this.id();
    return id === undefined ? null : Number(id);
  }

  private reset(form: MeetingForm): void {
    this.model.set(form);
    this.initial.set(form);
    this.seed.set({ abstract: form.abstract, agenda: form.agenda, minutes: form.minutes });
  }
}
