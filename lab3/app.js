import express from 'express'
import cors from "cors";
import fs from "fs";
import * as sass from 'sass';
import * as https from 'https'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import WebSocket, { WebSocketServer } from 'ws';
import { checkPassword, createSession, requireOwner, revokeSession, setPassword } from './auth.js';

export const app = express();
const localOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
app.use(cors({ origin: localOrigin }));

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectory = dirname(currentFilePath);
const users = JSON.parse(fs.readFileSync(join(currentDirectory, 'users.json'), 'utf8'));
let nextUserId = Math.max(0, ...users.map(user => user.id)) + 1;

function publicUser(user) {
  const { id, name, birthdate, email, photoUrl, role, status, friends, news } = user;
  return { id, name, birthdate, email, photoUrl, role, status, friends, news };
}

app.set('view engine', 'pug');
app.set('views', join(currentDirectory, 'src/views'));

app.use('/js', express.static(join(currentDirectory, 'src/js')));
let style;
app.get(['/css/main.css', '/scss/main.scss'], (req, res) => {
  style ??= sass.compile(join(currentDirectory, 'src/scss/main.scss')).css;
  res.type('css').send(style);
});
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(express.json({ limit: '1mb' }));

const pages = new Set(['users', 'userEdit', 'userFriends', 'userFriendsNews', 'userView']);
app.get('/', (req, res) => res.redirect('/html/users.html'));
app.get('/html/:page.html', (req, res) => {
  if (!pages.has(req.params.page)) return res.sendStatus(404);
  res.render(req.params.page);
});

app.get('/api/users', (req, res) => {
  res.json(users.map(publicUser));
});

app.get('/edit/:userId', (req, res) => {
  const userId = req.params.userId;
  const editUser = users.find(user => user.id === Number(userId));
  console.log(editUser)
  if (!editUser) {
    res.status(404).send('Пользователь не найден');
  } else {
    res.redirect(`/html/userEdit.html?userId=${editUser.id}`);
  }
});

app.post('/edit/:userId', (req, res) => {
  const user = users.find(user => user.id === Number(req.params.userId));
  if (!user || !checkPassword(user.id, req.body.password)) return res.status(401).send('Неверный пароль');

  const { name, email, birthdate } = req.body;
  if (![name, email, birthdate].every(value => typeof value === 'string') ||
      !name.trim() || name.length > 100 || !email.includes('@') || email.length > 254 ||
      !/^\d{4}-\d{2}-\d{2}$/.test(birthdate)) {
    return res.status(400).send('Некорректные данные профиля');
  }
  const nextName = name.trim();
  const nextEmail = email.trim().toLowerCase();
  if (users.some(other => other !== user && (other.name === nextName || other.email.toLowerCase() === nextEmail))) {
    return res.status(409).send('Имя или почта уже заняты');
  }

  for (const other of users) {
    other.friends = other.friends.map(friend => friend === user.name ? nextName : friend);
  }
  Object.assign(user, { name: nextName, email: nextEmail, birthdate: birthdate.split('-').reverse().join('.') });
  res.redirect('/');
});

app.get('/friends/:userId', (req, res) => {
  const user = users.find(user => user.id === Number(req.params.userId));
  console.log(user)
  if (!user) {
    res.status(404).send('Пользователь не найден');
  } else {
    res.redirect(`/html/userFriends.html?userId=${user.id}`);
  }
});

app.get('/friendsNews/:userName', (req, res) => {
  const userName = req.params.userName;
  const user = users.find(user => user.name === userName);

  if (!user) {
    res.status(404).send('Пользователь не найден');
  } else {
    res.json(user.news); // Возвращаем новости друзей в формате JSON
  }
});

app.get('/user/:userName', (req, res) => {
  const userName = req.params.userName;
  const user = users.find(user => user.name === userName);

  if (!user) {
    res.status(404).send('Пользователь не найден');
  } else {
    res.redirect(`/html/userView.html?userName=${encodeURIComponent(user.name)}`);
  }
});

app.get('/api/userView/:userName', (req, res) => {
  const userName = req.params.userName;
  const user = users.find(user => user.name === userName);

  if (!user) {
    res.status(404).json({ error: 'Пользователь не найден' }); // Return an error JSON response
  } else {
    res.json(publicUser(user)); // Return the user object as JSON
  }
});

app.get('/api/user/:userId', (req, res) => {
  const userId = req.params.userId;
  const user = users.find(user => user.id === Number(userId));

  if (!user) {
    res.status(404).json({ error: 'Пользователь не найден' });
  } else {
    res.json(publicUser(user));
  }
});

// ANGULAR INTERACTION
app.post('/api/users', (req, res) => {
  const { name, email, password, birthdate } = req.body;
  if (typeof name !== 'string' || !name.trim() || name.length > 100 ||
      typeof email !== 'string' || !email.includes('@') || email.length > 254) {
    return res.status(400).json({ error: 'Укажите имя и почту' });
  }
  const address = email.trim().toLowerCase();
  if (users.some(user => user.email.toLowerCase() === address || user.name === name.trim())) {
    return res.status(409).json({ error: 'Имя или почта уже заняты' });
  }
  const id = nextUserId;
  if (!setPassword(id, password)) return res.status(400).json({ error: 'Некорректный пароль' });
  nextUserId++;
  const user = { id, name: name.trim(), email: address, birthdate: typeof birthdate === 'string' ? birthdate.slice(0, 24) : '',
    photoUrl: 'https://i.imgur.com/OJlZPI1.png', role: 'user', status: 'active', friends: [], news: [] };
  users.push(user);
  res.status(201).json({ message: 'User created successfully', user: publicUser(user) });
});

