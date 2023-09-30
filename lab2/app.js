
const express = require('express');
const app = express();
const allBooks = require('./books.json');
const {log} = require("nodemon/lib/utils"); // Подключение JSON-файла с данными о книгах
const bodyParser = require('body-parser');
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
      // Сортировка по полю "в наличии"
      sortedBooks = sortedBooks.sort((a, b) => {
        if (a.status === 'В наличии' && b.status !== 'В наличии') {
          return -1;
        } else if (a.status !== 'В наличии' && b.status === 'В наличии') {
          return 1;
        }
        return 0;
      });
    } else if (req.query.sort === 'returnDate') {
      // Сортировка по полю "дата возврата"

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

app.use(bodyParser.json());
app.post('/addBook', (req, res) => {
  const { title, author, receiptDate, status, returnDate, takenBy } = req.body;
  // Находим последнюю книгу в массиве allBooks
  const lastBook = allBooks[allBooks.length - 1];

  // Генерируем новый ID, увеличивая последний ID на 1
  const newBookId = lastBook ? lastBook.id + 1 : 1;

  // Создаем новую книгу
  const newBook = {
    id: newBookId,
    title,
    author,
    receiptDate,
    status,
    returnDate,
    takenBy
  };

  // Добавляем новую книгу в массив allBooks
  allBooks.push(newBook);

  console.log(newBook)

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
  const updatedBookData = req.body; // Получаем данные из формы

  if (!editBook) {
    res.status(404).send('Книга не найдена');
  } else {
    res.render('bookEdit', { editBook }); // Передаем editBook в шаблон
  }

});


app.post('/edit/:bookId', (req, res) => {
  const bookId = req.params.bookId - 1;
  const updatedBookData = req.body; // Получаем данные из формы

  allBooks[bookId] = {
    ...allBooks[bookId],
    ...updatedBookData
  }

  res.redirect(`/view/${bookId + 1}`);
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

app.listen(1337, () => {
  console.log('Server is running on 1337');
})