var mongoose = require('mongoose');

var AppSchema = new mongoose.Schema({

    clientId: String,
    cecret: String

});

var AppModel = mongoose.model('User', UserSchema);