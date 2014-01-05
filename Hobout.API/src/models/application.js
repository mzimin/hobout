var mongoose = require('mongoose');

var AppSchema = new mongoose.Schema({
    cid: String,
    secret: String,
    userID: String,
    name: String,
    redirectURI: String,
    created: Date
});

module.exports = mongoose.model('Application', AppSchema);