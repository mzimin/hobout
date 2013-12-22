var APP_ID = '1406370232936920';
var APP_SECRET = 'e9bd1dd07c6d702c8c4f0bc6bdb33681';

var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

passport.use( new FacebookStrategy(
    {
        clientID: APP_ID,
        clientSecret: APP_SECRET,
        callbackURL: "http://local.hobout.com/auth/facebook/callback"
    },

    function(accessToken, refreshToken, profile, done) {
        console.log('accessToken='+accessToken+' facebookId='+profile.id)
        return done(null, profile)
    })
);

function AuthService(){

    this.authManager = passport;

};

AuthService.prototype = {

    authenticate: function(type, param){

        return this.authManager.authenticate(type, param);
    },

    init: function(){

        return this.authManager.initialize();
    }

};

module.exports = AuthService;