var mongoose = require('mongoose');
var __ = require('../infrastructure/util');
var restExtensions = require('./restExtensions');

var UserSchema = new mongoose.Schema({

    facebookId: String,
    email: String,
    name: String,
    login: String,
    _password: String,
    salt: String,
    token: String,
    refreshToken: String,
    created: {
        type: Date,
        default: Date.now
    }

});

UserSchema.methods.encryptPassword = function(pass) {
    return __.createHmac('sha1', this.salt).update(pass).digest('hex');
};

UserSchema.methods.checkPassword = function(password) {
    return this.encryptPassword(password) === this._password;
};

UserSchema.virtual('password')
    .set(function(password) {
        this._plainpass = password;
        this.salt = __.randomKey(32);
        this._password = this.encryptPassword(password);
    })
    .get(function(){
        return this._plainpass;
    });


var UserModel = mongoose.model('User', UserSchema);
__.extend(UserModel, restExtensions);
module.exports = UserModel;