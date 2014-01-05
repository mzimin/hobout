var __ = require('../infrastructure/util');

var QueryBuilderHelper = {

    _isSimpleValue: function(str){

        var delimiters = [ ',' , '[' , ']' , ';' , ':' ];
        var isSimple = true;
        __.each(delimiters, function(elem){
            if(str.indexOf(elem) !== -1){
                isSimple = false;
                return isSimple;
            }
        });
        return isSimple;

    },

    _parseComplexValue: function(str){

        var result = null;

    }


}


module.exports = {

    get: function(req, res, next){

    },

    post: function(req, res, next){

    },

    put: function(req, res, next){

    },

    del: function(req, res, next){

    },

    buildQuery: function(req, res, next){
        var model = this;

        var keyCommands = ['q', 'sort', 'limit', 'offset'];

        var filters = {};

        __.each(req.query, function(param){
           if(keyCommands.indexOf(param) === -1){
               filters[param] = req.query[param];
           }
        });

        var queryResult = model.find()

    }

}