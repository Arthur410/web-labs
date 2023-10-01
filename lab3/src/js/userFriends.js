$(document).ready(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('userId');

  $.get(`https://localhost:1338/api/user/${userId}`, function (user) {
    if (user) {
      $('h1').text('Список друзей пользователя ' + user.name);

      const ul = $('<ul>');

      // Loop through the user's friends and create list items with links
      user.friends.forEach(function (friend) {
        const li = $('<li>');
        const link = $('<a>')
          .attr('href', `userView.html?userName=${friend.name}`)
          .addClass('text-white')
          .text(friend.name);
        li.append(link);
        ul.append(li);
      });

      // Append the list to the container
      $('.container').append(ul);
    } else {
      // Handle error when user data cannot be fetched
      console.error('Failed to fetch user data');
    }
  });
});