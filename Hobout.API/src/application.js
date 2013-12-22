var restify = require('restify');

function Application(port){

    this.server = restify.createServer();
    this.port = port || 80;

};

Application.prototype = {

    get: function(param, callbcack){

        this.server.get(param, callbcack);
    },

    put: function(param, callbcack){

        this.server.put(param, callbcack);

    },

    post: function(param, callbcack){

        this.server.post(param, callbcack);

    },

    del: function(param, callbcack){

        this.server.del(param, callbcack);

    },

    run: function(){

        this.server.listen(this.port);

    },

    handleStatic: function(routeRegExp, params){

        this.server.get(routeRegExp, restify.serveStatic(params));

    }
};

module.exports = Application;

