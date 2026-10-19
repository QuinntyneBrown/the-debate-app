// Traces to: L2-025
import { TestBed } from '@angular/core/testing';
import { ConnectivityService } from './connectivity.service';

describe('ConnectivityService (L2-025/5)', () => {
  it('starts online and follows window offline and online events', () => {
    const service = TestBed.inject(ConnectivityService);
    expect(service.online()).toBe(true);
    window.dispatchEvent(new Event('offline'));
    expect(service.online()).toBe(false);
    window.dispatchEvent(new Event('online'));
    expect(service.online()).toBe(true);
  });

  it('reportOffline and reportOnline update the online signal', () => {
    const service = TestBed.inject(ConnectivityService);
    service.reportOffline();
    expect(service.online()).toBe(false);
    service.reportOnline();
    expect(service.online()).toBe(true);
  });
});
