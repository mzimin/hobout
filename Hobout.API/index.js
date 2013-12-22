var Application = require('./src/application');
var AuthService = require('./src/service/authService');
var mongoose = require('mongoose');

var application = new Application(process.env.PORT);

var authService = new AuthService();
application.use(authService.init());


var fb_login_handler    = authService.authenticate('facebook', { session: false })
var fb_callback_handler = authService.authenticate('facebook', { session: false })
var fb_callback_handler2 = function(req, res) {
    console.log('we b logged in!')
    console.dir(req.user)
    // be sure to send a response
    res.send('Welcome ' + req.user.displayName);
}

application.get('/auth/facebook',  fb_callback_handler)
application.get('/auth/facebook/callback', [fb_callback_handler, fb_callback_handler2]);


application.handleStatic(/\/bower_components\/?.*/,{directory: './hobout.demoapp/bower_components'});
application.handleStatic('/.*', {directory: './hobout.demoapp', default: 'index.html'});

application.run();

console.log('App started on port ' + application.port)
