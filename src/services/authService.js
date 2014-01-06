var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var BasicStrategy = require('passport-http').BasicStrategy;
var ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
var ClientStrategy = require('../infrastructure/clientStrategy');
var oauth2orize = require('oauth2orize');
var __ = require('../infrastructure/util');
var AppModel = require('../models/application');
var TokenModel = require('../models/token');
var AuthCodeModel = require('../models/authCode');
var UserModel = require('../models/user');
var configManager = require('../infrastructure/configManager')('app');

var APP_ID = process.env.APP_ID || '1406370232936920';
var APP_SECRET = process.env.APP_SECRET || 'e9bd1dd07c6d702c8c4f0bc6bdb33681';
var FB_CALLBACK = process.env.FB_CALLBACK || 'http://local.hobout.com/auth/facebook/callback';

var server = oauth2orize.createServer();

server.serializeClient(function(client, done){
    return done(null, client.cid);
});

server.deserializeClient(function(id, done){
    AppModel.findOne({cid: id}, function(err, client) {
        if (err) { return done(err); }
        return done(null, client);
    });
});

server.grant(oauth2orize.grant.authorizationCode(function(client, redirectURI, user, ares, done){

    var code = __.randomKey(16);

    new AuthCodeModel({
        code: code,
        userId: user.id,
        clientId: client.cid,
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
        clientId: client.cid })
        .save(function(err, token) {
            if (err) {return done(err);}
            return done(null, token);
        });
}));

server.exchange(oauth2orize.exchange.code(function(client, code, redirectURI, done) {

    AuthCodeModel.findOne({code: code}, function(err, authCode) {
        if (err) { return done(err); }
        if (client.cid !== authCode.clientId) { return done(new Error("Incorrect client application"), false); }
        if (redirectURI !== authCode.redirectURI) { return done(new Error("Incorrect redirect URI"), false); }

        var token = __.randomKey(256);
        new TokenModel({
            token: token,
            code: authCode.code,
            userID: authCode.userId,
            clientId: authCode.clientId })
            .save(function(err, token) {
                if (err) { return done(err); }
                done(null, token.token);
            });
    });

}));

server.exchange(oauth2orize.exchange.password(function(client, username, password, scope, done) {

    AppModel.findOne({ cid: client.cid }, function(err, clientapp) {
        if (err) { return done(err); }
        if(clientapp === null) {
            return done(null, false);
        }

        if(clientapp.secret !== client.secret) {
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
                clientId: client.cid})
                .save(function(err, tokenModel) {
                    if (err) { return done(err); }
                    done(null, tokenModel.token);
                });
        });
    });
}));


server.exchange(oauth2orize.exchange.clientCredentials(function(client, scope, done) {

    AppModel.findOne({ cid : client.cid }, function(err, clientapp) {
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
                done(null, token.token);
            });
    });

}));


passport.use(new BasicStrategy(function(username, password, done) {
    AppModel.findOne({ cid: username }, function(err, client) {
        if (err) { return done(err); }
        if (!client) { return done(null, false); }
        if (client.secret != password) { return done(null, false); }

        return done(null, client);
    });
}
));

passport.use(
    new FacebookStrategy({
        clientID: APP_ID,
        clientSecret: APP_SECRET,
        callbackURL: FB_CALLBACK
    },
    function(accessToken, refreshToken, profile, done) {

        UserModel.findOne({facebookId : profile.id}, function(err, oldUser){
            var saveCallback = function(error, user){
                if(err){
                    throw err;
                }

                new TokenModel({
                    token: accessToken,
                    userId: user.id,
                    clientId: user.clientId})
                    .save(function(err){
                        if(err){
                            throw err;
                        }else{
                            user.token = accessToken;
                            done(null, user);
                        }
                    })
            }
            if(oldUser){
                if(oldUser.token !== accessToken){
                    oldUser.token = accessToken;
                    oldUser.save(saveCallback);
                }else{
                    done(null,oldUser);
                }
            }else{
                new UserModel({
                    facebookId : profile.id ,
                    email : profile.emails[0].value,
                    name : profile.displayName,
                    clientId: configManager.get('defaultApplication'),
                    token: accessToken
                }).save(saveCallback);
            }
        });
    })
);

passport.use(new BearerStrategy(
    function(token, done) {
        TokenModel.findOne({ token: token }, function (err, token) {
            if (err) { return done(err); }
            if (!token) { return done(null, false); }
            UserModel.findOne({_id: token.userId}, function(err, user){
                if (err) { return done(err); }
                if (!user) { return done(new Error("Token's user not found.")); }
                return done(null, user, { scope: 'all' });
            })
        });
    })
);

passport.use(new ClientPasswordStrategy(
    function(clientId, clientSecret, done) {
        AppModel.findOne({ cid: clientId }, function (err, client) {
            if (err) { return done(err); }
            if (!client) { return done(null, false); }
            if (client.secret != clientSecret) { return done(null, false); }
            return done(null, client);
        });
    }
));

passport.use(new ClientStrategy(function(clientId, clientSecret, done) {
    AppModel.findOne({ cid: clientId }, function (err, client) {
        if (err) { return done(err); }
        if (!client) { return done(null, false); }
        if(clientSecret){
            if (client.clientSecret != clientSecret) { return done(null, false); }
        }
        return done(null, client);
    });
}))


module.exports = passport;

module.exports.barrier = {

    'fb': passport.authenticate('facebook', { session: false, scope: 'email', display: 'popup' }),
    'fb-callback': passport.authenticate('facebook', { session: false }),
    'oauth2-client': passport.authenticate('oauth2-client', {session: false, assignProperty: 'clientapp'}),
    'token': passport.authenticate('bearer', {session: false})

}

module.exports.authorization = [

    server.authorization(function(clientID, redirectURI, done) {
        AppModel.findOne({cid: clientID}, function(err, client) {
            if (err) { return done(err); }
            if(!client){
                return done(new Error("Client application with such id do not exist"));
            }
            if(client.redirectURI !== redirectURI){
                return done(new Error("Redirect URL not provided or has incorrect value"));
            };
            return done(null, client, redirectURI);
        });
    }),
    function(req, res){
        __.renderDialog(req.oauth2.client, res);
    }

]

function codeEchange(req, res, next){

    var client = req.clientapp;
    var user = req.user;
    var code = __.randomKey(16);
    new AuthCodeModel({
        code: code,
        userId: user.id,
        clientId: client.cid,
        redirectURI: client.redirectURI})
        .save(function(err, code) {
            var result = null;
            if (err) {
                result = err
            }else{
                result = {code: code.code, redirectURI: code.redirectURI};
            }
            res.send(result);
            res.end();
        });

}

module.exports.decision = [
    passport.authenticate('bearer', {session: false}),
    passport.authenticate('oauth2-client', {session: false, assignProperty: 'clientapp'}),
    codeEchange,
    server.errorHandler()
];

module.exports.token = [
    passport.authenticate(['oauth2-client-password'], { session: false }),
    server.token(),
    server.errorHandler()
];

module.exports.simplifiedToken = [
    passport.authenticate('oauth2-client', {session: false}),
    server.token(),
    server.errorHandler()
];




