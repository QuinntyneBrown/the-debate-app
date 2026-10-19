import { CanDeactivateFn, Routes, UrlMatcher, UrlSegment } from '@angular/router';
import { MeetingEditComponent } from './meeting-edit/meeting-edit.component';
import { MeetingListComponent } from './meeting-list/meeting-list.component';
import { MeetingViewComponent } from './meeting-view/meeting-view.component';

/**
 * Matches `meeting/{n}` plus the given trailing literals, but only when `{n}` is numeric (L2-019 criterion 7).
 * The number is exposed as the `id` route parameter.
 */
export function numericIdMatcher(prefix: string, ...suffix: string[]): UrlMatcher {
  return (segments: UrlSegment[]) => {
    if (segments.length !== 2 + suffix.length) return null;
    const [head, id, ...rest] = segments;
    if (head.path !== prefix || !/^\d+$/.test(id.path)) return null;
    if (rest.some((segment, i) => segment.path !== suffix[i])) return null;
    return { consumed: segments, posParams: { id } };
  };
}

const confirmLeave: CanDeactivateFn<MeetingEditComponent> = (form) => form.canLeave();

/**
 * Meeting routes, mounted at the application root. `/meeting/{n}/updateminutes` and non-numeric ids match nothing
 * here, so the root not-found route renders instead (L2-019 criteria 6 and 7).
 */
export const MEETINGS_ROUTES: Routes = [
  { path: 'meetings', component: MeetingListComponent, title: 'Meetings' },
  { path: 'meeting/create', component: MeetingEditComponent, title: 'New meeting', canDeactivate: [confirmLeave] },
  { matcher: numericIdMatcher('meeting'), component: MeetingViewComponent, title: 'Meeting' },
  { matcher: numericIdMatcher('meeting', 'edit'), component: MeetingEditComponent, title: 'Edit meeting', canDeactivate: [confirmLeave] },
];
