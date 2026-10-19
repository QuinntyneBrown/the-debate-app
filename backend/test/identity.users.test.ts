// Traces to: L2-008
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { bearer, createTestContext } from './helpers.js';

describe('L2-008 user CRUD endpoints', () => {
  it('1: add creates a user with only a name', async () => {
    const { app, pool } = await createTestContext();
    const res = await request(app).post('/api/user/add').set(bearer()).send({ name: 'Ann' }).expect(200);
    expect(res.body).toEqual({ id: expect.any(Number), name: 'Ann' });
    const row = (await pool.query('SELECT username, password FROM users WHERE id = $1', [res.body.id])).rows[0];
    expect(row).toEqual({ username: null, password: null });
  });

  it('2: update overwrites only the name', async () => {
    const { app, pool } = await createTestContext();
    const admin = (await pool.query("SELECT id FROM users WHERE username = 'admin'")).rows[0].id;
    const res = await request(app).put('/api/user/update').set(bearer()).send({ id: admin, name: 'Renamed' }).expect(200);
    expect(res.body).toEqual({ id: admin, name: 'Renamed' });
    const row = (await pool.query('SELECT username FROM users WHERE id = $1', [admin])).rows[0];
    expect(row.username).toBe('admin');
  });

  it('3: anonymous get lists non-deleted users without sensitive fields', async () => {
    const { app } = await createTestContext();
    const res = await request(app).get('/api/user/get').expect(200);
    expect(res.body.length).toBeGreaterThan(0);
    for (const u of res.body) expect(Object.keys(u).sort()).toEqual(['id', 'name']);
    expect(res.text).not.toMatch(/password|username|email/i);
  });

  it('4: getById, add, update, remove without credentials yield 401', async () => {
    const { app } = await createTestContext();
    await request(app).get('/api/user/getById?id=1').expect(401);
    await request(app).post('/api/user/add').send({ name: 'x' }).expect(401);
    await request(app).put('/api/user/update').send({ name: 'x' }).expect(401);
    await request(app).delete('/api/user/remove?id=1').expect(401);
  });

  it('5: remove soft-deletes and returns the id; unknown or deleted ids give 404', async () => {
    const { app, pool } = await createTestContext();
    const created = await request(app).post('/api/user/add').set(bearer()).send({ name: 'Tmp' });
    const id = created.body.id;
    const res = await request(app).delete(`/api/user/remove?id=${id}`).set(bearer()).expect(200);
    expect(res.body).toBe(id);
    expect((await pool.query('SELECT is_deleted FROM users WHERE id = $1', [id])).rows[0].is_deleted).toBe(true);
    await request(app).get(`/api/user/getById?id=${id}`).set(bearer()).expect(404);
    await request(app).delete(`/api/user/remove?id=${id}`).set(bearer()).expect(404);
    await request(app).get('/api/user/getById?id=99999').set(bearer()).expect(404);
  });

  it('getById returns the user for a valid token', async () => {
    const { app } = await createTestContext();
    const created = await request(app).post('/api/user/add').set(bearer()).send({ name: 'Zed' });
    const res = await request(app).get(`/api/user/getById?id=${created.body.id}`).set(bearer()).expect(200);
    expect(res.body).toEqual({ id: created.body.id, name: 'Zed' });
  });
});
