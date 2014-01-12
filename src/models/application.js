var mongoose = require('mongoose');
var __ = require('../infrastructure/util');
var restExtensions = require('./restExtensions');

var AppSchema = new mongoose.Schema({

    cid: { type: String, default: __.randomKey(24)},
    secret: { type: String, default: __.randomKey(32)},
    userId: String,
    name: String,
    redirectURI: String,
    created: { type: Date, default: Date.now }

});

var AppModel = mongoose.model('Application', AppSchema);
__.extend(AppModel, restExtensions);

module.exports = AppModel;