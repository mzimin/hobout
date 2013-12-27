var Application = require('./src/application');
var AuthService = require('./src/service/auth/authService');
var mongoose = require('mongoose');
var UserModel = require('./src/models/user');

var application = new Application(process.env.PORT);

var authService = new AuthService();
application.use(authService.init());


application.get('/auth/facebook',  authService.authenticate('facebook', { session: false, scope: 'email', display: 'popup' }));
application.get('/auth/facebook/callback', [authService.authenticate('facebook', { session: false }), loginSuccess]);
application.get('/users/:name', [authService.authenticate('bearer', {session: false}), testSecretData]);
application.post('/signup', signup);



application.handleStatic(/\/bower_components\/?.*/,{directory: './hobout.demoapp/bower_components'});
application.handleStatic(/\/js\/?.*/, {directory: './hobout.demoapp/js'});
application.handleStatic('/.*', {directory: './hobout.demoapp', default: 'index.html'});


application.run();
mongoose.connect('mongodb://localhost/hobout');

console.log('App started on port ' + application.port);


function loginSuccess(req, res){

    res.write(
        "<script type='text/javascript'>(function(){if(opener && '' != opener.location) {opener.assignHoboutToken('"+ req.user.token +
            "');}window.close();})();</script> ");
    res.next();

};

function testSecretData(req, res, next){

    res.send({data:"Congratulations "+ req.params.name +", you able to see top secret data ever!"});
    return next();

};

function signup(req, res, next){

    var userData = req.body;

    var saveCallback = function(error, user){

        if(error){
            throw error;
        }

        res.send({token: user.token});
        return next();

    }

    UserModel.findOne({ email: userData.email }, function (err, user) {
        if (err) { return done(err); }
        if (!user) {
            new UserModel({
                name: userData.login,
                password: userData.password,
                token: authService.generateToken(userData.login, userData.password)})
                .save(saveCallback)
        }
    });

}



