var restify = require('restify');
var mongoose = require('mongoose');
var initscript = require('../src/infrastructure/initScript');
var logger = require('../src/infrastructure/logger')(module);
var AuthService = require('../src/services/authService');
var __ = require('../src/infrastructure/util');
var configManager = require('../src/infrastructure/configManager')('app');

function Application(port){

    this.server = restify.createServer();

    //by default restify do not think that Authorization header should be allowed during CORS,
    //so all bearer auth request will be failing because of CORS. Fixing it by adding Authorization header
    //in to the array, which contains allowed headers
    restify.CORS.ALLOW_HEADERS.push('authorization');

    this.server.use(restify.CORS());

    this.server.on('uncaughtException', function (req, res, route, err) {

        logger.error(err);

        res.send('You do not have permission to see this or something bad happened.');
        res.end();

    });

    this.server.use(restify.queryParser());
    this.server.use(restify.bodyParser());
    this.server.use(function(req, res, next){
        if(req.body){
            console.log('---------------request body ------------------');
            console.log(req.body);
        }
        next();
    });
    this.port = port || configManager.get('port');

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
            mongoose.connect(configManager.get('mongoUrl'));
        }catch(err){
            logger.error(err);
            mongoose.connection.close(function(err){
                if(err){
                    throw err;
                }
                mongoose.connect(configManager.get('mongoUrl'));
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
        var tmpRoute;

        __.each(['get', 'post', 'put', 'del'], function(method){

            (method === 'put' || method === 'del') ? tmpRoute = route + '/:id' : tmpRoute = route;
            self[method](tmpRoute, [AuthService.barrier['token'], __.reference(model, model[method])]);

        });

    }
};

module.exports = Application;




