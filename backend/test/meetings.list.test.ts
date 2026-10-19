// Traces to: L2-002
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createTestContext } from './helpers.js';

describe('L2-002 meeting list', () => {
  it('1: anonymous list returns every non-deleted meeting', async () => {
    const { app } = await createTestContext();
    await request(app).post('/api/meeting/add').send({ name: 'Second' });
    const res = await request(app).get('/api/meeting/get').expect(200);
    expect(res.body.map((m: { name: string }) => m.name)).toEqual(['Introduction', 'Second']);
    expect(Object.keys(res.body[0]).sort()).toEqual(
      ['abstract', 'agenda', 'date', 'end', 'id', 'minutes', 'name', 'start'],
    );
  });

  it('2: a soft-deleted meeting is absent', async () => {
    const { app } = await createTestContext();
    const { body } = await request(app).post('/api/meeting/add').send({ name: 'Doomed' });
    await request(app).delete(`/api/meeting/remove?id=${body.id}`);
    const res = await request(app).get('/api/meeting/get');
    expect(res.body.map((m: { name: string }) => m.name)).not.toContain('Doomed');
  });

  it('3: a date is formatted yyyy-MM-dd', async () => {
    const { app } = await createTestContext();
    await request(app).post('/api/meeting/add').send({ name: 'Dated', date: '2024-03-09' });
    const res = await request(app).get('/api/meeting/get');
    expect(res.body.find((m: { name: string }) => m.name === 'Dated').date).toBe('2024-03-09');
  });

  it('4: a null date is an empty string', async () => {
    const { app } = await createTestContext();
    const res = await request(app).get('/api/meeting/get');
    expect(res.body.find((m: { name: string }) => m.name === 'Introduction').date).toBe('');
  });
});
