var restify = require('restify');

var server = restify.createServer();

function hello(req, res, next) {
    res.send('hello: ' + req.params.name);
    return next();
}

var PATH = '/login/:name';
server.get({path: PATH}, hello);

server.get(/\/bower_components\/?.*/, restify.serveStatic({
    directory: './hobout.demoapp/bower_components'
}));

server.get('/.*', restify.serveStatic({
    directory: './hobout.demoapp',
    default: 'index.html'
}));



server.listen(8080);