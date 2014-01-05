var mongoose = require('mongoose');

var AuthCodeSchema = new mongoose.Schema({
    code: String,
    userId: String,
    clientId: String,
    redirectURI: String,
    created: Date
});



module.exports = mongoose.model('AuthCode', AuthCodeSchema);
