var OAuth   = require('oauth').OAuth;
var sqlite  = require('sqlite');
var db      = new sqlite.Database();
var db_path = __dirname + "/../db/tokens.db";
var fs      = require('fs');
var config  = JSON.parse(fs.readFileSync(__dirname + "/../config.json", "utf-8"));

var auth = new OAuth
("http://api.twitter.com/oauth/request_token",
 "http://api.twitter.com/oauth/access_token",
 config.twitterConsumerKey,  config.twitterConsumerSecret,
 "1.0", "http://127.0.0.1:8080/oauth/callback", "HMAC-SHA1");

exports.getRequestToken = function(res, post_data) {
    var message = post_data.message;
    var petals = post_data.petals;
    var radius = post_data.radius;

    db.open(db_path, function(error) {
        if (error) {
            console.log(error);
            throw error;
        }
        db.executeScript
        ("CREATE TABLE IF NOT EXISTS request_token (id INTEGER PRIMARY KEY autoincrement," +
         "oauth_token VARCHAR(43) NOT NULL," +
         "oauth_token_secret VARCHAR(84) NOT NULL," +
         "message TEXT NOT NULL," +
         "petals INTEGER NOT NULL," +
         "radius INTEGER NOT NULL)"
        , function(error) {
              if (error) {
                  console.log(error);
                  throw error;
              }
        });
    });

    auth.getOAuthRequestToken(function(error, request_token, request_token_secret, results) {
        if (error) {
            console.log(error);
            throw error;
        }
        else {
            db.execute
            ("INSERT INTO request_token (oauth_token, oauth_token_secret, message, petals, radius) VALUES (?, ?, ?, ?, ?)"
            , [request_token, request_token_secret, message, petals, radius]
            , function(error, rows) {
                if (error) {
                    console.log(error);
                    throw error;
                }
            });

            //res.writeHead(301, {
            //        'Location': 'https://twitter.com/oauth/authenticate?oauth_token=' + request_token
            //});
            //res.end();
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end("https://twitter.com/oauth/authenticate?oauth_token=" + request_token);
        }
    });
};

exports.getAccessToken = function(res) {
    var oauth_token = url.parse(req.url).query.split("&")[0].split("=")[1];
    var oauth_verifier = url.parse(req.url).query.split("&")[1].split("=")[1];
    db.open(db_path, function(error) {
        if (error) {
            console.log(error);
            throw error;
        }
    });

    var oauth_secret = db.execute
    ("SELECT oauth_token_secret FROM request_token WHERE oauth_token = (?)"
    , [oauth_token]
    , function(error, rows) {
        if (error) {
            console.log(error);
            throw error;
        }
    });

    var message = db.execute
    ("SELECT message FROM request_token WHERE oauth_token = (?)"
    ,[oauth_token]
    , function(error, rows) {
        if (error) {
            console.log(error);
            throw error;
        }
    });

    auth.getOAuthAccessToken(oauth_token, oauth_secret, oauth_verifier,
          function(error, oauth_access_token, oauth_access_token_secret, results){
            if (error) {
                console.log(error);
                throw error;
            }

            console.log(sys.inspect(results));

            // Get Friends timeline
            // auth.get("http://api.twitter.com/1/statuses/friends_timeline.json", oauth_access_token, oauth_access_token_secret, function(error, data) {
            //    res.writeHead(200, {'Content-Type': 'text/html'});
            //    res.write('<h1>' + results.screen_name + ' \'s friends: </h1>');
            // });

            // Tweet
            auth.post("http://api.twitter.com/1/statuses/update.json", oauth_access_token, oauth_access_token_secret,
                {status: message}, function(error, data) {
                if (error) {
                    console.log(error);
                    throw error;
                }
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.end(data);
            });
    });
};
