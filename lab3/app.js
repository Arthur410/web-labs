import express from 'express'
import bodyParser from "body-parser";
import path from "path";
import cors from "cors";
import fs from "fs";
import * as https from 'https'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const privateKey  = fs.readFileSync('./example.key', 'utf8');
const certificate = fs.readFileSync('./example.csr', 'utf8');

const credentials = {key: privateKey, cert: certificate};

const app = express();
app.use(cors());

const users = [
  {
    id: 1,
    name: "Артур Иванов",
    birthdate: "06.12.2002",
    email: "arthur.commercial@mail.ru",
    photoUrl: "https://i.imgur.com/8B8ye29.jpeg",
    role: "admin",
    status: "active",
    friends: [
      {
        name: "Мария Петрова",
        news: ["Сегодня натянула верстку на WordPress!", "Остальное время отдыхала."]
      },
      {
        name: "Алексей Сидоров",
        news: ["Устроил гонки на машинках hotweels с Артуром.", "Пиццу приготовил, очень вкусная!"]
      }
    ]
  },
  {
    id: 2,
    name: "Мария Петрова",
    birthdate: "15.03.1985",
    email: "maria@example.com",
    photoUrl: "https://i.imgur.com/Nrqih1V.jpeg",
    role: "user",
    status: "active",
    friends: [
      {
        name: "Артур Иванов",
        news: ["Посадил новые цветы на подоконнике", "Сегодня был на велосипедной прогулке"]
      },
      {
        name: "Анна Козлова",
        news: ["Нашла новые рецепты выпечки", "Сделала подарок на день рождения (себе)"]
      }
    ]
  },
  {
    id: 3,
    name: "Алексей Сидоров",
    birthdate: "20.07.1995",
    email: "alex@example.com",
    photoUrl: "https://i.imgur.com/x3NA3DN.jpeg",
    role: "user",
    status: "blocked",
    friends: [
      {
        name: "Артур Иванов",
        news: ["Занимаюсь поверхностями безье", "Начал заниматься спортом"]
      }
    ]
  },
  {
    id: 4,
    name: "Анна Козлова",
    birthdate: "10.11.1988",
    email: "anna@example.com",
    photoUrl: "https://i.imgur.com/zpGR0iF.jpeg",
    role: "user",
    status: "unconfirmed",
    friends: [
      {
        name: "Мария Петрова",
        news: ["Сегодня натянула верстку на WordPress!", "Остальное время отдыхала."]
      }
    ]
  }
];

const currentFileUrl = import.meta.url;
const currentFilePath = fileURLToPath(currentFileUrl);

const currentDirectory = dirname(currentFilePath);

app.set('view engine', 'pug');
app.set('views', join(currentDirectory, 'src/views'));

app.use(express.static(join(currentDirectory, 'src')));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.json());

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
  res.redirect(`${referer}web-labs/lab3/dist/users.html`);
});

app.get('/friends/:userId', (req, res) => {
  const userId = req.params.userId;
  const user = users.find(user => user.id === Number(userId));

  if (!user) {
    res.status(404).send('Пользователь не найден');
  } else {
    res.render('userFriends', { user });
  }
});

app.get('/friendsNews/:userId', (req, res) => {
  const userId = req.params.userId;
  const user = users.find(user => user.id === Number(userId));

  if (!user) {
    res.status(404).send('Пользователь не найден');
  } else {
    const friendsNews = user.friends.map(friend => ({
      name: friend.name,
      news: friend.news
    }));
    res.render('userFriendsNews', { friendsNews, user});
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

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(1338, () => {
  console.log('Server is running on 1338');
});