import request from 'supertest';
import {app} from './app.js';

describe('Express App', () => {
  test('should return the list of users', async () => {
    const response = request(app).get('/api/users');
    expect(response.body).toHaveLength(4);
  });
});
