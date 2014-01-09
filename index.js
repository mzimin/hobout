var Application = require('./src/application');
var AuthService = require('./src/services/authService');
var Actions = require('./src/actions/actions');

var AppModel = require('./src/models/application');
var UserModel = require('./src/models/user');

var application = new Application(process.env.PORT);
application.use(AuthService.initialize());

//endpoint for initial request, when user registering in our application with facebook
application.get('/auth/facebook', AuthService.barrier['fb']);

//callback for facebook oauth2 authorization
application.get('/auth/facebook/callback', [AuthService.barrier["fb-callback"], Actions.loginSuccess]);

//initial enpoint for registering in Hobout via oauth2 authorization (Authorization code and Implicit grant types)
application.get('/auth', AuthService.authorization);

//endpoint who serve Hobout dialog request, when user allow using his data for 3'rd party application.
application.post('/auth/decision', AuthService.decision);

//endpoint who serve Hobout dialog request, when user deny using his data
application.post('/auth/decision/deny', [AuthService.barrier['oauth2-client'], Actions.denyRedirect]);

//endpoint for exchange code for token during oauth2 authorization
application.post('/auth/token', AuthService.token);

//endpoint for getting token during oauth2 authorization, if client secret code do not provided
application.post('/auth/mtoken', AuthService.simplifiedToken);

//registering models endpoints for CRUD operations
application.registerModel(AppModel);
application.registerModel(UserModel);

application.run();






