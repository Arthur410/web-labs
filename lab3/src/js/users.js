$(document).ready(function() {
  // Функция для создания HTML-шаблона для пользователя
  function createUserCard(user) {
    return `
    <div class="mb-3 bg-dark p-2 rounded">
      <div class="user row">
        <div class="user__photo col-3">
          <img src="${user.photoUrl}" alt="Фото пользователя" class="img-fluid" style="width:100%">
        </div>
        <div class="user__info col-9 d-flex flex-column">
          <p>Имя: ${user.name}</p>
          <div class="mt-2">
            <p>Email: ${user.email}</p>
          </div>
          <div class="mt-2">
            <p>Дата рождения: ${user.birthdate}</p>
          </div>
          <div class="mt-2">
            <p>Роль: ${user.role}</p>
          </div>
          <div class="mt-2">
            <p>Статус: ${user.status}</p>
          </div>
          <div class="mt-2">
            <button class="btn btn-primary">
              <a href="/edit/${user.id}">Редактировать</a>
            </button>
          </div>
          <div class="mt-2">
            <button class="btn btn-primary">
              <a href="/friends/${user.id}">Друзья</a>
            </button>
          </div>
          <div class="mt-2">
            <button class="btn btn-primary">
              <a href="/friendsNews/${user.id}">Новости друзей</a>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  }


  // Функция для загрузки и отображения пользователей
  function loadUsers() {
    $.ajax({
      url: '/api/users', // Замените на правильный путь к вашему API для получения пользователей
      method: 'GET',
      success: function(users) {
        // Обработка успешного ответа
        // Очищаем контейнер .users перед добавлением новых пользователей
        $('.users').empty();

        // Создаем и добавляем HTML-шаблоны для каждого пользователя
        users.forEach(function(user) {
          const userCardHTML = createUserCard(user);
          $('.users').append(userCardHTML);
        });
      },
      error: function(error) {
        console.error('Ошибка при загрузке пользователей:', error);
      }
    });
  }

  // Вызываем функцию для загрузки и отображения пользователей при загрузке страницы
  loadUsers();
});
