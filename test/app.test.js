const request = require('supertest');
const app = require('../server');

describe('Node.js DevOps Demo App', () => {
  let server;

  beforeAll(() => {
    server = app.listen(3001);
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('Health Endpoints', () => {
    test('GET /health should return 200', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('version');
    });

    test('GET /ready should return 200', async () => {
      const response = await request(app).get('/ready');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ready');
    });

    test('GET /metrics should return app metrics', async () => {
      const response = await request(app).get('/metrics');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('memory');
    });
  });

  describe('API Endpoints', () => {
    test('GET /api/info should return app information', async () => {
      const response = await request(app).get('/api/info');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('app', 'DevOps Demo');
      expect(response.body).toHaveProperty('techStack');
      expect(Array.isArray(response.body.techStack)).toBe(true);
    });
  });

  describe('Main Routes', () => {
    test('GET / should return HTML page', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.type).toBe('text/html');
      expect(response.text).toContain('DevOps Demo');
    });

    test('GET /nonexistent should return 404', async () => {
      const response = await request(app).get('/nonexistent');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Route not found');
    });
  });
});