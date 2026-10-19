// Traces to: L2-017
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createTestContext } from './helpers.js';
import { toCamelCase } from '../src/shared/camel-case.js';

describe('L2-017 routing, serialization, CORS, Swagger', () => {
  it('1: JSON is camelCase and indented', async () => {
    const { app } = await createTestContext();
    const res = await request(app).get('/api/meeting/get');
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.text).toContain('\n  ');
    expect(Object.keys(res.body[0])).toContain('abstract');
    expect(toCamelCase({ is_deleted: true, first_name: 'a' })).toEqual({ isDeleted: true, firstName: 'a' });
  });

  it('2: Accept application/xml still yields JSON', async () => {
    const { app } = await createTestContext();
    const res = await request(app).get('/api/meeting/get').set('Accept', 'application/xml');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('3: CORS allows any origin, header and method', async () => {
    const { app } = await createTestContext();
    const res = await request(app)
      .options('/api/meeting/add')
      .set('Origin', 'http://other.example')
      .set('Access-Control-Request-Method', 'DELETE')
      .set('Access-Control-Request-Headers', 'x-custom');
    expect(res.headers['access-control-allow-origin']).toBe('*');
    expect(res.headers['access-control-allow-methods']).toMatch(/DELETE/);
    expect(res.headers['access-control-allow-headers']).toBe('x-custom');
    const get = await request(app).get('/api/meeting/get').set('Origin', 'http://other.example');
    expect(get.headers['access-control-allow-origin']).toBe('*');
  });

  it('4: swagger document is titled TheDebateApp v1 and the UI is served', async () => {
    const { app } = await createTestContext();
    const doc = await request(app).get('/swagger/docs/v1').expect(200);
    expect(doc.body.info).toMatchObject({ title: 'TheDebateApp', version: 'v1' });
    expect(Object.keys(doc.body.paths)).toContain('/api/meeting/get');
    const ui = await request(app).get('/swagger/ui/index').redirects(1).expect(200);
    expect(ui.text.toLowerCase()).toContain('swagger');
  });
});
