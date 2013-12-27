var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var ClientPasswordStrategy  = require('passport-oauth2-client-password').Strategy;

var UserModel = require('../../models/user');
var ApplicationModel = require('../../models/application');


var APP_ID = process.env.APP_ID || '1406370232936920';
var APP_SECRET = process.env.APP_SECRET || 'e9bd1dd07c6d702c8c4f0bc6bdb33681';
var FB_CALLBACK = process.env.FB_CALLBACK || 'http://local.hobout.com/auth/facebook/callback';

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



function AuthService(){

    this.authManager = passport;

};

AuthService.prototype = {

    authenticate: function(type, param, callback){

        return this.authManager.authenticate(type, param, callback);

    },

    init: function(){

        return this.authManager.initialize();
    },

    generateToken: function(login, password){

        return login + password;

    }


};

module.exports = AuthService;