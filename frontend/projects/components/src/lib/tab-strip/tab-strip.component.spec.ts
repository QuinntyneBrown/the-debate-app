// Traces to: L2-028
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabStripComponent } from './tab-strip.component';
import { TabComponent } from './tab.component';

@Component({
  imports: [TabStripComponent, TabComponent],
  template: `
    <ui-tab-strip (selectedIndexChange)="changes.push($event)">
      <ui-tab title="Abstract" [selected]="sel[0]"><p>one</p></ui-tab>
      <ui-tab title="Agenda" [selected]="sel[1]"><p>two</p></ui-tab>
      <ui-tab title="Minutes" [selected]="sel[2]"><p>three</p></ui-tab>
    </ui-tab-strip>
  `,
})
class Host {
  sel = [false, false, false];
  changes: (number | undefined)[] = [];
}

async function setup(sel: boolean[] = [false, false, false]) {
  await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
  const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
  fixture.componentInstance.sel = sel;
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  const el: HTMLElement = fixture.nativeElement;
  const tabs = () => Array.from(el.querySelectorAll<HTMLElement>('[role="tab"]'));
  return {
    fixture,
    el,
    host: el.querySelector('ui-tab-strip') as HTMLElement,
    tabs,
    panels: () => Array.from(el.querySelectorAll<HTMLElement>('ui-tab')),
    key: (k: string, i: number) => {
      tabs()[i].dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
      fixture.detectChanges();
    },
  };
}

describe('TabStripComponent (L2-028)', () => {
  it('criterion 1: host has role tablist, tabs role tab, panels role tabpanel with tabindex 0', async () => {
    const { host, tabs, panels } = await setup();
    expect(host.getAttribute('role')).toBe('tablist');
    expect(tabs().map((t) => t.getAttribute('role'))).toEqual(['tab', 'tab', 'tab']);
    expect(tabs().map((t) => t.textContent?.trim())).toEqual(['Abstract', 'Agenda', 'Minutes']);
    for (const p of panels()) {
      expect(p.getAttribute('role')).toBe('tabpanel');
      expect(p.getAttribute('tabindex')).toBe('0');
    }
  });

  it('criterion 1: pairs each tab and panel with aria-controls and aria-labelledby', async () => {
    const { tabs, panels } = await setup();
    tabs().forEach((t, i) => {
      expect(t.getAttribute('aria-controls')).toBe(panels()[i].id);
      expect(panels()[i].getAttribute('aria-labelledby')).toBe(t.id);
    });
  });

  it('criterion 2: selects the first tab when none carries selected', async () => {
    const { host } = await setup();
    expect(host.getAttribute('selected')).toBe('0');
  });

  it('criterion 2: selects the last tab that carries selected', async () => {
    const { host, tabs } = await setup([true, true, false]);
    expect(host.getAttribute('selected')).toBe('1');
    expect(tabs()[1].getAttribute('aria-selected')).toBe('true');
  });

  it('criterion 3: applies tabindex, aria-selected, aria-hidden and the host selected attribute', async () => {
    const { host, tabs, panels } = await setup([false, false, true]);
    expect(host.getAttribute('selected')).toBe('2');
    expect(tabs().map((t) => t.getAttribute('tabindex'))).toEqual(['-1', '-1', '0']);
    expect(tabs().map((t) => t.getAttribute('aria-selected'))).toEqual(['false', 'false', 'true']);
    expect(panels().map((p) => p.getAttribute('aria-hidden'))).toEqual(['true', 'true', 'false']);
  });

  it('criterion 4: clicking a tab selects and focuses it and emits selectedIndexChange', async () => {
    const { fixture, host, tabs, panels } = await setup();
    tabs()[1].click();
    fixture.detectChanges();
    expect(host.getAttribute('selected')).toBe('1');
    expect(tabs()[1].getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(tabs()[1]);
    expect(panels()[1].getAttribute('aria-hidden')).toBe('false');
    expect(fixture.componentInstance.changes).toEqual([1]);
  });

  it('criterion 5: ArrowRight and ArrowDown select the next tab, wrapping last to first', async () => {
    const { host, key, tabs } = await setup([false, false, true]);
    key('ArrowRight', 2);
    expect(host.getAttribute('selected')).toBe('0');
    expect(document.activeElement).toBe(tabs()[0]);
    key('ArrowDown', 0);
    expect(host.getAttribute('selected')).toBe('1');
  });

  it('criterion 5: ArrowLeft and ArrowUp select the previous tab, wrapping first to last', async () => {
    const { host, key, tabs } = await setup();
    key('ArrowLeft', 0);
    expect(host.getAttribute('selected')).toBe('2');
    expect(document.activeElement).toBe(tabs()[2]);
    key('ArrowUp', 2);
    expect(host.getAttribute('selected')).toBe('1');
  });
});
