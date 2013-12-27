var restify = require('restify');

function Application(port){

    this.server = restify.createServer();
    this.server.use(restify.queryParser());
    this.server.use(restify.bodyParser())

    this.port = port || 80;

};

Application.prototype = {

    get: function(param, callbcack){

        return this.server.get(param, callbcack);
    },

    put: function(param, callbcack){

        return this.server.put(param, callbcack);

    },

    post: function(param, callbcack){

        return this.server.post(param, callbcack);

    },

    del: function(param, callbcack){

        return this.server.del(param, callbcack);

    },

    run: function(){

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

