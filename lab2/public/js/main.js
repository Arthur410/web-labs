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

        books.innerHTML = '';
        data.forEach(book => {
          const booksItem = document.createElement('div');
          booksItem.classList.add('books_item')

          booksItem.innerHTML = `
            <span class="book_item-img"></span>
              <div class="spacer"></div>
              
              <p class="book_item-title">${book.title}</p>
              <div class="spacer"></div>
              
              <p class="book_item-title">${book.author}</p>
              <div class="spacer"></div>
              
              <p>${book.status}</p>
              <div class="spacer"></div>
              <p>Дата выпуска - ${book.receiptDate}</p>
              <div class="spacer"></div>
              
              ${book.returnDate ? `<p>Дата возврата - ${book.returnDate}</p><div class="spacer"></div>` : ``}
              <button class="books_item-more w3-button w3-khaki">
                    <a href="/view/${book.id}">Подробнее</a>          
              </button>
              <button class="books_item-delete w3-button w3-red" data-book-id=${book.id}>
                Удалить    
              </button>
          `;
          books.appendChild(booksItem);
        });

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
