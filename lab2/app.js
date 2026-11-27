
const express = require('express');
const app = express();
// Подключение JSON-файла с данными о книгах
const allBooks = require('./books.json');
let nextBookId = Math.max(0, ...allBooks.map(book => book.id)) + 1;
app.set('view engine', 'pug');

app.use(express.static('public'));
app.use(express.urlencoded({
  extended: true
}))


app.get('/', (req, res) => {
  res.render('mainLayout', { allBooks: allBooks}); // Отправляем отсортированный список книг в Pug-шаблон
});

app.get('/api/books', (req, res) => {
  let sortedBooks = [...allBooks]; // Создаем копию массива книг для сортировки
  if (req.query.sort) {
    if (req.query.sort === 'availability') {
      sortedBooks = sortedBooks.sort((a, b) => {
        if (a.status === 'В наличии' && b.status !== 'В наличии') {
          return -1;
        } else if (a.status !== 'В наличии' && b.status === 'В наличии') {
          return 1;
        }
        return 0;
      });
    } else if (req.query.sort === 'returnDate') {
      sortedBooks = sortedBooks.sort((a, b) => {
        if (a.returnDate && b.returnDate) {
          return Date.parse(a.returnDate) - Date.parse(b.returnDate)
        } else if (a.returnDate) {
          return 1;
        } else if (b.returnDate) {
          return -1;
        }
        return 0;
      });
    }
  }

  res.json(sortedBooks); // Отправляем отсортированный список книг в формате JSON
});

app.use(express.json());

const editableFields = ['title', 'author', 'receiptDate', 'status', 'returnDate', 'takenBy'];

function readBookFields(body) {
  if (!body || typeof body !== 'object') return {};
  return Object.fromEntries(editableFields
    .filter(field => typeof body[field] === 'string')
    .map(field => [field, body[field].trim()]));
}

app.post('/addBook', (req, res) => {
  const fields = readBookFields(req.body);
  if (!fields.title || !fields.author) return res.status(400).send('Укажите название и автора');

  // Генерируем ID независимо от позиции книги в массиве.
  allBooks.push({ ...fields, id: nextBookId++ });

  // Отправляем ответ клиенту (например, перенаправляем на главную страницу)
  res.redirect('/');
});



app.get('/view/:bookId', (req, res) => {
  const bookId = req.params.bookId;

  // Ищем книгу по bookId в массиве allBooks
  const concreteBook = allBooks.find(book => book.id === Number(bookId));

  if (!concreteBook) {
    // Если книга с заданным bookId не найдена, можно обработать эту ситуацию
    res.status(404).send('Книга не найдена');
  } else {
    // Отправляем информацию о книге в Pug-шаблон
    res.render('bookView', { concreteBook });
  }
});

app.get('/edit/:bookId', (req, res) => {
  const bookId = req.params.bookId;
  const editBook = allBooks.find(book => book.id === Number(bookId));

  if (!editBook) {
    res.status(404).send('Книга не найдена');
  } else {
    res.render('bookEdit', { editBook }); // Передаем editBook в шаблон
  }

});


app.post('/edit/:bookId', (req, res) => {
  const bookId = Number(req.params.bookId);
  const book = allBooks.find(book => book.id === bookId);
  if (!book) return res.status(404).send('Книга не найдена');

  const fields = readBookFields(req.body);
  if (fields.title === '' || fields.author === '') return res.status(400).send('Укажите название и автора');
  Object.assign(book, fields);
  res.redirect(`/view/${bookId}`);
});

app.delete('/api/books/:bookId', (req, res) => {
  const bookId = req.params.bookId;

  // Найдите книгу в массиве allBooks по ID и удалите ее
  const bookIndex = allBooks.findIndex(book => book.id === Number(bookId));

  if (bookIndex === -1) {
    res.status(404).send('Книга не найдена');
  } else {
    // Удалите книгу из массива
    allBooks.splice(bookIndex, 1);
    res.status(200).send('Книга успешно удалена');
  }
});

if (require.main === module) {
  app.listen(1337, '127.0.0.1', () => {
    console.log('Server is running on 1337');
  });
}

module.exports = app;
