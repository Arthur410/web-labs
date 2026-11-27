import assert from 'node:assert/strict';
import test from 'node:test';
import request from 'supertest';
import { app } from './app.js';

test('issues a session for a registered profile and allows its news to be published', async () => {
  const profile = { name: 'Профиль теста', email: 'test@example.test', password: 'test-profile-password' };
  const created = await request(app).post('/api/users').send(profile).expect(201);
  const { id } = created.body.user;
  assert.equal(created.body.user.password, undefined);

  const login = await request(app).post('/api/login').send(profile).expect(200);
  assert.equal(login.body.user.id, id);
  assert.equal(login.body.user.password, undefined);

  const session = 'Bearer ' + login.body.token;
  await request(app).post('/addNews/' + id).set('Authorization', session)
    .send({ text: 'Новая запись' }).expect(204);

  const read = await request(app).get('/api/user/' + id).expect(200);
  assert.deepEqual(read.body.news, ['Новая запись']);
  assert.equal(read.body.password, undefined);
  await request(app).post('/api/logout').set('Authorization', session).expect(204);
});

test('renders the profile directory and stylesheet', async () => {
  await request(app).get('/').expect(302).expect('Location', '/html/users.html');
  await request(app).get('/html/users.html').expect(200);
  await request(app).get('/css/main.css').expect(200).expect('Content-Type', /css/);
});
