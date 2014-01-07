var __ = require('../infrastructure/util');

var delimiters_regex = / |,/;

function _isSimpleValue(str){

    return _arraify(str).length == 1;

}

function _arraify(str){

    return str.toString().split(delimiters_regex);

}

module.exports = {

    get: function(req, res, next){

        var model = this;
        var query = model.buildQuery(req);
        query.exec(function(err, data){
            if(err){
                throw err;
            }
            res.send(data);
            return next();
        })

    },

    post: function(req, res, next){

        var model = this;

        new model(req.body)
            .save(function(err, elem){
                if(err){
                    throw err;
                }
                res.send({status: 'success'});
                return next();
            })

    },

    put: function(req, res, next){
        var model = this;
        model.findById(req.query.id, function(err, elem){

            if(err){
                throw err;
            }

            if(!elem){
                throw new Error("Element not found");
            }

            for(var key in req.body){
                if(elem[key] !== req.body[key]){
                    elem[key] = req.body[key];
                }
            }

            elem.save(function(err, elem){
                if(err){
                    throw err;
                }
                res.send({status: 'success'});
                return next();
            })


        })

    },

    del: function(req, res, next){

        var model = this;
        model.findById(req.query.id, function(err, elem){
            if(err){
                throw err;
            }

            if(!elem){
                throw new Error('Element not found');
            }

            elem.remove(function(err){
                if(err){
                    throw err;
                }

                res.send({status: 'success'});
                return next();
            })
        })

    },

    //TODO: implement enumeration instead of arrays
    buildQuery: function(req){

        var model = this;
        var keyCommands = ['q', 'sort', 'limit', 'offset', 'count'];

        var filters = [];
        var commands = [];

        for(var key in req.query){
           if(key != '__proto__' && keyCommands.indexOf(key) === -1){
               filters.push({key: key, val: req.query[key]});
           }
        }

        var query;

        if('q' in req.query){

            throw new Error("Currently full text search not implemented");

        }else{

            query = model.find();
            while(filters.length > 0){
                var elem = filters.shift();
                query = _isSimpleValue(elem.val) ?
                    query.where(elem.key).equals(elem.val) :
                    query.find().where(elem.key).in(_arraify(elem.val));
            }

            if('sort' in req.query){
                var sortObj = {};
                __.each(_arraify(req.query.sort), function(elem){
                    sortObj[req.query.sort] = -1;
                })
                query = query.sort(sortObj);
            }else{
                query = query.sort({created: -1});
            }

            function addNumberBasedConstrain(key, func){
                if(key in req.query){
                    var value = parseInt(req.query[key]);
                    if(isNaN(value)){
                        throw new Error("invalid request parameters");
                    }
                    query = func.call(query, value);
                }
            }

            addNumberBasedConstrain('offset', query.skip);
            addNumberBasedConstrain('limit', query.limit);

            if('count' in req.query){
                query = query.count();
            }
        }

        return query;
    }

}