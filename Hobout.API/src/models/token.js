var mongoose = require('mongoose');

var TokenSchema = new mongoose.Schema({
    token: String,
    refreshToken: String,
    userId: String,
    clientId: String
});



module.exports = mongoose.model('Token', TokenSchema);
