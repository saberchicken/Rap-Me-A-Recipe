var express = require('express');
var request = require('request');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var client_id = '4e9c3411c6944468b3aafb346a6f3ea0';
var client_secret = '92c4313b40d64bdabe7597eb2d00ce50';
var redirect_uri = 'http://localhost:8888/callback/';

var stateKey = 'spotify_auth_state';

var app = express();

var json = "";

var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};
app.use(express.static(__dirname + '/public')).use(cookieParser()).use(bodyParser.json());

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email user-read-playback-state';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {
  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var activeDevice;

        var options = {
          url: 'https://api.spotify.com/v1/me/player/devices',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          body.devices.forEach(function(element) {
            if (element.is_active == true) {
              activeDevice = element;

              res.redirect('/#' +
                querystring.stringify({
                  access_token: access_token,
                  refresh_token: refresh_token,
                  device_id: activeDevice.id
                }));
            }
          });
        });

      } else {
        res.redirect('/login' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});
var playAllSongs = async (function runThis() {
  access_token = "BQDD5fGnbn4tinX9u8oy8pVRtxZE4TINzNoNlQ8rNHy6BK2qvii3n9uRfDWXeOEH-k4eK7HVs-lA4SG0Pn5lrEKZVOk9hEMgTBD5v7rGa6PrCTl8GzsXv8r9ybvbjpcmCfnblzu_Bjkwan4vZEcwR3Y5axdziTiiZhkBi-PdidHgE1Y2Iys2vIG9RwVJSJoeNta-ptYVU8GxyKxwGTOgmntegap4rvhFZlaSEr858RA9BTC-yxddqddn0ESlzy4HZaKeoyexHYMqCPQTm_DP_aTZD6PUK1CRz9BhfFN1dh8LgVZ7Ba-7SnPKqg4u3lHukw";
  device_id = "028544928f36409f9fea78fc410396306b81dc08";

  var spotifyApi = new SpotifyWebApi();

  spotifyApi.setAccessToken(access_token);

  for (var i = 0; i < songs.length; i++) {
    var element = songs[i];
    console.log(element.id);

    setSong(element.id)
    await (sleep(800))
    seekSong(element.start)
    var timeout = parseInt(element.end) >= 0 ? parseInt(element.end) : 500
    await (sleep(2000 + timeout))
  }

  spotifyApi.pause({"device_id": device_id});
});
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
app.post('/input', async (function(req, res) {
  var songs = req.body;
  console.log(json);
  var access_token;
  var device_id;
  await(playAllSongs)
}));

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

console.log('Listening on 8888');
app.listen(8888);
