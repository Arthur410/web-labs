
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.set('view engine', 'pug');
app.set('views', require('path').join(__dirname, 'src/views'));

app.use(express.static(__dirname + '/src'));

app.use(express.static('public'));
app.use(express.urlencoded({
  extended: true
}))
const users = require('./users.json'); // Путь к файлу с данными


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
  const updatedUserData = req.body; // Получаем данные из формы
  updatedUserData["birthdate"] = new Date(updatedUserData["birthdate"]).toLocaleDateString('ru-RU')
  users[userId] = {
    ...users[userId],
    ...updatedUserData
  }

  res.redirect(`/`);
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

app.get('/api/user/:userId', (req, res) => {
  const userId = req.params.userId;
  const user = users.find(user => user.id === Number(userId));

  if (!user) {
    res.status(404).json({ error: 'Пользователь не найден' });
  } else {
    res.json(user);
  }
});

app.listen(1338, () => {
  console.log('Server is running on 1338');
})