// Express маршрут для аутентификации
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = typeof email === 'string' && users.find(user => user.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || !checkPassword(user.id, password)) return res.status(401).json({ error: 'Неверная почта или пароль' });
  const token = createSession(user.id);
  if (!token) return res.status(503).json({ error: 'Слишком много активных сессий' });
  res.set('Cache-Control', 'no-store').json({ user: publicUser(user), token });
});

app.post('/api/logout', (req, res) => {
  revokeSession(req);
  res.sendStatus(204);
});

app.post('/addNews/:userId', requireOwner, (req, res) => {
  const userId = req.params.userId;
  const user = users.find(user => user.id === Number(userId));

  if (!user) {
    res.status(404).send('Пользователь не найден');
  } else {
    const news = req.body.text;

    if (typeof news === 'string' && news.trim() && news.length <= 2000) {
      user.news.push(news.trim());
      res.sendStatus(204);
    } else {
      res.status(400).send('Новости не были предоставлены');
    }
  }
});

app.delete('/api/removeFriend/:userId/:friendName', requireOwner, (req, res) => {
  const userId = req.params.userId;
  const friendName = req.params.friendName;

  const user = users.find(user => user.id === Number(userId));

  if (!user) {
    res.status(404).send('Пользователь не найден');
  } else {
    const friendIndex = user.friends.findIndex(friend => friend === friendName);

    if (friendIndex !== -1) {
      const removedFriend = user.friends.splice(friendIndex, 1)[0]; // Удалить друга и получить его имя

      // Найти друга в списке удаленного друга и удалить текущего пользователя из списка удаленного друга
      const removedFriendUser = users.find(u => u.name === removedFriend);
      if (removedFriendUser) {
        const currentUserIndex = removedFriendUser.friends.findIndex(friend => friend === user.name);
        if (currentUserIndex !== -1) {
          removedFriendUser.friends.splice(currentUserIndex, 1);
        }
      }

      res.json({ message: 'Друг успешно удален' });
      console.log(users);
    } else {
      res.status(404).send('Друг не найден в списке друзей пользователя');
    }
  }
});

app.post('/api/addFriend/:userId', requireOwner, (req, res) => {
  const userId = req.params.userId;
  const friendName = req.body.friend;
  const friendUser = users.find(user => user.name === friendName);
  if (!friendUser || friendUser.id === Number(userId)) return res.status(400).send('Некорректный друг');

  const user = users.find(user => user.id === Number(userId));

  if (!user) {
    res.status(404).send('Пользователь не найден');
  } else {
    const existingFriend = user.friends.find(friend => friend === friendName);

    if (existingFriend) {
      res.status(400).send('Друг с таким именем уже существует в списке друзей');
    } else {
      user.friends.push(friendName);
      res.json({ message: 'Друг успешно добавлен' });

      // Добавить текущего пользователя в список друзей друга
      if (!friendUser.friends.includes(user.name)) {
        friendUser.friends.push(user.name);
      }
    }
  }
});

app.get('/api/allNames', (req, res) => {
  const userNames = users.map(user => user.name);
  res.json(userNames);
});

app.delete('/api/user/:userId/delete-avatar', requireOwner, (req, res) => {
  const userId = req.params.userId;
  const user = users.find(user => user.id === Number(userId));

  if (!user) {
    return res.status(404).send('Пользователь не найден');
  }

  user.photoUrl = 'https://i.imgur.com/OJlZPI1.png';

  return res.status(200).json({ success: true, photoUrl: user.photoUrl });
});

app.post('/api/image-upload/:userId', requireOwner, (req,res) => {
  const userId = req.params.userId;
  const user = users.find(user => user.id === Number(userId));
  const imageUrl = req.body.image;
  if (!user) {
    return res.status(404).send('Пользователь не найден');
  }

  if (typeof imageUrl !== 'string' ||
      !/^data:image\/(png|jpeg|gif|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(imageUrl)) {
    return res.status(400).json({ error: 'Поддерживаются PNG, JPEG, GIF и WebP' });
  }
  user.photoUrl = imageUrl;
  return res.status(200).json({ success: true, photoUrl: user.photoUrl });
})

if (process.argv[1] && fs.realpathSync(process.argv[1]) === currentFilePath) {
  const { LAB3_TLS_KEY, LAB3_TLS_CERT, LAB3_DEMO_PASSWORD } = process.env;
  if (!LAB3_TLS_KEY || !LAB3_TLS_CERT) throw new Error('Укажите LAB3_TLS_KEY и LAB3_TLS_CERT');
  if (LAB3_DEMO_PASSWORD) {
    for (const user of users) {
      if (!setPassword(user.id, LAB3_DEMO_PASSWORD)) throw new Error('Некорректный LAB3_DEMO_PASSWORD');
    }
  }
  const credentials = { key: fs.readFileSync(LAB3_TLS_KEY), cert: fs.readFileSync(LAB3_TLS_CERT) };
  https.createServer(credentials, app).listen(1338, 'localhost', () => {
    console.log('API: https://localhost:1338');
  });

  const server = new WebSocketServer({
    port: 9999, host: 'localhost', maxPayload: 4096,
    verifyClient: ({ origin }) => !origin || localOrigin.test(origin),
  });
  server.on('connection', socket => {
    socket.on('error', () => socket.terminate());
    socket.on('message', (message, binary) => {
      if (binary) return;
      const text = message.toString();
      if (text === 'exit' || text.endsWith(': exit')) {
        socket.close();
        return;
      }
      for (const client of server.clients) {
        if (client.readyState === WebSocket.OPEN) client.send(text);
      }
    });
  });
}
