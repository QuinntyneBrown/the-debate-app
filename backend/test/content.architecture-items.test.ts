// Traces to: L2-007
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { bearer, createTestContext } from './helpers.js';
import { describeNamedCrud } from './content-crud.js';

describeNamedCrud(
  { label: 'architecture item', route: '/api/architectureItem', field: 'name', table: 'architecture_items' },
  'L2-007',
);

describe('L2-007 architecture item specifics', () => {
  it('1: a new item has a null architecture_id', async () => {
    const { app, pool } = await createTestContext();
    const { body } = await request(app).post('/api/architectureItem/add').set(bearer()).send({ id: 0, name: 'Item' });
    const row = (await pool.query('SELECT architecture_id FROM architecture_items WHERE id = $1', [body.id])).rows[0];
    expect(row.architecture_id).toBeNull();
  });
});
