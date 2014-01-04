var restify = require('restify');
var mongoose = require('mongoose');
var initscript = require('../src/infrastructure/initScript');
var logger = require('../src/infrastructure/logger')(module);

// oauth2orize require session support , but restify do not support it, so adding session stud for integration
var sessionStub = function(){

    function setSession(req, res, next) {

        var session = {authorize: {0:{}}};
        req._session = req.session = session;
        return (next());

    }

    return (setSession);

}

function Application(port){

    this.server = restify.createServer();

    this.server.on('uncaughtException', function (req, res, route, err) {

        logger.error(err);

        res.send('You do not have permission to see this or something bad happened.');
        res.end();

    });

    this.server.use(restify.queryParser());
    this.server.use(restify.bodyParser());
    this.server.use(sessionStub());

    this.port = port || 80;

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

        mongoose.connect('mongodb://localhost/hobout');
        initscript();
        return this.server.listen(this.port);

    },

    handleStatic: function(routeRegExp, params){

        return this.server.get(routeRegExp, restify.serveStatic(params));

    },

    use: function(){

        return this.server.use.apply(this.server, arguments);

    }
};

module.exports = Application;


//TODO:
// 1) implement logginng
// 2) log attemps to connect without tokens, or with wrong token
// 3) implement log parser



