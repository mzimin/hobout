var Application = require('./src/application');

function hello(req, res, next) {
    res.send('hello: ' + req.params.name);
    return next();
}

var application = new Application(8080);

var PATH = '/login/:name';
application.get({path: PATH}, hello);

application.handleStatic(/\/bower_components\/?.*/,
    {directory: './hobout.demoapp/bower_components'});

application.handleStatic('/.*', {directory: './hobout.demoapp', default: 'index.html'});
application.run();