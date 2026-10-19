// Traces to: L2-001
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createTestContext } from './helpers.js';

const full = {
  name: 'Budget',
  date: '2024-05-01',
  start: '18:00',
  end: '19:30',
  abstract: '<p>a</p>',
  agenda: '<p>g</p>',
  minutes: '<p>m</p>',
};

describe('L2-001 meeting add-or-update', () => {
  it('1: creates a meeting when no non-deleted meeting has the id', async () => {
    const { app } = await createTestContext();
    const res = await request(app).post('/api/meeting/add').send(full).expect(200);
    expect(res.body).toEqual({ ...full, id: expect.any(Number) });
  });

  it('2: overwrites an existing meeting (PUT update shares the logic)', async () => {
    const { app } = await createTestContext();
    const { body } = await request(app).post('/api/meeting/add').send(full);
    const res = await request(app)
      .put('/api/meeting/update')
      .send({ ...full, id: body.id, name: 'Renamed', end: '20:00' })
      .expect(200);
    expect(res.body).toMatchObject({ id: body.id, name: 'Renamed', end: '20:00' });
    const list = await request(app).get('/api/meeting/get');
    expect(list.body.filter((m: { name: string }) => m.name === 'Renamed')).toHaveLength(1);
  });

  it('3: a non-empty date is parsed and stored', async () => {
    const { app } = await createTestContext();
    const res = await request(app).post('/api/meeting/add').send({ ...full, date: '2024-12-25T10:30:00' });
    expect(res.body.date).toBe('2024-12-25');
    await request(app).post('/api/meeting/add').send({ ...full, date: 'not a date' }).expect(400);
  });

  it('4: a null or empty date leaves the stored date unchanged', async () => {
    const { app } = await createTestContext();
    const { body } = await request(app).post('/api/meeting/add').send(full);
    for (const date of ['', null]) {
      const res = await request(app).put('/api/meeting/update').send({ ...full, id: body.id, date });
      expect(res.body.date).toBe('2024-05-01');
    }
  });

  it('5: a soft-deleted id creates a new meeting instead of reviving', async () => {
    const { app } = await createTestContext();
    const { body } = await request(app).post('/api/meeting/add').send(full);
    await request(app).delete(`/api/meeting/remove?id=${body.id}`);
    const res = await request(app).post('/api/meeting/add').send({ ...full, id: body.id });
    expect(res.status).toBe(200);
    expect(res.body.id).not.toBe(body.id);
  });

  it('6: no Authorization header is not rejected', async () => {
    const { app } = await createTestContext();
    const res = await request(app).post('/api/meeting/add').send(full);
    expect(res.status).not.toBe(401);
  });
});
