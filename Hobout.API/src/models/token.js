var mongoose = require('mongoose');

var TokenSchema = new mongoose.Schema({
    token: String,
    userId: String,
    clientId: String,
    created: Date
});



module.exports = mongoose.model('Token', TokenSchema);
