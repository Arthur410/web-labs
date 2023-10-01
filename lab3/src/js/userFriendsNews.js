$(document).ready(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('userId');

  $.get(`https://localhost:1338/api/user/${userId}`,function (user) {
    // Check if the data was successfully fetched
    if (user) {
      // Set the page title
      $('title').text('Новости друзей');

      // Set the page header
      $('h1').text('Новости друзей пользователя ' + user.name);

      // Create a container for the friends' news
      const container = $('<div>').addClass('container');

      // Loop through the user's friends
      user.friends.forEach(function (friend) {
        // Create a container for each friend
        const friendContainer = $('<div>').addClass('friend-news-container');

        // Create a heading for the friend's name
        const friendHeading = $('<a>')
          .text(friend.name)
          .attr('href', `userView.html?userName=${friend.name}`);

        // Create an unordered list for the friend's news
        const newsList = $('<ul>');

        // Loop through the news items for the friend
        friend.news.forEach(function (news) {
          const newsItem = $('<li>').text(news);
          newsList.append(newsItem);
        });

        friendContainer.append(friendHeading, newsList);
        container.append(friendContainer);
      });

      // Append the container to the body
      $('body').append(container);
    } else {
      // Handle error when user data cannot be fetched
      console.error('Failed to fetch user data');
    }
  });
});





