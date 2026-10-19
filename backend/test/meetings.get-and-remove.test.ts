// Traces to: L2-003, L2-004
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createTestContext } from './helpers.js';

describe('L2-003 meeting get-by-id', () => {
  it('1: returns the meeting dto', async () => {
    const { app } = await createTestContext();
    const { body } = await request(app).post('/api/meeting/add').send({ name: 'One', date: '2024-01-02' });
    const res = await request(app).get(`/api/meeting/getById?id=${body.id}`).expect(200);
    expect(res.body).toMatchObject({ id: body.id, name: 'One', date: '2024-01-02' });
  });

  it('3: unknown or soft-deleted id returns 404 (addendum)', async () => {
    const { app } = await createTestContext();
    await request(app).get('/api/meeting/getById?id=424242').expect(404);
    await request(app).get('/api/meeting/getById?id=abc').expect(404);
  });
});

describe('L2-004 meeting remove', () => {
  it('1: soft-deletes and returns the integer id', async () => {
    const { app, pool } = await createTestContext();
    const { body } = await request(app).post('/api/meeting/add').send({ name: 'Bye' });
    const res = await request(app).delete(`/api/meeting/remove?id=${body.id}`).expect(200);
    expect(res.body).toBe(body.id);
    const row = (await pool.query('SELECT is_deleted FROM meetings WHERE id = $1', [body.id])).rows[0];
    expect(row.is_deleted).toBe(true);
  });

  it('3: unknown or already-deleted id returns 404 and changes no row (addendum)', async () => {
    const { app, pool } = await createTestContext();
    const before = (await pool.query('SELECT id, is_deleted FROM meetings ORDER BY id')).rows;
    await request(app).delete('/api/meeting/remove?id=424242').expect(404);
    expect((await pool.query('SELECT id, is_deleted FROM meetings ORDER BY id')).rows).toEqual(before);
    const { body } = await request(app).post('/api/meeting/add').send({ name: 'Twice' });
    await request(app).delete(`/api/meeting/remove?id=${body.id}`).expect(200);
    await request(app).delete(`/api/meeting/remove?id=${body.id}`).expect(404);
  });
});
