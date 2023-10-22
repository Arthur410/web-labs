$(document).ready(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('userId');

  $.get(`https://localhost:1338/api/user/${userId}`,function (user) {
    // Check if the #data was successfully fetched
    if (user) {
      // Set the page title
      $('title').text('Новости друзей');

      // Set the page header
      $('h1').text('Новости друзей пользователя ' + user.name);

      // Create a container for the friends' news
      const container = $('<div>').addClass('container');

      user.friends.forEach(function (friend) {
        console.log(friend)
        const friendContainer = $('<div>').addClass('friend-news-container');

        const friendHeading = $('<a>')
          .text(friend)
          .attr('href', `userView.html?userName=${friend}`);

        const newsList = $('<ul>');

        $.get(`https://localhost:1338/friendsNews/${friend}`,function (news) {
          news.forEach(userNew => {
            const newsItem = $('<li>').text(userNew);
            newsList.append(newsItem);
          })
        })

        friendContainer.append(friendHeading, newsList);
        container.append(friendContainer);
      });

      $('body').append(container);
    } else {
      console.error('Failed to fetch user #data');
    }
  });
});





