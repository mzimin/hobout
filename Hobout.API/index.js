var restify = require('restify');

var server = restify.createServer();

function hello(req, res, next) {
    res.send('hello: ' + req.params.name);
    return next();
}

var PATH = '/login/:name';
server.get({path: PATH}, hello);

server.listen(8080);