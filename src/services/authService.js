
/*
* Implementing auth logic. Solution currently based on 2 open source projects:
* 1) oauth2orize ( https://github.com/jaredhanson/oauth2orize )
* 2) passport ( https://github.com/jaredhanson/passport )
* with custom additions which allow using this libraries without having session
* */


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

var APP_ID = configManager.get('fbAppId');
var APP_SECRET = configManager.get('fbAppSecret');
var FB_CALLBACK = configManager.get('fbCallbackUrl');

var server = oauth2orize.createServer();

//
// during auth process client object serrializing/desserializing. Implementing this methods
//
server.serializeClient(function(client, done){
    return done(null, client.cid);
});
server.deserializeClient(function(id, done){
    AppModel.findOne({cid: id}, function(err, client) {
        if (err) { return done(err); }
        return done(null, client);
    });
});

//
// registering grant type handlers which will be fired depending of grant type requesting
//

// handler for authorization code grant type
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

// handler for token grant type
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

//implementing exchange logic for exchanging code or credentials into token
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
            if(!user.checkPassword(password)) {
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

//
// registering strategies which handle request depending from supporting type of request
//

// basic strategies (when username/password transfer in http header)
passport.use(new BasicStrategy(function(username, password, done) {
    AppModel.findOne({ cid: username }, function(err, client) {
        if (err) { return done(err); }
        if (!client) { return done(null, false); }
        if (client.secret != password) { return done(null, false); }

        return done(null, client);
    });
}
));

//facebook oauth2 authorization strategy. handle FB authorization flow.
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

// Strategy which support bearer token authorization type
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

// Strategy which handle Client/Secret auth data, transferred in query string
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

// Strategy which handle Client (without secret) auth data, transferred in query string
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

//creating 'barrier' abstraction for reduce auth logic code ammount
module.exports.barrier = {

    'fb': passport.authenticate('facebook', { session: false, scope: 'email', display: 'popup' }),
    'fb-callback': passport.authenticate('facebook', { session: false }),
    'oauth2-client': passport.authenticate('oauth2-client', {session: false, assignProperty: 'clientapp'}),
    'token': passport.authenticate('bearer', {session: false})

}

//custom handler
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
        var dialog_url;
        if(req.query.grant_type == 'code')
            dialog_url = configManager.get('clientApp') + '/#/dialog';
        else{
            dialog_url = configManager.get('clientApp') + '/#/tokendialog';
        }
        __.redirect(dialog_url, res);
    }

]

//custom code exchange logic which working when
function codeExchange(req, res, next){

    var client = req.clientapp;
    var user = req.user;
    var result = null;

    if(req.body.directToken){

        new TokenModel({
            clientId: client.cid,
            userId: user.id,
            token: __.randomKey(256)
        }).save(
            function(err, token){
                if (err) {
                    result = err
                }else{
                    result = {access_token: token.token, redirectURI: client.redirectURI};
                }
                res.send(result);
                res.end();
            });

    }else{

        var code = __.randomKey(16);
        new AuthCodeModel({
            code: code,
            userId: user.id,
            clientId: client.cid,
            redirectURI: client.redirectURI})
            .save(function(err, code) {
                if (err) {
                    result = err
                }else{
                    result = {code: code.code, redirectURI: code.redirectURI};
                }
                res.send(result);
                res.end();
            });

    }

}

// auth middleware code for secure decision endpoint
module.exports.decision = [
    passport.authenticate('bearer', {session: false}),
    passport.authenticate('oauth2-client', {session: false, assignProperty: 'clientapp'}),
    codeExchange,
    server.errorHandler()
];

// auth middleware code for secure token endpoint
module.exports.token = [
    passport.authenticate(['oauth2-client-password'], { session: false }),
    server.token(),
    server.errorHandler()
];

// auth middleware code for secure decision endpoint
module.exports.simplifiedToken = [
    passport.authenticate('oauth2-client', {session: false}),
    server.token(),
    server.errorHandler()
];




