var mongoose = require('mongoose');
var __ = require('../infrastructure/util');
var restExtensions = require('./restExtensions');

var UserSchema = new mongoose.Schema({

    facebookId: String,
    email: String,
    name: String,
    login: String,
    password: String,
    token: String,
    refreshToken: String,
    created: Date

});

var UserModel = mongoose.model('User', UserSchema);
__.extend(UserModel, restExtensions);

module.exports = UserModel;