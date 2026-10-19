/** Isolates the rich-text library from the editor component. */
export abstract class RichTextEngine {
  /** Builds the editor inside `host` and returns the content element. */
  abstract mount(host: HTMLElement, options: { placeholder: string }): HTMLElement;
  /** Replaces the content with the given HTML without raising onChange. */
  abstract setHtml(html: string): void;
  /** Applies a format (for example `bold`, `header`, `code-block`) to the selection. */
  abstract format(name: string, value: unknown): void;
  /** Registers the callback that receives the content element's inner HTML after a user edit. */
  abstract onChange(callback: (html: string) => void): void;
  /** Registers the callback that receives the formats at the cursor. */
  abstract onFormatsChange(callback: (formats: Record<string, unknown>) => void): void;
  abstract destroy(): void;
}
