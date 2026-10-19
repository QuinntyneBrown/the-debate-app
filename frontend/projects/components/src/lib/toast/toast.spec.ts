// Traces to: L2-024, L2-023
import { TestBed } from '@angular/core/testing';
import { ToastRegionComponent } from './toast-region.component';
import { ToastService } from './toast.service';

describe('Toasts (save and delete notifications of the meeting designs)', () => {
  let service: ToastService;
  let el: HTMLElement;
  let fixture: ReturnType<typeof TestBed.createComponent<ToastRegionComponent>>;

  const flush = () => fixture.detectChanges();

  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({ imports: [ToastRegionComponent] }).compileComponents();
    service = TestBed.inject(ToastService);
    fixture = TestBed.createComponent(ToastRegionComponent);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => vi.useRealTimers());

  it('renders an empty polite live region before any toast arrives', () => {
    const region = el.querySelector('.toast-region')!;
    expect(region.getAttribute('role')).toBe('status');
    expect(region.getAttribute('aria-live')).toBe('polite');
    expect(el.querySelectorAll('.toast').length).toBe(0);
  });

  it('shows a success toast with title and text and closes it after 8 seconds', () => {
    service.show({ tone: 'success', title: 'Meeting saved', text: 'Universal basic income' });
    flush();
    const toast = el.querySelector('.toast.toast--success')!;
    expect(toast.querySelector('.toast__title')?.textContent).toBe('Meeting saved');
    expect(toast.querySelector('.toast__text')?.textContent).toBe('Universal basic income');
    vi.advanceTimersByTime(7999);
    flush();
    expect(el.querySelectorAll('.toast').length).toBe(1);
    vi.advanceTimersByTime(1);
    flush();
    expect(el.querySelectorAll('.toast').length).toBe(0);
  });

  it('pauses the countdown while the pointer is over the toast and resumes on leave', () => {
    service.show({ tone: 'success', title: 'Meeting saved' });
    flush();
    const toast = el.querySelector('.toast')!;
    vi.advanceTimersByTime(5000);
    toast.dispatchEvent(new Event('mouseenter'));
    vi.advanceTimersByTime(60000);
    flush();
    expect(el.querySelectorAll('.toast').length).toBe(1);
    toast.dispatchEvent(new Event('mouseleave'));
    vi.advanceTimersByTime(3000);
    flush();
    expect(el.querySelectorAll('.toast').length).toBe(0);
  });

  it('a danger toast is announced with role=alert, never auto-dismisses and offers its action', () => {
    const retry = vi.fn();
    service.show({ tone: 'danger', title: "We couldn't save the meeting", text: 'Your changes are still in the form.', actionLabel: 'Try again', action: retry });
    flush();
    vi.advanceTimersByTime(600000);
    flush();
    const toast = el.querySelector('.toast.toast--danger')!;
    expect(toast.getAttribute('role')).toBe('alert');
    (toast.querySelector('.toast__action') as HTMLButtonElement).click();
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('Dismiss closes the toast', () => {
    service.show({ tone: 'info', title: 'Hello' });
    flush();
    (el.querySelector('.toast .close') as HTMLButtonElement).click();
    flush();
    expect(el.querySelectorAll('.toast').length).toBe(0);
  });
});
