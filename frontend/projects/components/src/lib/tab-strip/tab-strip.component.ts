import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  contentChildren,
  effect,
  model,
  viewChildren,
} from '@angular/core';
import { TabComponent } from './tab.component';

let nextId = 0;

/** Tab strip: shows the title of each projected tab and one panel at a time. */
@Component({
  selector: 'ui-tab-strip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tabs',
    role: 'tablist',
    '[attr.selected]': 'index()',
  },
  template: `
    <div class="tabs__list" role="presentation">
      @for (tab of tabs(); track tab; let i = $index) {
        <button
          #tabButton
          type="button"
          role="tab"
          class="tabs__tab"
          [id]="tab.tabId()"
          [attr.aria-controls]="tab.panelId()"
          [attr.aria-selected]="i === index() ? 'true' : 'false'"
          [attr.tabindex]="i === index() ? 0 : -1"
          (click)="select(i)"
          (keydown)="onKeydown($event, i)"
        >
          {{ tab.title() }}
        </button>
      }
    </div>
    <ng-content />
  `,
})
export class TabStripComponent {
  readonly selectedIndex = model<number | undefined>(undefined);

  protected readonly tabs = contentChildren(TabComponent);
  private readonly buttons = viewChildren<ElementRef<HTMLButtonElement>>('tabButton');
  private readonly uid = nextId++;

  protected readonly index = computed(() => {
    const tabs = this.tabs();
    const requested = this.selectedIndex();
    if (requested !== undefined && requested >= 0 && requested < tabs.length) {
      return requested;
    }
    const last = tabs.map((t) => t.selected()).lastIndexOf(true);
    return last >= 0 ? last : 0;
  });

  constructor() {
    effect(() => {
      const index = this.index();
      this.tabs().forEach((tab, i) => {
        tab.tabId.set(`tab-strip-${this.uid}-tab-${i}`);
        tab.panelId.set(`tab-strip-${this.uid}-panel-${i}`);
        tab.active.set(i === index);
      });
    });
  }

  protected select(i: number): void {
    this.selectedIndex.set(i);
    this.buttons()[i]?.nativeElement.focus();
  }

  protected onKeydown(event: KeyboardEvent, i: number): void {
    const count = this.tabs().length;
    let target: number;
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        target = (i - 1 + count) % count;
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        target = (i + 1) % count;
        break;
      default:
        return;
    }
    event.preventDefault();
    this.select(target);
  }
}
