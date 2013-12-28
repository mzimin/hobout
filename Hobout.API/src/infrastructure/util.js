var crypto = require('crypto');


module.exports = {
    randomKey: function(length){
        return crypto.randomBytes(length).toString('base64');
    }


};