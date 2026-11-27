document.addEventListener('DOMContentLoaded', () => {
  const sortButtons = document.querySelectorAll('.sort-button');
  const addBookButton = document.querySelector('.add-book');

  const dialog = document.querySelector('.dialog');
  const dialogForm = document.querySelector('.dialog__form');
  const dialogClose = document.querySelector('.dialog__close');
  const dialogSubmit = document.querySelector('.dialog__submit')
  const books = document.querySelector('.books');

  async function updateInterface(url) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();

        const cards = data.map(book => {
          const card = document.createElement('div');
          card.className = 'books_item';
          const append = (tag, className = '', text = '') => {
            const element = document.createElement(tag);
            element.className = className;
            element.textContent = text;
            card.appendChild(element);
            return element;
          };
          append('span', 'book_item-img');
          const fields = [
            ['book_item-title', book.title],
            ['book_item-title', book.author],
            ['', book.status],
            ['', 'Дата выпуска - ' + book.receiptDate],
          ];
          if (book.returnDate) fields.push(['', 'Дата возврата - ' + book.returnDate]);
          for (const [className, value] of fields) {
            append('div', 'spacer');
            append('p', className, value);
          }
          append('div', 'spacer');
          const details = append('a', 'books_item-more w3-button w3-khaki', 'Подробнее');
          details.href = '/view/' + encodeURIComponent(book.id);
          const remove = append('button', 'books_item-delete w3-button w3-red', 'Удалить');
          remove.type = 'button';
          remove.dataset.bookId = book.id;
          return card;
        });
        books.replaceChildren(...cards);

      } else {
        console.error('Ошибка при выполнении запроса');
      }
    } catch (error) {
      console.error('Ошибка при выполнении запроса', error);
    }
  }

  sortButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      const sortType = event.target.dataset.sortType;
      const url = `/api/books?sort=${sortType}`;
      updateInterface(url);
    });
  });

  books.addEventListener('click', (event) => {
    if (event.target.classList.contains('books_item-delete')) {
      const isDelete = confirm('Вы уверены?')
      if (!isDelete) return;

      const bookId = event.target.dataset.bookId;
      const deleteUrl = `/api/books/${bookId}`;

      fetch(deleteUrl, {
        method: 'DELETE',
      }).then(response => {
        if (response.ok) {
          const updatedBooksUrl = `/api/books`;
          updateInterface(updatedBooksUrl);
        } else {
          console.error('Ошибка при выполнении запроса');
        }
      }).catch(error => {
        console.error('Ошибка при выполнении запроса', error);
      });
    }
  });

  addBookButton.addEventListener('click', () => {
    dialog.showModal()
    dialog.style.display = 'flex';
  })

  dialogForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Предотвращаем отправку формы по умолчанию

    const formData = new FormData(dialogForm);
    const formDataObject = {};
    for (const [key, value] of formData.entries()) {
      formDataObject[key] = value;
    }
    formDataObject['status'] = 'В наличии'
    formDataObject['returnDate'] = null
    formDataObject['takenBy'] = null

    try {
      const response = await fetch('/addBook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Устанавливаем заголовок для JSON данных
        },
        body: JSON.stringify(formDataObject), // Передаем данные формы в теле запроса
      });

      if (response.ok) {
        alert('Данные успешно отправлены.');
        // Обработайте успешный ответ (например, закройте диалоговое окно)
        dialog.close();
        dialog.style.display = 'none';
        updateInterface('/api/books')
      } else {
        console.error('Ошибка при выполнении запроса');
      }
    } catch (error) {
      console.error('Ошибка при выполнении запроса', error);
    }
  });

  dialogClose.addEventListener('click', () => {
    dialog.close();
    dialog.style.display = 'none';

  })
});
