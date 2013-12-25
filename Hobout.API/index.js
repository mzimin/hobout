var Application = require('./src/application');
var AuthService = require('./src/service/authService');
var mongoose = require('mongoose');

var application = new Application(process.env.PORT);

var authService = new AuthService();
application.use(authService.init());

application.get('/auth/facebook',  authService.authenticate('facebook', { session: false, scope: 'email' }));
application.get('/auth/facebook/callback', [authService.authenticate('facebook', { session: false }), loginSuccess]);
application.get('/api/data', [authService.authenticate('bearer', {session: false}), testSecretData]);

application.handleStatic(/\/bower_components\/?.*/,{directory: './hobout.demoapp/bower_components'});
application.handleStatic(/\/js\/?.*/, {directory: './hobout.demoapp/js'});
application.handleStatic('/.*', {directory: './hobout.demoapp', default: 'index.html'});


application.run();
mongoose.connect('mongodb://localhost/hobout');

console.log('App started on port ' + application.port);


function loginSuccess(req, res){

    var url = '/' + '#/?code='+req.query.code + '&login=true';
    res.header('Location', url);
    res.send(302);

};

function testSecretData(req, res){

    res.send({data:"Congrats, you able to see top secret data ever!"});

};
