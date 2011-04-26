var sys     = require('sys');
var http    = require('http');
var url     = require('url');
var fs      = require('fs');
var path    = require('path');
var util    = require('util');
var qs      = require('querystring');
var auth    = require('./lib/oauth');


http.createServer(function(req, res) {
    var uri = url.parse(req.url).pathname;
    var rs;

    if (req.method == 'GET') {

        if (uri == '/') {

            rs = fs.createReadStream(__dirname + "/daisy_template.html");
            res.writeHead(200, {'Content-Type': 'text/html'});
            util.pump(rs, res);
        }

        else if (uri == '/oauth/callback') {
            res.end();
            //auth.getAccessToken(res);
        }
        else if (uri.match(/\.\w{2,4}$/)) {
            // Static files dispatcher
            var get_content_type = function() {
                var mimetype = {
                    'css': "text/css",
                    'js': "application/x-javascript",
                    'woff': "font/opentype"
                };

                try {
                    return mimetype[uri.match(/\.(\w{2,4})$/)[1]];
                }
                catch (e){
                    return "text/plain";
                }
            }

            var filename = path.join(process.cwd(), uri);
            path.exists(filename, function(exists) {
                if (!exists) {
                    res.writeHead(404, {'Content-Type': 'text/plain'});
                    res.end("404 Error - Not Found\n");
                    return;
                }

                res.writeHead(200, {
                        'Content-Type' : get_content_type()
                });

                rs = fs.createReadStream(filename);
                util.pump(rs, res);
            });
        }
        else {
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.end("404 Error - Not Found\n");
            return;
        }
    }
    else if (uri == '/twitter_share') {
        var post_data = "";

        req.on('data', function(data) {
            post_data += data;
        });

        req.on('end', function() {
            auth.getRequestToken(res, qs.parse(post_data));
        });

    }
    else {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end("404 Error - Not Found\n");
        return;
    }

}).listen(8080);

console.log("Daisy HTTP Server STARTED on http://127.0.0.1:8080");
