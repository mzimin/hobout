var mongoose = require('mongoose');
var __ = require('../infrastructure/util');
var restExtensions = require('./restExtensions');

var AppSchema = new mongoose.Schema({
    cid: String,
    secret: String,
    userID: String,
    name: String,
    redirectURI: String,
    created: Date
});

var AppModel = mongoose.model('Application', AppSchema);
__.extend(AppModel, restExtensions);

module.exports = AppModel;