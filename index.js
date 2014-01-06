var Application = require('./src/application');
var AuthService = require('./src/services/authService');
var Actions = require('./src/actions/actions');

var AppModel = require('./src/models/application');
var UserModel = require('./src/models/user');

var application = new Application(process.env.PORT);
application.use(AuthService.initialize());

application.get('/auth/facebook', AuthService.barrier['fb']);
application.get('/auth/facebook/callback', AuthService.barrier["fb-callback"], loginSuccess);
application.get('/auth', AuthService.authorization);
application.post('/auth/decision', AuthService.decision);
application.post('/auth/decision/deny', [AuthService.barrier['oauth2-client'], Actions.denyRedirect]);
application.post('/auth/token', AuthService.token);
application.post('/auth/mtoken', AuthService.simplifiedToken);

application.registerModel(AppModel);
application.registerModel(UserModel);

//application.post('/users', [AuthService.barrier['oauth2-client'], Actions.signupUser]);

application.handleStatic(/\/bower_components\/?.*/,{directory: './hobout.demoapp/bower_components'});
application.handleStatic(/\/js\/?.*/, {directory: './hobout.demoapp/js'});
application.handleStatic('/.*', {directory: './hobout.demoapp', default: 'index.html'});


application.run();
console.log('App started on port ' + application.port);

function loginSuccess(req, res, next){

    res.write("<script type='text/javascript'>(function(){if(opener && '' != opener.location) {opener.assignHoboutToken('"+ req.user.token +
            "');}window.close();})();</script> ");
    return next();

};

function testSecretData(req, res, next){

    res.send({data:"Congratulations "+ req.params.name +", you able to see top secret data ever!"});
    return next();

};




