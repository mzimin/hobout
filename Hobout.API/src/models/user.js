var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({

    facebookId: String,
    email: String,
    name: String,
    login: String,
    password: String,
    token: String,
    refreshToken: String

});

module.exports = mongoose.model('User', UserSchema);