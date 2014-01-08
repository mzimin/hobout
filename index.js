var Application = require('./src/application');
var AuthService = require('./src/services/authService');
var Actions = require('./src/actions/actions');

var AppModel = require('./src/models/application');
var UserModel = require('./src/models/user');

var application = new Application(process.env.PORT);
application.use(AuthService.initialize());

application.get('/auth/facebook', AuthService.barrier['fb']);
application.get('/auth/facebook/callback', [AuthService.barrier["fb-callback"], Actions.loginSuccess]);
application.get('/auth', AuthService.authorization);
application.post('/auth/decision', AuthService.decision);
application.post('/auth/decision/deny', [AuthService.barrier['oauth2-client'], Actions.denyRedirect]);
application.post('/auth/token', AuthService.token);
application.post('/auth/mtoken', AuthService.simplifiedToken);

application.registerModel(AppModel);
application.registerModel(UserModel);

application.run();

console.log("application succesfullt starts on port: " + application.port);





