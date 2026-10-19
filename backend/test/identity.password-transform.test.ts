// Traces to: L2-015
import { describe, it, expect } from 'vitest';
import { createHash } from 'node:crypto';
import { transformPassword } from '../src/auth/password-transform.js';

describe('L2-015 password transform', () => {
  it('1: result is base64(sha256(utf8(password))) with no salt', () => {
    const expected = createHash('sha256').update(Buffer.from('pässword', 'utf8')).digest('base64');
    expect(transformPassword('pässword')).toBe(expected);
    expect(transformPassword('')).toBe('47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=');
  });

  it('2: transforming twice gives identical results', () => {
    expect(transformPassword('abc')).toBe(transformPassword('abc'));
  });
});
