var Application = require('./src/application');
var AuthService = require('./src/services/authService');

var AppModel = require('./src/models/application');
var UserModel = require('./src/models/user');

var application = new Application(process.env.PORT);
application.use(AuthService.initialize());

//registering models endpoints for CRUD operations
application.registerModel(AppModel);
application.registerModel(UserModel);

application.run();






