import Quill from 'quill';
import { RichTextEngine } from './rich-text-engine';

/** Quill adapter using the snow theme. */
export class QuillRichTextEngine extends RichTextEngine {
  private quill?: Quill;

  mount(host: HTMLElement, options: { placeholder: string }): HTMLElement {
    // The component owns the toolbar buttons, so Quill gets no toolbar module of its own.
    this.quill = new Quill(host, {
      theme: 'snow',
      placeholder: options.placeholder,
      modules: { toolbar: false },
      formats: ['header', 'bold', 'italic', 'underline', 'image', 'code-block'],
    });
    return this.quill.root;
  }

  setHtml(html: string): void {
    this.quill?.setContents(this.quill.clipboard.convert({ html }), 'silent');
  }

  format(name: string, value: unknown): void {
    const quill = this.quill;
    if (!quill) {
      return;
    }
    if (!quill.getSelection()) {
      quill.focus();
    }
    const range = quill.getSelection();
    if (!range) {
      return;
    }
    if (name === 'header' || name === 'code-block') {
      quill.formatLine(range.index, Math.max(range.length, 1), name, value, 'user');
    } else {
      quill.format(name, value, 'user');
    }
  }

  onChange(callback: (html: string) => void): void {
    this.quill?.on('text-change', (_delta, _old, source) => {
      if (source === 'user') {
        callback(this.quill!.root.innerHTML);
      }
    });
  }

  onFormatsChange(callback: (formats: Record<string, unknown>) => void): void {
    const report = () => {
      const range = this.quill?.getSelection();
      callback(range ? this.quill!.getFormat(range) : {});
    };
    this.quill?.on('selection-change', report);
    this.quill?.on('text-change', report);
  }

  destroy(): void {
    this.quill?.off('text-change');
    this.quill?.off('selection-change');
    this.quill = undefined;
  }
}
