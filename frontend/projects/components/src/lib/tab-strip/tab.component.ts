import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

/** One panel of a tab strip; its title becomes the tab. */
@Component({
  selector: 'ui-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tabs__panel',
    role: 'tabpanel',
    tabindex: '0',
    '[attr.title]': 'null',
    '[id]': 'panelId()',
    '[attr.aria-labelledby]': 'tabId()',
    '[attr.aria-hidden]': 'active() ? "false" : "true"',
    '[hidden]': '!active()',
  },
  template: `<ng-content />`,
})
export class TabComponent {
  readonly title = input('');
  readonly selected = input(false);

  /** Set by the owning strip. */
  readonly active = signal(false);
  readonly panelId = signal('');
  readonly tabId = signal('');
}
