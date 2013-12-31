var Application = require('./src/application');
var AuthService = require('./src/services/authService');
var authActions = require('./src/actions/authActions');

var application = new Application(process.env.PORT);
application.use(AuthService.initialize());


application.get('/auth/facebook',  AuthService.authenticate('facebook', { session: false, scope: 'email', display: 'popup' }));
application.get('/auth/facebook/callback', [AuthService.authenticate('facebook', { session: false }), loginSuccess]);
application.get('/auth', AuthService.authorization);
application.post('/auth/decision', AuthService.decision);
application.post('/auth/token', AuthService.token);
application.post('/auth/mtoken', AuthService.simplifiedToken);
//application.post('/auth/', )

application.get('/users/:name', [AuthService.authenticate('bearer', {session: false}), testSecretData]);
application.post('/users', authActions.signupUser);

application.handleStatic(/\/bower_components\/?.*/,{directory: './hobout.demoapp/bower_components'});
application.handleStatic(/\/js\/?.*/, {directory: './hobout.demoapp/js'});
application.handleStatic('/.*', {directory: './hobout.demoapp', default: 'index.html'});


application.run();

console.log('App started on port ' + application.port);

function loginSuccess(req, res){

    res.write("<script type='text/javascript'>(function(){if(opener && '' != opener.location) {opener.assignHoboutToken('"+ req.user.token +
            "');}window.close();})();</script> ");
    res.next();

};

function testSecretData(req, res, next){

    res.send({data:"Congratulations "+ req.params.name +", you able to see top secret data ever!"});
    return next();

};



