import express from 'express'
import bodyParser from "body-parser";
import cors from "cors";
import fs from "fs";
import * as https from 'https'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import WebSocket, {WebSocketServer} from 'ws'

const rawData = fs.readFileSync('users.json');
const users = JSON.parse(rawData);

const privateKey  = fs.readFileSync('./example.key', 'utf8');
const certificate = fs.readFileSync('./example.csr', 'utf8');

const credentials = {key: privateKey, cert: certificate};

export const app = express();
app.use(cors());

const currentFileUrl = import.meta.url;
const currentFilePath = fileURLToPath(currentFileUrl);

const currentDirectory = dirname(currentFilePath);

app.set('view engine', 'pug');
app.set('views', join(currentDirectory, 'src/views'));

app.use(express.static(join(currentDirectory, 'src')));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(express.json());

app.get('/', (req, res) => {
  res.render('users', {users});
});

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.get('/edit/:userId', (req, res) => {
  const userId = req.params.userId;
  const editUser = users.find(user => user.id === Number(userId));
  const updatedUserData = req.body; // Получаем данные из формы
  console.log(editUser)
  if (!editUser) {
    res.status(404).send('Пользователь не найден');
  } else {
    res.render('userEdit', { editUser });
  }
});

app.post('/edit/:userId', (req, res) => {
  const userId = req.params.userId - 1;
  const updatedUserData = req.body;
  updatedUserData["birthdate"] = new Date(updatedUserData["birthdate"]).toLocaleDateString('ru-RU');

  users[userId] = {
    ...users[userId],
    ...updatedUserData
  }

  const referer = req.get('referer');

  // Redirect the user to the previous page
  res.redirect(`${referer}web-labs/lab3/dist/html/users.html`);
});

app.get('/friends/:userId', (req, res) => {
  const userName = req.params.userName;
  const user = users.find(user => user.name === userName);
  console.log(user)
  if (!user) {
    res.status(404).send('Пользователь не найден');
  } else {
    res.render('userFriends', { user });
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
    res.render('userView', { user });
  }
});

app.get('/api/userView/:userName', (req, res) => {
  const userName = req.params.userName;
  const user = users.find(user => user.name === userName);

  if (!user) {
    res.status(404).json({ error: 'Пользователь не найден' }); // Return an error JSON response
  } else {
    res.json(user); // Return the user object as JSON
  }
});

app.get('/api/user/:userId', (req, res) => {
  const userId = req.params.userId;
  const user = users.find(user => user.id === Number(userId));

  if (!user) {
    res.status(404).json({ error: 'Пользователь не найден' });
  } else {
    res.json(user);
  }
});

// ANGULAR INTERACTION
app.post('/api/users', (req res) => {
  const newUser = req.body;

  if (!newUser || typeof newUser !== 'object') {
    return res.status(400).json({ error: 'Invalid user #data' });
  }
  const userId = users.length + 1;

  users.push({
    id: userId,
    ...newUser
  });

  console.log(users)

  console.log(newUser)

  res.status(201).json({ message: 'User created successfully', user: { id: userId, ...newUser } });
});

// Express маршрут для аутентификации
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find((user) => user.email === email && user.password === password);

  console.log(user)

  if (user) {
    console.log('Успешно')
    // Успешная аутентификация
    res.json(user); // Возвращаем пользователя на клиентскую сторону
  } else {
    // Неуспешная аутентификация
    res.json({ success: false });
  }
});

app.post('/addNews/:userId', (req, res) => {
  const userId = req.params.userId;
  const user = users.find(user => user.id === Number(userId));

  if (!user) {
    res.status(404).send('Пользователь не найден');
  } else {
    const news = req.body.text;

    if (news) {
      user.news.push(news);
    } else {
      res.status(400).send('Новости не были предоставлены');
    }
  }
});

app.delete('/api/removeFriend/:userId/:friendName', (req, res) => {
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

app.post('/api/addFriend/:userId', (req, res) => {
  const userId = req.params.userId;
  const friendName = req.body.friend;

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
      const friendUser = users.find(u => u.name === friendName);
      if (friendUser) {
        friendUser.friends.push(user.name);
      }
    }
  }
});

app.get('/api/allNames', (req, res) => {
  const userNames = users.map(user => user.name);
  res.json(userNames);
});

app.delete('/api/user/:userId/delete-avatar', (req, res) => {
  const userId = req.params.userId;
  const user = users.find(user => user.id === Number(userId));

  if (!user) {
    return res.status(404).send('Пользователь не найден');
  }

  user.photoUrl = 'https://i.imgur.com/OJlZPI1.png';

  return res.status(200).json({ success: true, photoUrl: user.photoUrl });
});

app.post('/api/image-upload/:userId', (req,res) => {
  const userId = req.params.userId;
  const user = users.find(user => user.id === Number(userId));
  const imageUrl = req.body.image;
  if (!user) {
    return res.status(404).send('Пользователь не найден');
  }

  user.photoUrl = imageUrl;
  return res.status(200).json({ success: true, photoUrl: user.photoUrl });
})

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(1338, () => {
  console.log('Server is running on 1338');
});

const server = new WebSocketServer({ port: 9999 });

server.on('connection', ws => {
  ws.on('message', message => {
    if (message.toString().split(' ')[2] === 'exit') {
      ws.close()
    } else {
      server.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message.toString())
        }
      })
    }
  })
})