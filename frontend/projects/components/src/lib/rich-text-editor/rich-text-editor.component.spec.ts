// Traces to: L2-024
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import Quill from 'quill';
import { RichTextEditorComponent } from './rich-text-editor.component';
import { RichTextEngine } from './rich-text-engine';

@Component({
  imports: [RichTextEditorComponent],
  template: `<ui-rich-text-editor
    ariaLabel="Abstract"
    [value]="value()"
    [readonly]="readonly()"
    (valueChange)="emitted.push($event)"
    (imageRequested)="images = images + 1"
  />`,
})
class Host {
  value = signal('');
  readonly = signal(false);
  emitted: string[] = [];
  images = 0;
}

// jsdom lacks layout APIs that Quill calls when it scrolls a selection into view.
Range.prototype.getBoundingClientRect = () => new DOMRect();
Range.prototype.getClientRects = () => ({ length: 0, item: () => null, [Symbol.iterator]: function* () {} }) as unknown as DOMRectList;

describe('RichTextEditorComponent (L2-024 criteria 4 and 5)', () => {
  let fixture: ComponentFixture<Host>;
  let el: HTMLElement;


  const button = (label: string) =>
    el.querySelector<HTMLButtonElement>(`.editor__toolbar button[aria-label="${label}"]`)!;
  const quill = () => Quill.find(el.querySelector('.editor__content') as HTMLElement) as Quill;
  const content = () => el.querySelector('.ql-editor') as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    el = fixture.nativeElement;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('criterion 4: renders a Quill editor with the snow theme', () => {
    expect(el.querySelector('.editor__content.ql-container.ql-snow')).not.toBeNull();
    expect(content().getAttribute('role')).toBe('textbox');
    expect(content().getAttribute('aria-multiline')).toBe('true');
    expect(content().getAttribute('aria-label')).toBe('Abstract');
  });

  it('criterion 4: the toolbar offers header 1, header 2, bold, italic, underline, image and code block', () => {
    const labels = Array.from(el.querySelectorAll('.editor__toolbar button')).map((b) =>
      b.getAttribute('aria-label'),
    );
    expect(labels).toEqual([
      'Heading 1',
      'Heading 2',
      'Bold',
      'Italic',
      'Underline',
      'Insert image',
      'Code block',
    ]);
  });

  it('criterion 4: toolbar buttons apply their format and reflect it with aria-pressed', () => {
    const q = quill();
    q.setText('Hello\n', 'api');
    q.setSelection(0, 5, 'user');
    button('Bold').click();
    button('Heading 1').click();
    fixture.detectChanges();
    expect(content().innerHTML).toContain('<h1>');
    expect(content().innerHTML).toContain('<strong>');
    expect(button('Bold').getAttribute('aria-pressed')).toBe('true');
    expect(button('Heading 1').getAttribute('aria-pressed')).toBe('true');
    expect(button('Italic').getAttribute('aria-pressed')).toBe('false');

    button('Heading 1').click();
    button('Code block').click();
    expect(content().innerHTML).toContain('ql-code-block');
  });

  it('criterion 4: the image button raises imageRequested', () => {
    button('Insert image').click();
    expect(fixture.componentInstance.images).toBe(1);
  });

  it('displays the bound HTML without echoing it back as a change', async () => {
    fixture.componentInstance.value.set('<p>Bound <strong>text</strong></p>');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(content().innerHTML).toBe('<p>Bound <strong>text</strong></p>');
    expect(fixture.componentInstance.emitted).toEqual([]);
  });

  it('criterion 5: after a text change, text equals the inner HTML of the content element and is emitted', () => {
    const cmp = fixture.debugElement.children[0].componentInstance as RichTextEditorComponent;
    quill().insertText(0, 'Typed', 'user');
    expect(content().innerHTML).toBe('<p>Typed</p>');
    expect(cmp.text()).toBe(content().innerHTML);
    expect(fixture.componentInstance.emitted).toEqual(['<p>Typed</p>']);
  });

  it('readonly makes the content element non-editable', async () => {
    fixture.componentInstance.readonly.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(content().getAttribute('contenteditable')).toBe('false');
  });

  it('keeps the editor library behind the RichTextEngine abstraction', async () => {
    const calls: string[] = [];
    class FakeEngine extends RichTextEngine {
      private cb: (html: string) => void = () => undefined;
      mount(host: HTMLElement): HTMLElement {
        calls.push('mount');
        const inner = host.ownerDocument.createElement('div');
        host.appendChild(inner);
        return inner;
      }
      setHtml(html: string): void {
        calls.push('setHtml:' + html);
      }
      format(name: string, value: unknown): void {
        calls.push(`format:${name}:${String(value)}`);
        this.cb('<p>x</p>');
      }
      onChange(cb: (html: string) => void): void {
        this.cb = cb;
      }
      onFormatsChange(): void {
        calls.push('onFormatsChange');
      }
      destroy(): void {
        calls.push('destroy');
      }
    }
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ imports: [Host] })
      .overrideComponent(RichTextEditorComponent, {
        set: { providers: [{ provide: RichTextEngine, useClass: FakeEngine }] },
      })
      .compileComponents();
    const f = TestBed.createComponent(Host);
    f.componentInstance.value.set('<p>a</p>');
    f.detectChanges();
    await f.whenStable();
    f.nativeElement.querySelector('button[aria-label="Italic"]').click();
    expect(calls.filter((c) => c !== 'onFormatsChange')).toEqual(['mount', 'setHtml:<p>a</p>', 'format:italic:true']);
    expect(f.componentInstance.emitted).toEqual(['<p>x</p>']);
    f.destroy();
    expect(calls.at(-1)).toBe('destroy');
  });
});
