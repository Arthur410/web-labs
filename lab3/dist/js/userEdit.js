"use strict";

// Function to fetch user data based on userId from the URL
function fetchUserData() {
  // Get the userId from the URL query parameters
  var urlParams = new URLSearchParams(window.location.search);
  var userId = urlParams.get('userId');
  var previousUrl = document.referrer;

  // Check if userId is present in the URL
  if (!userId) {
    console.error('User ID not found in URL');
    return;
  }

  // Make an AJAX request to fetch user data
  $.get("https://localhost:1338/api/user/".concat(userId), function (editUser) {
    var form = document.createElement('form');
    form.setAttribute('action', "https://localhost:1338/edit/".concat(editUser.id));
    form.setAttribute('method', 'POST');
    form.classList.add('edit-form', 'flex-column', 'd-flex', 'bg');

    // Create label and input for 'name'
    var nameLabel = document.createElement('label');
    nameLabel.setAttribute('for', 'name');
    nameLabel.textContent = 'Название книги:';
    var nameInput = document.createElement('input');
    nameInput.setAttribute('type', 'text');
    nameInput.setAttribute('name', 'name');
    nameInput.setAttribute('id', 'name');
    nameInput.setAttribute('value', editUser.name);
    nameInput.setAttribute('placeholder', 'Введите имя');
    nameInput.classList.add('edit-input');
    form.appendChild(nameLabel);
    form.appendChild(nameInput);

    // Create label and input for 'email'
    var emailLabel = document.createElement('label');
    emailLabel.setAttribute('for', 'email');
    emailLabel.textContent = 'Почта:';
    var emailInput = document.createElement('input');
    emailInput.setAttribute('type', 'email');
    emailInput.setAttribute('name', 'email');
    emailInput.setAttribute('id', 'email');
    emailInput.setAttribute('value', editUser.email);
    emailInput.setAttribute('placeholder', 'Введите почту');
    emailInput.classList.add('edit-input');
    form.appendChild(emailLabel);
    form.appendChild(emailInput);

    // Create label and input for 'birthdate'
    var birthdateLabel = document.createElement('label');
    var formattedDate = editUser.birthdate.split('.').reverse().join('-');
    birthdateLabel.setAttribute('for', 'birthdate');
    birthdateLabel.textContent = 'Дата Рождения:';
    var birthdateInput = document.createElement('input');
    birthdateInput.setAttribute('type', 'date');
    birthdateInput.setAttribute('name', 'birthdate');
    birthdateInput.setAttribute('min', '1900-01-01');
    birthdateInput.setAttribute('max', "".concat(new Date().toJSON().slice(0, 10)));
    birthdateInput.setAttribute('id', 'birthdate');
    birthdateInput.setAttribute('placeholder', 'Введите дату рождения');
    birthdateInput.classList.add('edit-input');
    birthdateInput.setAttribute('value', formattedDate);
    form.appendChild(birthdateLabel);
    form.appendChild(birthdateInput);

    // Create label and select for 'role'
    var roleLabel = document.createElement('label');
    roleLabel.setAttribute('for', 'role');
    roleLabel.textContent = 'Роль пользователя:';
    var roleSelect = document.createElement('select');
    roleSelect.setAttribute('name', 'role');
    roleSelect.setAttribute('id', 'role');
    var roleOptions = ['admin', 'user'];
    roleOptions.forEach(function (optionValue) {
      var option = document.createElement('option');
      option.setAttribute('value', optionValue);
      if (editUser.role === optionValue) {
        option.setAttribute('selected', 'selected');
      }
      option.textContent = optionValue === 'admin' ? 'Администратор' : 'Пользователь';
      roleSelect.appendChild(option);
    });
    form.appendChild(roleLabel);
    form.appendChild(roleSelect);

    // Create label and select for 'status'
    var statusLabel = document.createElement('label');
    statusLabel.setAttribute('for', 'status');
    statusLabel.textContent = 'Статус пользователя:';
    var statusSelect = document.createElement('select');
    statusSelect.setAttribute('name', 'status');
    statusSelect.setAttribute('id', 'status');
    var statusOptions = ['unconfirmed', 'active', 'blocked'];
    statusOptions.forEach(function (optionValue) {
      var option = document.createElement('option');
      option.setAttribute('value', optionValue);
      if (editUser.status === optionValue) {
        option.setAttribute('selected', 'selected');
      }
      option.textContent = optionValue === 'unconfirmed' ? 'Не подтверждённый пользователь' : optionValue === 'active' ? 'Активный' : 'Заблокированный';
      statusSelect.appendChild(option);
    });
    form.appendChild(statusLabel);
    form.appendChild(statusSelect);

    // Create submit button
    var submitButton = document.createElement('button');
    submitButton.setAttribute('type', 'submit');
    submitButton.setAttribute('style', 'max-width: fit-content; cursor: pointer; transition: all .2s linear;');
    submitButton.classList.add('btn-success');
    submitButton.textContent = 'Сохранить изменения';
    console.log(previousUrl);
    form.style.padding = '15px';
    form.appendChild(submitButton);

    // Append the form to the document body or a container element
    document.querySelector('.container').appendChild(form);
  }).fail(function (error) {
    console.error('Error fetching user data:', error);
  });
}

// Call the fetchUserData function when the document is ready
$(document).ready(function () {
  fetchUserData();
});