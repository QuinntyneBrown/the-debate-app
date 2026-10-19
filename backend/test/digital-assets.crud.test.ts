// Traces to: L2-010
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { bearer, createTestContext } from './helpers.js';
import { describeNamedCrud } from './content-crud.js';

describeNamedCrud({ label: 'digital asset', route: '/api/digitalasset', field: 'name', table: 'digital_assets' }, 'L2-010');

describe('L2-010 digital asset specifics', () => {
  it('1: add stores an empty byte array and a fresh unique id', async () => {
    const { app, pool } = await createTestContext();
    await request(app).post('/api/digitalasset/add').set(bearer()).send({ id: 0, name: 'a' }).expect(200);
    await request(app).post('/api/digitalasset/add').set(bearer()).send({ id: 0, name: 'b' }).expect(200);
    const rows = (await pool.query('SELECT unique_id, bytes FROM digital_assets ORDER BY id')).rows;
    expect(rows).toHaveLength(2);
    expect(Buffer.from(rows[0].bytes).length).toBe(0);
    expect(String(rows[0].unique_id)).toMatch(/^[0-9a-f-]{36}$/);
    expect(rows[0].unique_id).not.toBe(rows[1].unique_id);
  });

  it('2: update changes only the name', async () => {
    const { app, pool } = await createTestContext();
    const up = await request(app)
      .post('/api/digitalasset/upload')
      .attach('f', Buffer.from('xyz'), { filename: 'a.txt', contentType: 'text/plain' });
    const id = up.body.files[0].id;
    await request(app).put('/api/digitalasset/update').set(bearer()).send({ id, name: 'renamed.txt' }).expect(200);
    const row = (await pool.query('SELECT name, content_type, bytes FROM digital_assets WHERE id = $1', [id])).rows[0];
    expect(row.name).toBe('renamed.txt');
    expect(row.content_type).toBe('text/plain');
    expect(Buffer.from(row.bytes).toString()).toBe('xyz');
  });

  it('3: get never includes bytes', async () => {
    const { app } = await createTestContext();
    await request(app)
      .post('/api/digitalasset/upload')
      .attach('f', Buffer.from('secret'), { filename: 'a.txt', contentType: 'text/plain' });
    const res = await request(app).get('/api/digitalasset/get').expect(200);
    expect(res.body).toHaveLength(1);
    expect(Object.keys(res.body[0]).sort()).toEqual(['id', 'name']);
  });
});
