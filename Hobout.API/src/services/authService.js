var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var ClientPasswordStrategy  = require('passport-oauth2-client-password').Strategy;
var oauth2orize = require('oauth2orize');
var __ = require('../infrastructure/util');
var AppModel = require('../models/application');
var TokenModel = require('../models/token');
var AuthCodeModel = require('../models/authCode');
var UserModel = require('../models/user');

var APP_ID = process.env.APP_ID || '1406370232936920';
var APP_SECRET = process.env.APP_SECRET || 'e9bd1dd07c6d702c8c4f0bc6bdb33681';
var FB_CALLBACK = process.env.FB_CALLBACK || 'http://local.hobout.com/auth/facebook/callback';

var server = oauth2orize.createServer();

server.grant(oauth2orize.grant.authorizationCode(function(client, redirectURI, user, ares, done) {

    var code = __.randomKey(16);

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

    var token = __.randomKey(256);
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

        var token = __.randomKey(256);
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

    AppModel.findOne({clientId: client.clientId}, function(err, clientapp) {
        if (err) { return done(err); }
        if(clientapp === null) {
            return done(null, false);
        }
        if(clientapp.secret !== client.clientSecret) {
            return done(null, false);
        }
        UserModel.findOne({email: username}, function(err, user) {
            if (err) { return done(err); }
            if(user === null) {
                return done(null, false);
            }
            if(password !== user.password) {
                return done(null, false);
            }
            var token = __.randomKey(256);
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
        var token = __.randomKey(256);
        new TokenModel({
            token: token,
            clientId: client.clientId})
            .save(function(err, token) {
                if (err) { return done(err); }
                done(null, token);
            });
    });

}));

passport.use(
    new FacebookStrategy({
        clientID: APP_ID,
        clientSecret: APP_SECRET,
        callbackURL: FB_CALLBACK
    },
    function(accessToken, refreshToken, profile, done) {

        UserModel.findOne({userID : profile.id}, function(err, oldUser){
            var saveCallback = function(error, user){
                if(err){
                    throw err;
                }
                done(null, user);
            }
            if(oldUser){
                if(oldUser.token !== accessToken){
                    oldUser.token = accessToken;
                    oldUser.save(saveCallback);
                }else{
                    done(null,oldUser);
                }
            }else{
                var newUser = new UserModel({
                    userID : profile.id ,
                    email : profile.emails[0].value,
                    name : profile.displayName,
                    token: accessToken
                }).save(saveCallback);
            }
        });
        profile.token = accessToken;
        return done(null, profile);
    })
);

passport.use(new BearerStrategy(
    function(token, done) {
        UserModel.findOne({ token: token }, function (err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            return done(null, user, { scope: 'all' });
        });
    })
);

passport.use(new ClientPasswordStrategy(
    function(clientId, clientSecret, done) {
        ApplicationModel.findOne({ clientId: clientId }, function (err, client) {
            if (err) { return done(err); }
            if (!client) { return done(null, false); }
            if (client.clientSecret != clientSecret) { return done(null, false); }
            return done(null, client);
        });
    }
));


module.exports = passport;

module.exports.authorization = [

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
    server.decision()
];


module.exports.token = [
    passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
    server.token(),
    server.errorHandler()
];



