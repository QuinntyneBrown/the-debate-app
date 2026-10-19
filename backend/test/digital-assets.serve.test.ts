// Traces to: L2-012
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { bearer, createTestContext } from './helpers.js';

// pg-mem's bytea is lossy above 0x7f (a pg-mem limitation; node-pg stores Buffers binary-safe), so fixtures stay ASCII-range.
const PNG = Buffer.from([80, 78, 71, 0, 127]);

async function seed() {
  const ctx = await createTestContext();
  const up = await request(ctx.app)
    .post('/api/digitalasset/upload')
    .attach('f', PNG, { filename: 'pic.png', contentType: 'image/png' });
  const id = up.body.files[0].id as number;
  const uniqueId = (await ctx.pool.query('SELECT unique_id FROM digital_assets WHERE id = $1', [id])).rows[0]
    .unique_id as string;
  return { ...ctx, id, uniqueId };
}

const binary = (res: request.Response, cb: (err: Error | null, body: Buffer) => void) => {
  const chunks: Buffer[] = [];
  res.on('data', (c: Buffer) => chunks.push(c));
  res.on('end', () => cb(null, Buffer.concat(chunks)));
};

describe('L2-012 digital asset serve', () => {
  it('1: serves bytes with the stored content type by uniqueId', async () => {
    const { app, uniqueId } = await seed();
    const res = await request(app).get(`/api/digitalasset/serve?uniqueId=${uniqueId}`).buffer().parse(binary).expect(200);
    expect(res.headers['content-type']).toBe('image/png');
    expect(Buffer.compare(res.body, PNG)).toBe(0);
  });

  it('2: serves by name when no uniqueId is supplied (first match)', async () => {
    const { app } = await seed();
    await request(app)
      .post('/api/digitalasset/upload')
      .attach('f', Buffer.from('later'), { filename: 'pic.png', contentType: 'text/plain' });
    const res = await request(app).get('/api/digitalasset/serve?name=pic.png').buffer().parse(binary).expect(200);
    expect(res.headers['content-type']).toBe('image/png');
    expect(Buffer.compare(res.body, PNG)).toBe(0);
  });

  it('3: no match returns 200 with no content', async () => {
    const { app } = await seed();
    const urls = [
      '/api/digitalasset/serve?uniqueId=00000000-0000-4000-8000-000000000000',
      '/api/digitalasset/serve?name=nope',
      '/api/digitalasset/serve?uniqueId=not-a-guid',
      '/api/digitalasset/serve',
    ];
    for (const url of urls) {
      const res = await request(app).get(url).expect(200);
      expect(res.text ?? '').toBe('');
    }
  });

  it('4: repeat requests come from the cache without a database query, with 1000 s cache headers', async () => {
    const { app, uniqueId, queries } = await seed();
    const first = await request(app).get(`/api/digitalasset/serve?uniqueId=${uniqueId}`).expect(200);
    expect(first.headers['cache-control']).toBe('public, max-age=1000, s-maxage=1000');
    const before = queries.length;
    const second = await request(app).get(`/api/digitalasset/serve?uniqueId=${uniqueId}`).expect(200);
    expect(queries.length).toBe(before);
    expect(second.headers['cache-control']).toBe('public, max-age=1000, s-maxage=1000');

    await request(app).get('/api/digitalasset/serve?name=pic.png').expect(200);
    const afterName = queries.length;
    await request(app).get('/api/digitalasset/serve?name=pic.png').expect(200);
    expect(queries.length).toBe(afterName);
  });

  it('6 (addendum): a soft-deleted asset is not served by uniqueId or name', async () => {
    const { app, id, uniqueId } = await seed();
    await request(app).delete(`/api/digitalasset/remove?id=${id}`).set(bearer()).expect(200);
    const a = await request(app).get(`/api/digitalasset/serve?uniqueId=${uniqueId}`).expect(200);
    expect(a.text ?? '').toBe('');
    const b = await request(app).get('/api/digitalasset/serve?name=pic.png').expect(200);
    expect(b.text ?? '').toBe('');
  });

  it('6 (addendum): removal invalidates a cached entry', async () => {
    const { app, id, uniqueId } = await seed();
    await request(app).get(`/api/digitalasset/serve?uniqueId=${uniqueId}`).expect(200);
    await request(app).delete(`/api/digitalasset/remove?id=${id}`).set(bearer()).expect(200);
    const res = await request(app).get(`/api/digitalasset/serve?uniqueId=${uniqueId}`).expect(200);
    expect(res.text ?? '').toBe('');
  });
});
