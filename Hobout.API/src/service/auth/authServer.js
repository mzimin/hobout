var oauth2orize = require('oauth2orize');
var passport = require('passport');
var crypto = require('crypto');
var AppModel = require('../../models/application');
var TokenModel = require('../../models/token');
var AuthCodeModel = require('../../models/authCode');
var UserModel = require('../../models/user');

var server = oauth2orize.createServer();

// Exchange username & password for access token.

server.grant(oauth2orize.grant.authorizationCode(function(client, redirectURI, user, ares, done) {

    var code = crypto.randomBytes(16).toString('base64');

    new AuthCodeModel({
        code: code,
        userId: user.id,
        clientId: client.id,
        redirectURI: redirectURI})
        .save(function(err, code) {
            if (err) {return done(err);}
            return done(null, code);
        });
}));

server.grant(oauth2orize.grant.token(function(client, user, ares, done) {

    var token = crypto.randomBytes(256).toString('base64');
    new TokenModel({
        token: token,
        userId: user.id,
        clientId: client.clientId })
        .save(function(err, token) {
            if (err) {return done(err);}
            return done(null, token);
        });

}));

server.exchange(oauth2orize.exchange.code(function(client, code, redirectURI, done) {
    AuthCodeModel.findOne({code: code}, function(err, authCode) {
        if (err) { return done(err); }
        if (client.id !== authCode.clientID) { return done(null, false); }
        if (redirectURI !== authCode.redirectURI) { return done(null, false); }

        var token = utils.uid(256);
        new TokenModel({
            value: token,
            code: authCode.code,
            userID: authCode.userId,
            clientId: authCode.clientId })
            .save(function(err, token) {
                if (err) { return done(err); }
                done(null, token);
            });
    });
}));


server.exchange(oauth2orize.exchange.password(function(client, username, password, scope, done) {

    //Validate the client
    AppModel.findOne({clientId: client.clientId}, function(err, clientapp) {
        if (err) { return done(err); }
        if(clientapp === null) {
            return done(null, false);
        }
        if(clientapp.secret !== client.clientSecret) {
            return done(null, false);
        }
        //Validate the user
        UserModel.findOne({email: username}, function(err, user) {
            if (err) { return done(err); }
            if(user === null) {
                return done(null, false);
            }
            if(password !== user.password) {
                return done(null, false);
            }
            //Everything validated, return the token
            var token = crypto.randomBytes(256).toString('base64');
            new TokenModel({
                token: token,
                userId: user.id,
                clientId: client.clientId})
                .save(function(err, token) {
                    if (err) { return done(err); }
                    done(null, token);
                });
        });
    });
}));


server.exchange(oauth2orize.exchange.clientCredentials(function(client, scope, done) {

    AppModel.findOne({ clientId: client.clientId}, function(err, clientapp) {
        if (err) { return done(err); }
        if(clientapp === null) {
            return done(null, false);
        }
        if(clientapp.secret !== client.secret) {
            return done(null, false);
        }
        var token = crypto.randomBytes(256).toString('base64');
        new TokenModel({
            token: token,
            clientId: client.clientId})
            .save(function(err, token) {
                if (err) { return done(err); }
                done(null, token);
            });
    });

}));


var login = {ensureLoggedIn: function(){
    console.dir(arguments);
    return function(req, res, next){
        return next();
    }
}};

module.exports.authorization = [
    login.ensureLoggedIn(),
    server.authorization(function(clientID, redirectURI, done) {
        AppModel.findOne({clentId:clientID}, function(err, client) {
            if (err) { return done(err); }
            if(client.redirectURI !== redirectURI){ return done(new Error("Wrong redirect URL provided"))};
            return done(null, client, redirectURI);
        });
    }),
    function(req, res){
        var html = ['<!doctype html><html><head>',
                '<meta charset="utf-8"><title>Page Title</title>',
                    '<meta name="description" content="Webpage for xxxx">',
                        '<link rel="stylesheet" href="css/reset/reset.css">',
                         '<p>this is login page stub</p>',
                        '</head><body></body></html>'].join();
        //res.render('dialog', { transactionID: req.oauth2.transactionID, user: req.user, client: req.oauth2.client });
        res.write(html);
    }
]

module.exports.decision = [
    login.ensureLoggedIn(),
    server.decision()
]


// token endpoint
//
// `token` middleware handles client requests to exchange authorization grants
// for access tokens.  Based on the grant type being exchanged, the above
// exchange middleware will be invoked to handle the request.  Clients must
// authenticate when making requests to this endpoint.

module.exports.token = [
    passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
    server.token(),
    server.errorHandler()
]
