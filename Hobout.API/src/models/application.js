var mongoose = require('mongoose');

var AppSchema = new mongoose.Schema({
    cid: String,
    secret: String,
    userID: String,
    name: String,
    redirectURI: String
});

module.exports = mongoose.model('Application', AppSchema);