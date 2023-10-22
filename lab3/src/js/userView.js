$(document).ready(function () {
  // Get userId from the URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const userName = urlParams.get('userName');
  // Fetch user #data from the API
  console.log(`https://localhost:1338/api/userView/${userName}`)
  $.get(`https://localhost:1338/api/userView/${userName}`, function (user) {
    // Check if the #data was successfully fetched
    if (user) {
      const userContainer = $('.user__info');
      const roleMapping = {'admin': 'Админ', 'user': 'Пользователь'};
      const statusMapping = {
        'unconfirmed': 'Не подтверждённый пользователь',
        'active': 'Активный',
        'blocked': 'Заблокированный'
      };

      // Create a user card div
      const userCard = $('<div>').addClass('user row bg-dark');

      // Create user photo div
      const userPhoto = $('<div>').addClass('user__photo col-3');

      // Create an image element
      const img = $('<img>').attr({
        src: user.photoUrl,
        alt: 'Фото пользователя',
      }).addClass('img-fluid').css('width', '100%');

      // Append the image to userPhoto
      userPhoto.append(img);

      // Create user info div
      const userInfo = $('<div>').addClass('user__info col-9 d-flex flex-column');

      // Create paragraphs for user info
      const paragraphs = [
        `Имя: ${user.name}`,
        `Email: ${user.email}`,
        `Дата рождения: ${user.birthdate}`,
        `Роль: ${roleMapping[user.role]}`,
        `Статус: ${statusMapping[user.status]}`,
      ];

      paragraphs.forEach(text => {
        const p = $('<p>').text(text);
        userInfo.append(p);
      });

      // Create a div for the buttons
      const buttonsDiv = $('<div>').addClass('d-flex flex-column');

      // Create Edit button
      const editButton = $('<button>').addClass('btn-primary mt-2');
      const editLink = $('<a>').attr('href', `userEdit.html?userId=${user.id}`).text('Редактировать');
      editButton.append(editLink);

      // Create Friends button
      const friendsButton = $('<button>').addClass('btn-primary mt-2');
      const friendsLink = $('<a>').attr('href', `userFriends.html?userId=${user.id}`).text('Друзья');
      friendsButton.append(friendsLink);

      // Create Friends News button
      const friendsNewsButton = $('<button>').addClass('btn-primary mt-2');
      const friendsNewsLink = $('<a>').attr('href', `userFriendsNews.html?userId=${user.id}`).text('Новости друзей');
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

      // Set friends information
      const friendsList = user.friends.map(friend => `<li><a href="userView.html?userName=${friend}">${friend}</a></li>`).join('');
      $('.user__friends').html(`<ul>${friendsList}</ul>`);
      // acc.push(`<ul><a href="userView.html?userName=${friend}">${friend}</a><ul>${newsItems}</ul></ul>`);
      let newsList = '';

      // Set friends news information
      user.friends.forEach(async friend => {
        await $.get(`https://localhost:1338/friendsNews/${friend}`,function (news) {
          news.forEach(userNew => {
            newsList += `<li>${userNew}</li>`
          })

          const friendsNewsList = `<ul><a href="userView.html?userName=${friend}">${friend}</a><ul>${newsList}</ul></ul>`
          $('.user__friendsNews').append(friendsNewsList)
          newsList = '';
        })
      });
    } else {
      // Handle error when user #data cannot be fetched
      console.error('Failed to fetch user #data');
    }
  });
});
