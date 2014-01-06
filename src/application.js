var restify = require('restify');
var mongoose = require('mongoose');
var initscript = require('../src/infrastructure/initScript');
var logger = require('../src/infrastructure/logger')(module);
var AuthService = require('../src/services/authService');
var __ = require('../src/infrastructure/util');

// oauth2orize require session support, but restify do not support sessions,
// so sessionStub adding session stub for simplify integration

var sessionStub = function(){

    function setSession(req, res, next) {

        var session = {authorize: {0:{}}};
        req._session = req.session = session;
        return (next());

    }

    return setSession;

}

function Application(port){

    this.server = restify.createServer();

    this.server.on('uncaughtException', function (req, res, route, err) {

        logger.error(err);

        res.send('You do not have permission to see this or something bad happened.');
        res.end();

    });

    var enableCORS = function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

        // intercept OPTIONS method
        if ('OPTIONS' == req.method) {
            res.send(200);
        }
        else {
            next();
        }
    };


    // enable CORS!
    this.server.use(enableCORS);

    this.server.use(restify.queryParser());
    this.server.use(restify.bodyParser());
    this.server.use(sessionStub());

    this.port = port || 80;

    process.on('SIGINT', function() {
        logger.log('application closing');
        this.close(function(){
            process.exit(0);
        });
    });

};

Application.prototype = {

    get: function(param, callback){

        return this.server.get(param, callback);
    },

    put: function(param, callback){

        return this.server.put(param, callback);

    },

    post: function(param, callback){

        return this.server.post(param, callback);

    },

    del: function(param, callback){

        return this.server.del(param, callback);

    },

    head: function(param, callback){

        return this.server.head(param, callback);

    },

    run: function(){

        try{
            var mongourl = process.env.MONGO_URL || 'mongodb://localhost/hobout';
            mongoose.connect(mongourl);
        }catch(err){
            logger.error(err);
            mongoose.connection.close(function(err){
                if(err){
                    throw err;
                }
                mongoose.connect('mongodb://localhost/hobout');
            });
        }
        initscript();
        return this.server.listen(this.port);

    },

    close: function(callback){

        this.server.close(function(){
            mongoose.connection.close(callback);
        })

    },

    handleStatic: function(routeRegExp, params){

        return this.server.get(routeRegExp, restify.serveStatic(params));

    },

    use: function(){

        return this.server.use.apply(this.server, arguments);

    },

    registerModel: function(model, opts){
        var self = this;

        if(opts){
            //TODO: will be implemented in future, when more complex regitering will be needed
        }

        var route = '/' + (model.routingName || model.collection.name);
        __.each(['get', 'post', 'put', 'del'], function(method){
           self[method](route, [AuthService.barrier['token'], __.reference(model, model[method])]);
        });

    }
};

module.exports = Application;




