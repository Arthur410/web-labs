"use strict";

$(document).ready(function () {
  $.get('https://localhost:1338/api/users', function (users) {
    var roleMapping = {
      'admin': 'Админ',
      'user': 'Пользователь'
    };
    var statusMapping = {
      'unconfirmed': 'Не подтверждённый пользователь',
      'active': 'Активный',
      'blocked': 'Заблокированный'
    };
    var userContainer = $('.users');
    users.forEach(function (user) {
      // Create a user card div
      var userCard = $('<div>').addClass('user row bg-dark');

      // Create user photo div
      var userPhoto = $('<div>').addClass('user__photo col-3');

      // Create an image element
      var img = $('<img>').attr({
        src: user.photoUrl,
        alt: 'Фото пользователя'
      }).addClass('img-fluid').css('width', '100%');

      // Append the image to userPhoto
      userPhoto.append(img);

      // Create user info div
      var userInfo = $('<div>').addClass('user__info col-9 d-flex flex-column');

      // Create paragraphs for user info
      var paragraphs = ["\u0418\u043C\u044F: ".concat(user.name), "Email: ".concat(user.email), "\u0414\u0430\u0442\u0430 \u0440\u043E\u0436\u0434\u0435\u043D\u0438\u044F: ".concat(user.birthdate), "\u0420\u043E\u043B\u044C: ".concat(roleMapping[user.role]), "\u0421\u0442\u0430\u0442\u0443\u0441: ".concat(statusMapping[user.status])];
      paragraphs.forEach(function (text) {
        var p = $('<p>').text(text);
        userInfo.append(p);
      });

      // Create a div for the buttons
      var buttonsDiv = $('<div>').addClass('d-flex flex-column');

      // Create Edit button
      var editButton = $('<button>').addClass('btn-primary mt-2');
      var editLink = $('<a>').attr('href', "userEdit.html?userId=".concat(user.id)).text('Редактировать');
      editButton.append(editLink);

      // Create Friends button
      var friendsButton = $('<button>').addClass('btn-primary mt-2');
      var friendsLink = $('<a>').attr('href', "userFriends.html?userId=".concat(user.id)).text('Друзья');
      friendsButton.append(friendsLink);

      // Create Friends News button
      var friendsNewsButton = $('<button>').addClass('btn-primary mt-2');
      var friendsNewsLink = $('<a>').attr('href', "userFriendsNews.html?userId=".concat(user.id)).text('Новости друзей');
      friendsNewsButton.append(friendsNewsLink);

      // Append buttons to the buttonsDiv
      buttonsDiv.append(editButton);
      buttonsDiv.append(friendsButton);
      buttonsDiv.append(friendsNewsButton);

      // Append userPhoto, userInfo, and buttonsDiv to the userCard
      userCard.append(userPhoto);
      userCard.append(userInfo);
      userInfo.append(buttonsDiv); // Append buttonsDiv to userInfo

      // Append the userCard to the userContainer
      userContainer.append(userCard);
    });
  }).fail(function (error) {
    console.error(error);
  });
});