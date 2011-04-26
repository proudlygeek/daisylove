var http = require('http');
var https = require('https');

var crypto = require('crypto');

exports.hello_world = function() {
    return "Hello World!";
}


exports.authorize = function() {

    function encode(toEncode) {
        if( toEncode == null || toEncode == "" ) return ""
        else {
            var result= encodeURIComponent(toEncode);
            // Fix the mismatch between OAuth's  RFC3986's and Javascript's beliefs in what is right and wrong ;)
            return result.replace(/\!/g, "%21")
                   .replace(/\'/g, "%27")
                   .replace(/\(/g, "%28")
                   .replace(/\)/g, "%29")
                   .replace(/\*/g, "%2A");
        }
    }

    function get_nonce() {
        var result = [];
        var chars = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n',
              'o','p','q','r','s','t','u','v','w','x','y','z','A','B',
              'C','D','E','F','G','H','I','J','K','L','M','N','O','P',
              'Q','R','S','T','U','V','W','X','Y','Z','0','1','2','3',
              '4','5','6','7','8','9'];
        var char_pos;
        var nonce_chars_length= chars.length;

        for (var i = 0; i < 32; i++) {
            char_pos= Math.floor(Math.random() * nonce_chars_length);
            result[i]=  chars[char_pos];
        }
        return result.join('');
    }

    function join_params(params) {
        var results = [];
        for (var k in params) {
            results.push(encode(k) + "%3D" + encode(params[k]));
        }

        return results.join("%26");
    }

    function stringify(params) {
        var keys = ['oauth_callback',
                    'oauth_consumer_key',
                    'oauth_nonce',
                    'oauth_signature_method',
                    'oauth_timestamp',
                    'oauth_version',
                    'oauth_signature'];

        var res = [];
        for (var i = 0; i < keys.length; i++) {
            res.push(keys[i] + "=\"" + params[keys[i]] + "\"");
        }
        return "OAuth " + res.join(",");
    };

    var http_method = "POST";
    var base_uri = "https://api.twitter.com/oauth/request_token";

    var consumer_secret = "RZSDhMWttsmro3EQ6TOZjtBdiNTxmzHR1Zkjhacw";
    var oauth_token_secret;
    var signing_key = encode(consumer_secret) + "&" +
        encode(oauth_token_secret || '');


    console.log('Signing key: ' + signing_key);

    var params = {
        'oauth_callback': "http://localhost:8080/oauth/callback/",
        'oauth_consumer_key': "RkBNEGoXxKDRkw7WzTDg",
        'oauth_nonce': get_nonce(),
        'oauth_signature_method': "HMAC-SHA1",
        'oauth_timestamp': parseInt(Date.now().toString().slice(0,-3)),
        'oauth_version': "1.0A"
    };

//    var params = {
//        'oauth_callback': "http://localhost:3005/the_dance/process_callback?service_provider_id=11",
//        'oauth_consumer_key': "GDdmIQH6jhtmLUypg82g",
//        'oauth_nonce': "QP70eNmVz8jvdPevU3oJD2AfF7R7odC2XJcn4XlZJqk",
//        'oauth_signature_method': "HMAC-SHA1",
//        'oauth_timestamp': 1272323042,
//        'oauth_version': "1.0"
//    };

    var base_signature = http_method + "&" +
        encode(base_uri) + "&" +
        join_params(params);

    console.log('base_signature: ' + base_signature);

    var hmac_key = crypto.createHmac('sha1', signing_key);

    hmac_key.update(base_signature);

    params.oauth_signature = hmac_key.digest('base64');


    console.log("OAuth signature: " + params.oauth_signature);

    var options = {
            'Method': "POST",
            'Path': "/oauth/request_token",
            'Authorization': stringify(params),
            'Host': "api.twitter.com",
            'Port': 80,
            'Accept': '*/*',
            'Connection': 'close',
            'User-Agent': 'Node authentication',
            'Content-length': 0,
            'Content-Type': 'application/x-www-form-urlencoded'
    };

//    var options = {
//        host: "127.0.0.1",
//        port: "4567",
//        path: "/",
//        headers: {
//            'Authorization': params
//        }
//    }

    //console.log(options)

     var client = http.createClient(80, 'api.twitter.com');

//    http.request(options, function(res) {
//        "statusCode: " + res.statusCode;
//        console.log(res.headers);
//    }).end();
    client.request('POST',"/oauth/request_token", {
            'Authorization': stringify(params),
            'Host': 'api.twitter.com',
            'Accept': '*/*',
            'Connection': 'close',
            'User-Agent': 'Node authentication',
            'Content-length': 0,
            'Content-Type': 'application/x-www-form-urlencoded'
    }).end();
}
