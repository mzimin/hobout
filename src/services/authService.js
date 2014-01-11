
var passport = require('passport');
var BearerStrategy = require('passport-http-bearer').Strategy;
var __ = require('../infrastructure/util');
var TokenModel = require('../models/token');
var UserModel = require('../models/user');

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


module.exports = passport;

//creating 'barrier' abstraction for reduce auth logic code ammount
module.exports.barrier = {

    'token': passport.authenticate('bearer', {session: false})

}
