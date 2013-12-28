var mongoose = require('mongoose');

var AppSchema = new mongoose.Schema({
    secret: String,
    userID: String,
    name: String,
    redirectURI: String
});

module.exports = mongoose.model('Application', AppSchema);