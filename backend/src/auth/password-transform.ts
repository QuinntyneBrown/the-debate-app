import { createHash } from 'node:crypto';

/** Base64 of the SHA-256 hash of the UTF-8 bytes, unsalted (L2-015). */
export const transformPassword = (password: string): string =>
  createHash('sha256').update(Buffer.from(password, 'utf8')).digest('base64');
