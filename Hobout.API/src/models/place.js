var mongoose = require('mongoose');

var PlaceSchema = new mongoose.Schema({
    created: Date
});

var PlaceModel = mongoose.model('Place', PlaceSchema);
