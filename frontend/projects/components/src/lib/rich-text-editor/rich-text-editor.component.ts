import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewEncapsulation,
  afterNextRender,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { QuillRichTextEngine } from './quill-rich-text-engine';
import { RichTextEngine } from './rich-text-engine';

interface ToolbarButton {
  label: string;
  glyph: string;
  format: string;
  value: unknown;
}

const BUTTONS: ToolbarButton[] = [
  { label: 'Heading 1', glyph: 'H1', format: 'header', value: 1 },
  { label: 'Heading 2', glyph: 'H2', format: 'header', value: 2 },
  { label: 'Bold', glyph: 'B', format: 'bold', value: true },
  { label: 'Italic', glyph: 'I', format: 'italic', value: true },
  { label: 'Underline', glyph: 'U', format: 'underline', value: true },
  { label: 'Insert image', glyph: 'Img', format: 'image', value: true },
  { label: 'Code block', glyph: '</>', format: 'code-block', value: true },
];

/** Rich-text field: toolbar plus editable region, exposing its content as HTML. */
@Component({
  selector: 'ui-rich-text-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: RichTextEngine, useClass: QuillRichTextEngine }],
  host: { style: 'display: block' },
  template: `
    <div
      class="editor"
      [class.editor--readonly]="readonly()"
      [class.editor--busy]="busy()"
      [attr.aria-invalid]="invalid() ? 'true' : null"
    >
      <div class="editor__toolbar" role="toolbar" [attr.aria-label]="(ariaLabel() || 'Text') + ' formatting'">
        @for (b of buttons; track b.label) {
          <button
            type="button"
            class="editor__btn"
            [attr.aria-label]="b.label"
            [attr.aria-pressed]="isActive(b) ? 'true' : 'false'"
            [disabled]="readonly() || busy()"
            (mousedown)="$event.preventDefault()"
            (click)="apply(b)"
          >
            {{ b.glyph }}
          </button>
        }
      </div>
      <div #host class="editor__content"></div>
    </div>
  `,
  styles: `
    ui-rich-text-editor .editor__content.ql-container { border: 0; font: inherit; min-height: 14rem; padding: 0; }
    ui-rich-text-editor .editor__content .ql-editor { position: relative; min-height: 14rem; padding: var(--space-4) var(--space-5); outline: none; white-space: pre-wrap; line-height: var(--line-height-relaxed); }
    ui-rich-text-editor .editor__content .ql-editor.ql-blank::before { content: attr(data-placeholder); color: var(--color-fg-subtle); position: absolute; pointer-events: none; }
    ui-rich-text-editor .ql-editor .ql-code-block-container { background: var(--color-bg-subtle); border-radius: var(--radius-sm); padding: var(--space-2) var(--space-3); font-family: monospace; }
    ui-rich-text-editor .ql-editor img { max-width: 100%; }
  `,
})
export class RichTextEditorComponent implements OnDestroy {
  readonly value = input('');
  readonly placeholder = input('');
  readonly ariaLabel = input('');
  readonly readonly = input(false);
  readonly invalid = input(false);
  readonly busy = input(false);
  readonly valueChange = output<string>();
  readonly imageRequested = output<void>();

  /** Inner HTML of the content element after the latest text change. */
  readonly text = signal('');

  protected readonly buttons = BUTTONS;
  private readonly engine = inject(RichTextEngine);
  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');
  private readonly formats = signal<Record<string, unknown>>({});
  private readonly content = signal<HTMLElement | undefined>(undefined);

  constructor() {
    afterNextRender(() => {
      const content = this.engine.mount(this.host().nativeElement, { placeholder: this.placeholder() });
      content.setAttribute('role', 'textbox');
      content.setAttribute('aria-multiline', 'true');
      this.engine.onChange((html) => {
        this.text.set(html);
        this.valueChange.emit(html);
      });
      this.engine.onFormatsChange((f) => this.formats.set(f));
      this.content.set(content);
    });

    effect(() => {
      const content = this.content();
      const html = this.value();
      if (content) {
        this.engine.setHtml(html);
        this.text.set(content.innerHTML);
      }
    });

    effect(() => {
      const content = this.content();
      if (content) {
        content.setAttribute('contenteditable', String(!this.readonly() && !this.busy()));
        content.setAttribute('aria-readonly', String(this.readonly()));
        const label = this.ariaLabel();
        if (label) {
          content.setAttribute('aria-label', label);
        }
      }
    });
  }

  protected isActive(b: ToolbarButton): boolean {
    const current = this.formats()[b.format];
    return b.format === 'header' ? current === b.value : !!current;
  }

  protected apply(b: ToolbarButton): void {
    if (b.format === 'image') {
      this.imageRequested.emit();
      return;
    }
    const active = this.isActive(b);
    this.engine.format(b.format, b.format === 'header' ? (active ? false : b.value) : !active);
  }

  ngOnDestroy(): void {
    this.engine.destroy();
  }
}
