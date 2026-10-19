// Traces to: L2-029
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileDropZoneComponent } from './file-drop-zone.component';

@Component({
  imports: [FileDropZoneComponent],
  template: `<ui-file-drop-zone
    [caption]="caption()"
    [height]="height()"
    [width]="width()"
    [backgroundColor]="backgroundColor()"
    [color]="color()"
    [fontFamily]="fontFamily()"
    (filesDropped)="dropped.push($event)"
  />`,
})
class Host {
  caption = signal<string | undefined>(undefined);
  height = signal<string | undefined>(undefined);
  width = signal<string | undefined>(undefined);
  backgroundColor = signal<string | undefined>(undefined);
  color = signal<string | undefined>(undefined);
  fontFamily = signal<string | undefined>(undefined);
  dropped: FormData[] = [];
}

function dragEvent(type: string, files: File[]): Event {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'dataTransfer', { value: { files } });
  return event;
}

describe('FileDropZoneComponent (L2-029)', () => {
  let fixture: ComponentFixture<Host>;
  let zone: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    zone = fixture.nativeElement.querySelector('ui-file-drop-zone');
  });

  it('criterion 1: shows an anchor with the default caption "Drop Zone"', () => {
    expect(zone.querySelector('a')?.textContent?.trim()).toBe('Drop Zone');
  });

  it('criterion 1: shows an anchor with the caption input when set', () => {
    fixture.componentInstance.caption.set('Drop images here');
    fixture.detectChanges();
    expect(zone.querySelector('a')?.textContent?.trim()).toBe('Drop images here');
  });

  it('criterion 2: dragover prevents the default so the drop is allowed', () => {
    const event = dragEvent('dragover', []);
    zone.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('criterion 3: drop emits a FormData with each file under its own file name', () => {
    const a = new File(['aaa'], 'a.png', { type: 'image/png' });
    const b = new File(['bbb'], 'b.txt', { type: 'text/plain' });
    const event = dragEvent('drop', [a, b]);
    zone.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    const [data] = fixture.componentInstance.dropped;
    expect(Array.from(data.keys())).toEqual(['a.png', 'b.txt']);
    expect((data.get('a.png') as File).name).toBe('a.png');
    expect((data.get('b.txt') as File).size).toBe(3);
  });

  it('criterion 4: appearance inputs set the matching custom properties on the host', () => {
    const host = fixture.componentInstance;
    host.height.set('200px');
    host.width.set('50%');
    host.backgroundColor.set('red');
    host.color.set('white');
    host.fontFamily.set('serif');
    fixture.detectChanges();
    expect(zone.style.getPropertyValue('--height')).toBe('200px');
    expect(zone.style.getPropertyValue('--width')).toBe('50%');
    expect(zone.style.getPropertyValue('--backgroundColor')).toBe('red');
    expect(zone.style.getPropertyValue('--color')).toBe('white');
    expect(zone.style.getPropertyValue('--fontFamily')).toBe('serif');
  });

  it('keyboard alternative: activating the anchor opens the file picker and emits the chosen files', () => {
    const input = zone.querySelector('input[type="file"]') as HTMLInputElement;
    const open = vi.spyOn(input, 'click').mockImplementation(() => undefined);
    (zone.querySelector('a') as HTMLElement).click();
    expect(open).toHaveBeenCalled();
    Object.defineProperty(input, 'files', { value: [new File(['x'], 'c.png')] });
    input.dispatchEvent(new Event('change'));
    expect(Array.from(fixture.componentInstance.dropped[0].keys())).toEqual(['c.png']);
  });
});
