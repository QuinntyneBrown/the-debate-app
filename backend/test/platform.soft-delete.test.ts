// Traces to: L2-016
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createTestContext } from './helpers.js';
import { SoftDeletableRepository } from '../src/shared/soft-deletable-repository.js';

describe('L2-016 soft-delete semantics', () => {
  it('1: remove keeps the row with is_deleted = true', async () => {
    const { app, pool } = await createTestContext();
    const created = await request(app).post('/api/meeting/add').send({ name: 'M' });
    await request(app).delete(`/api/meeting/remove?id=${created.body.id}`).expect(200);
    const r = await pool.query('SELECT is_deleted FROM meetings WHERE id = $1', [created.body.id]);
    expect(r.rows).toHaveLength(1);
    expect(r.rows[0].is_deleted).toBe(true);
  });

  it('2: deleted entities are excluded from get and getById', async () => {
    const { app } = await createTestContext();
    const created = await request(app).post('/api/meeting/add').send({ name: 'Gone' });
    await request(app).delete(`/api/meeting/remove?id=${created.body.id}`);
    const list = await request(app).get('/api/meeting/get');
    expect(list.body.map((m: { name: string }) => m.name)).not.toContain('Gone');
    await request(app).get(`/api/meeting/getById?id=${created.body.id}`).expect(404);
  });

  it('3: add-or-update with a deleted id inserts a new row', async () => {
    const { app, pool } = await createTestContext();
    const created = await request(app).post('/api/meeting/add').send({ name: 'Old' });
    await request(app).delete(`/api/meeting/remove?id=${created.body.id}`);
    const again = await request(app).post('/api/meeting/add').send({ id: created.body.id, name: 'New' });
    expect(again.body.id).not.toBe(created.body.id);
    const old = await pool.query('SELECT name FROM meetings WHERE id = $1', [created.body.id]);
    expect(old.rows[0].name).toBe('Old');
  });

  it('4: repository getById with an unknown id returns null', async () => {
    const { pool } = await createTestContext();
    const repo = new SoftDeletableRepository(pool, 'meetings');
    expect(await repo.getById(987654)).toBeNull();
  });
});
