// Traces to: L2-011
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createTestContext } from './helpers.js';
import type { Db } from '../src/shared/db.js';

const stored = async (pool: Db) =>
  (await pool.query('SELECT name, content_type, bytes FROM digital_assets ORDER BY id')).rows;

describe('L2-011 digital asset upload', () => {
  it('1+2: stores each file with bytes and content type; returns ids and names in upload order', async () => {
    const { app, pool } = await createTestContext();
    const res = await request(app)
      .post('/api/digitalasset/upload')
      .attach('a', Buffer.from([1, 2, 3, 127]), { filename: 'one.bin', contentType: 'application/octet-stream' })
      .attach('b', Buffer.from('hello'), { filename: 'two.txt', contentType: 'text/plain' })
      .expect(200);
    expect(res.body).toEqual({
      files: [
        { id: expect.any(Number), name: 'one.bin' },
        { id: expect.any(Number), name: 'two.txt' },
      ],
    });
    const rows = await stored(pool);
    expect(rows.map((r) => r.content_type)).toEqual(['application/octet-stream', 'text/plain']);
    expect([...Buffer.from(rows[0].bytes)]).toEqual([1, 2, 3, 127]);
    expect(Buffer.from(rows[1].bytes).toString()).toBe('hello');
  });

  it('1: sanitises file names (quotes stripped, & replaced with and, directory removed)', async () => {
    const { app } = await createTestContext();
    const res = await request(app)
      .post('/api/digitalasset/upload')
      .attach('a', Buffer.from('x'), { filename: 'C:\\temp\\Tom & Jerry.png', contentType: 'image/png' })
      .attach('b', Buffer.from('x'), { filename: 'some/dir/a&b.txt', contentType: 'text/plain' })
      .attach('c', Buffer.from('x'), { filename: '"quoted.txt"', contentType: 'text/plain' })
      .expect(200);
    expect(res.body.files.map((f: { name: string }) => f.name)).toEqual(['Tom and Jerry.png', 'aandb.txt', 'quoted.txt']);
  });

  it('3: a non-multipart request returns { files: [] }', async () => {
    const { app, pool } = await createTestContext();
    const res = await request(app).post('/api/digitalasset/upload').send({ a: 1 }).expect(200);
    expect(res.body).toEqual({ files: [] });
    expect(await stored(pool)).toHaveLength(0);
  });

  it('4: a part lacking Content-Disposition returns { files: [] } and saves nothing', async () => {
    const { app, pool } = await createTestContext();
    const raw = '--XX\r\nContent-Type: text/plain\r\n\r\nhello\r\n--XX--\r\n';
    const res = await request(app)
      .post('/api/digitalasset/upload')
      .set('Content-Type', 'multipart/form-data; boundary=XX')
      .send(raw)
      .expect(200);
    expect(res.body).toEqual({ files: [] });
    expect(await stored(pool)).toHaveLength(0);
  });

  it('5: non-file form fields are not stored as assets', async () => {
    const { app, pool } = await createTestContext();
    const res = await request(app)
      .post('/api/digitalasset/upload')
      .field('caption', 'a caption')
      .attach('f', Buffer.from('x'), { filename: 'f.txt', contentType: 'text/plain' })
      .expect(200);
    expect(res.body.files).toHaveLength(1);
    expect(await stored(pool)).toHaveLength(1);
  });

  it('6: accepted without an Authorization header', async () => {
    const { app } = await createTestContext();
    await request(app)
      .post('/api/digitalasset/upload')
      .attach('f', Buffer.from('x'), { filename: 'f.txt', contentType: 'text/plain' })
      .expect(200);
  });
});
