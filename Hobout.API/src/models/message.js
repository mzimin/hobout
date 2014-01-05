var mongoose = require('mongoose');

var MessageSchema = new mongoose.Schema({
    created: Date
});

var MessageModel = mongoose.model('Message', MessageSchema);