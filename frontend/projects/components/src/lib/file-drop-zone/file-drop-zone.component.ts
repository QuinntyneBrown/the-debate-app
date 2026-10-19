import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/** File drop target. Raises the dropped files as one FormData; never uploads. */
@Component({
  selector: 'ui-file-drop-zone',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--height]': 'height()',
    '[style.--width]': 'width()',
    '[style.--backgroundColor]': 'backgroundColor()',
    '[style.--color]': 'color()',
    '[style.--fontFamily]': 'fontFamily()',
    '(dragover)': 'onDragOver($event)',
    '(drop)': 'onDrop($event)',
  },
  template: `
    <a href="#" role="button" (click)="openPicker($event, picker)">{{ caption() || 'Drop Zone' }}</a>
    <input #picker type="file" multiple hidden (change)="onPicked(picker)" />
  `,
  styles: `
    :host {
      display: flex; align-items: center; justify-content: center;
      height: var(--height, 8rem); width: var(--width, 100%);
      background: var(--backgroundColor, var(--color-bg-surface-sunken));
      color: var(--color, var(--color-fg-muted));
      font-family: var(--fontFamily, inherit);
      border: 2px dashed var(--color-border-default);
      border-radius: var(--radius-md);
    }
    a { color: inherit; text-decoration: none; }
    a:focus-visible { outline: var(--focus-ring-width) solid var(--color-focus-ring); outline-offset: var(--focus-ring-offset); }
  `,
})
export class FileDropZoneComponent {
  readonly caption = input<string | undefined>();
  readonly height = input<string | undefined>();
  readonly width = input<string | undefined>();
  readonly backgroundColor = input<string | undefined>();
  readonly color = input<string | undefined>();
  readonly fontFamily = input<string | undefined>();
  readonly filesDropped = output<FormData>();

  protected onDragOver(event: Event): void {
    event.preventDefault();
  }

  protected onDrop(event: Event): void {
    event.preventDefault();
    const files = (event as DragEvent).dataTransfer?.files;
    if (files) {
      this.emit(files);
    }
  }

  protected openPicker(event: Event, picker: HTMLInputElement): void {
    event.preventDefault();
    picker.click();
  }

  protected onPicked(picker: HTMLInputElement): void {
    if (picker.files) {
      this.emit(picker.files);
    }
  }

  private emit(files: ArrayLike<File>): void {
    const data = new FormData();
    for (const file of Array.from(files)) {
      data.append(file.name, file);
    }
    this.filesDropped.emit(data);
  }
}
