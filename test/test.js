const request = require('supertest');
const app = require('../server');

describe('GET /api/status', function() {
    it('responds with json', function(done) {
      request(app)
        .get('/api/status')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });
  });