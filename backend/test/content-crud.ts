import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { bearer, createTestContext } from './helpers.js';

export interface NamedCrudSpec {
  label: string;
  route: string; // e.g. /api/article
  field: 'title' | 'name';
  table: string;
}

/** Shared acceptance suite for the add/update/get/getById/remove contract of L2-005/006/007/010. */
export function describeNamedCrud(spec: NamedCrudSpec, l2: string): void {
  const { route, field, table } = spec;
  const payload = (value: string, id = 0) => ({ id, [field]: value });

  describe(`${l2} ${spec.label} endpoints`, () => {
    it('1: authorised add creates a record and returns { id, field }', async () => {
      const { app, pool } = await createTestContext();
      const res = await request(app).post(`${route}/add`).set(bearer()).send(payload('First')).expect(200);
      expect(res.body).toEqual({ id: expect.any(Number), [field]: 'First' });
      const rows = (await pool.query(`SELECT ${field} AS v FROM ${table} WHERE id = $1`, [res.body.id])).rows;
      expect(rows[0].v).toBe('First');
    });

    it('2: authorised update overwrites the field of a non-deleted record', async () => {
      const { app } = await createTestContext();
      const { body } = await request(app).post(`${route}/add`).set(bearer()).send(payload('Old'));
      const res = await request(app).put(`${route}/update`).set(bearer()).send(payload('New', body.id)).expect(200);
      expect(res.body).toEqual({ id: body.id, [field]: 'New' });
      const got = await request(app).get(`${route}/getById?id=${body.id}`).set(bearer()).expect(200);
      expect(got.body[field]).toBe('New');
    });

    it('3: anonymous get lists all non-deleted records as { id, field }', async () => {
      const { app } = await createTestContext();
      const a = await request(app).post(`${route}/add`).set(bearer()).send(payload('A'));
      const b = await request(app).post(`${route}/add`).set(bearer()).send(payload('B'));
      const res = await request(app).get(`${route}/get`).expect(200);
      expect(res.body).toEqual([
        { id: a.body.id, [field]: 'A' },
        { id: b.body.id, [field]: 'B' },
      ]);
    });

    it('4: anonymous getById, add, update and remove return 401', async () => {
      const { app } = await createTestContext();
      await request(app).get(`${route}/getById?id=1`).expect(401);
      await request(app).post(`${route}/add`).send(payload('x')).expect(401);
      await request(app).put(`${route}/update`).send(payload('x', 1)).expect(401);
      await request(app).delete(`${route}/remove?id=1`).expect(401);
    });

    it('5: authorised remove soft-deletes and returns the id', async () => {
      const { app, pool } = await createTestContext();
      const { body } = await request(app).post(`${route}/add`).set(bearer()).send(payload('Bye'));
      const res = await request(app).delete(`${route}/remove?id=${body.id}`).set(bearer()).expect(200);
      expect(res.body).toBe(body.id);
      const row = (await pool.query(`SELECT is_deleted FROM ${table} WHERE id = $1`, [body.id])).rows[0];
      expect(row.is_deleted).toBe(true);
    });

    it('6: soft-deleted records are excluded from get and getById, and update does not revive them', async () => {
      const { app } = await createTestContext();
      const { body } = await request(app).post(`${route}/add`).set(bearer()).send(payload('Gone'));
      await request(app).delete(`${route}/remove?id=${body.id}`).set(bearer()).expect(200);
      expect((await request(app).get(`${route}/get`).expect(200)).body).toEqual([]);
      await request(app).get(`${route}/getById?id=${body.id}`).set(bearer()).expect(404);
      const upd = await request(app).put(`${route}/update`).set(bearer()).send(payload('Back', body.id)).expect(200);
      expect(upd.body.id).not.toBe(body.id);
    });

    it('addendum: unknown or soft-deleted id returns 404 for getById and remove', async () => {
      const { app } = await createTestContext();
      await request(app).get(`${route}/getById?id=424242`).set(bearer()).expect(404);
      await request(app).get(`${route}/getById?id=abc`).set(bearer()).expect(404);
      await request(app).delete(`${route}/remove?id=424242`).set(bearer()).expect(404);
      const { body } = await request(app).post(`${route}/add`).set(bearer()).send(payload('Twice'));
      await request(app).delete(`${route}/remove?id=${body.id}`).set(bearer()).expect(200);
      await request(app).delete(`${route}/remove?id=${body.id}`).set(bearer()).expect(404);
    });
  });
}
