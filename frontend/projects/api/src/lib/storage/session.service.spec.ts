// Traces to: L2-026
import { TestBed } from '@angular/core/testing';
import { SESSION_STORAGE_KEY, SessionService } from './session.service';

describe('SessionService (L2-026)', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  const create = (): SessionService => TestBed.inject(SessionService);

  it('L2-026/1: put appends a new item and replaces the value of an existing name', () => {
    const session = create();
    session.put({ name: 'token', value: 'a' });
    session.put({ name: 'other', value: 'b' });
    session.put({ name: 'token', value: 'c' });
    expect(session.get({ name: 'token' })).toBe('c');
    expect(session.items().length).toBe(2);
  });

  it('L2-026/2: get returns the matching value or null', () => {
    const session = create();
    session.put({ name: 'token', value: 'abc' });
    expect(session.get({ name: 'token' })).toBe('abc');
    expect(session.get({ name: 'missing' })).toBeNull();
  });

  it('L2-026/3: writes the items to localStorage under theDebateApp when the window unloads', () => {
    const session = create();
    session.put({ name: 'token', value: 'abc' });
    expect(localStorage.getItem('theDebateApp')).toBeNull();
    window.dispatchEvent(new Event('beforeunload'));
    expect(SESSION_STORAGE_KEY).toBe('theDebateApp');
    expect(JSON.parse(localStorage.getItem('theDebateApp')!)).toEqual([{ name: 'token', value: 'abc' }]);
  });

  it('L2-026/4: starts empty when localStorage holds nothing', () => {
    expect(create().items()).toEqual([]);
  });

  it('L2-026/4: starts empty when localStorage holds the literal string "null"', () => {
    localStorage.setItem('theDebateApp', 'null');
    expect(create().items()).toEqual([]);
  });

  it('L2-026/4: restores items persisted by an earlier page load', () => {
    localStorage.setItem('theDebateApp', JSON.stringify([{ name: 'token', value: 'xyz' }]));
    expect(create().get({ name: 'token' })).toBe('xyz');
  });

  it('L2-026/5: clear leaves the items empty', () => {
    const session = create();
    session.put({ name: 'token', value: 'abc' });
    session.clear();
    expect(session.items()).toEqual([]);
    expect(session.get({ name: 'token' })).toBeNull();
  });
});
