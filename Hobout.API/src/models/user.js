var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({

    login: String,
    password: String,
    token: String,
    refreshToken: String

});

var UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;