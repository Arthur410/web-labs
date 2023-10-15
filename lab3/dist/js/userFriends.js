"use strict";

$(document).ready(function () {
  var urlParams = new URLSearchParams(window.location.search);
  var userId = urlParams.get('userId');
  $.get("https://localhost:1338/api/user/".concat(userId), function (user) {
    if (user) {
      $('h1').text('Список друзей пользователя ' + user.name);
      var ul = $('<ul>');

      // Loop through the user's friends and create list items with links
      user.friends.forEach(function (friend) {
        var li = $('<li>');
        var link = $('<a>').attr('href', "userView.html?userName=".concat(friend)).addClass('text-white').text(friend);
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