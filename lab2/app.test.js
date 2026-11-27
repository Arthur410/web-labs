const assert = require('node:assert/strict');
const { once } = require('node:events');
const test = require('node:test');
const app = require('./app');

test('edits the requested book by id after deleting an earlier record', async t => {
  const server = app.listen(0, '127.0.0.1');
  t.after(() => new Promise(resolve => server.close(resolve)));
  await once(server, 'listening');
  const base = 'http://127.0.0.1:' + server.address().port;
  const books = await (await fetch(base + '/api/books')).json();
  const [first, second] = books;
  const deleted = await fetch(base + '/api/books/' + first.id, { method: 'DELETE' });
  assert.equal(deleted.status, 200);

  const updated = await fetch(base + '/edit/' + second.id, {
    method: 'POST', redirect: 'manual', body: new URLSearchParams({ title: 'Новое название' }),
  });
  assert.equal(updated.status, 302);
  assert.equal(updated.headers.get('location'), '/view/' + second.id);

  const remaining = await (await fetch(base + '/api/books')).json();
  assert.equal(remaining.find(book => book.id === second.id).title, 'Новое название');
});
