(function() {
  var player = function(songs) {
  var access_token;
  var device_id;

  (async function() {
    songs = JSON.parse(songs.split("+").join(""));

    access_token = "BQAMdd8zVYoNtZVXkRHGaSUQXygpRh49WNc6TGcT1p-mXQWYWvSNAQXrV8tIuUhAOC65A6xJnvRvLk7Npc5-Tb5dY6b8wmLZ6dUD3DQZzUMI5Jb_4OMmRh7mYngrPDyLHRXPoZl6RcQMbkpSf_2j14V88e_qBaxoYieZyaIg-Ho5bW2R903IjSznCOx02L0Xrk4-p05XKmKeJMEH05pLZBFCqJphqCXcRVTsUgWYi6_S51FeJZKvrhjY3YBmjHoI8vAAKv5eabgkMWQgI51N08PNC5cw2dYLFVHnAiktA4CHqXjs7lVV8UTxqCHUnssiTQ";
    device_id = "028544928f36409f9fea78fc410396306b81dc08";

    var spotifyApi = new SpotifyWebApi();

    spotifyApi.setAccessToken(access_token);

    for (var i = 0; i < songs.length; i++) {
      var element = songs[i];
      console.log(element.id);
      console.log(element.start);
      console.log(element.end);

      setSong(element.id)
      await sleep(800)
      seekSong(element.start)
      var timeout = parseInt(element.end) >= 0 ? parseInt(element.end) : 500
      await sleep(2000 + timeout)
    }

    spotifyApi.pause({"device_id": device_id});
  })();

  function setSong(id) {
    $.ajax({
      url: 'https://api.spotify.com/v1/me/player/play?device_id=' + device_id,
      data: '{"uris": ["spotify:track:' + id + '"]}',
      type: 'PUT',
      beforeSend: function(xhr) {
          xhr.setRequestHeader("Authorization", "Bearer " + access_token);
          xhr.setRequestHeader("Content-Type", "application/json");
      }
    })
  }

  function seekSong(time) {
    $.ajax({
      url: 'https://api.spotify.com/v1/me/player/seek?position_ms=' + time + '&device_id=' + device_id,
      type: 'PUT',
      beforeSend: function(xhr) {
          xhr.setRequestHeader("Authorization", "Bearer " + access_token);
      }
    })
  }

  function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }
}
})();