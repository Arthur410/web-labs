"use strict";

$(document).ready(function () {
  var urlParams = new URLSearchParams(window.location.search);
  var userId = urlParams.get('userId');
  $.get("https://localhost:1338/api/user/".concat(userId), function (user) {
    // Check if the data was successfully fetched
    if (user) {
      // Set the page title
      $('title').text('Новости друзей');

      // Set the page header
      $('h1').text('Новости друзей пользователя ' + user.name);

      // Create a container for the friends' news
      var container = $('<div>').addClass('container');
      user.friends.forEach(function (friend) {
        console.log(friend);
        var friendContainer = $('<div>').addClass('friend-news-container');
        var friendHeading = $('<a>').text(friend).attr('href', "userView.html?userName=".concat(friend));
        var newsList = $('<ul>');
        $.get("https://localhost:1338/friendsNews/".concat(friend), function (news) {
          news.forEach(function (userNew) {
            var newsItem = $('<li>').text(userNew);
            newsList.append(newsItem);
          });
        });
        friendContainer.append(friendHeading, newsList);
        container.append(friendContainer);
      });
      $('body').append(container);
    } else {
      console.error('Failed to fetch user data');
    }
  });
});