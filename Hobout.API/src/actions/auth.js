var UserModel = require('../models/user');
var AppModel = require('../models/application');
var __ = require('../infrastructure/util');

function _saveToDB(model, query, element, callaback){

    model.findOne(query, function(err, item){
        if(err){
            return done(err);
        }
        if(item){
            return done(new Error("Element already exist."));
        }

        new model(element).save(callaback);
    });
}

module.exports = {

    signupUser: function(req, res, next){

        var userData = req.body;

        var saveCallback = function(error){

            if(error){
                throw error;
            }

            res.send({status: "success"});
            return next();

        }

        var userData = {
            name: userData.login,
            password: userData.password,
            email: userData.email};

        _saveToDB(UserModel, {email: userData.email}, userData, saveCallback);
    },

    registerApplication: function(req, res, next){

        var appData = {
            name: req.query.appName,
            userId: req.user.id,
            secret: __.randomKey(32)
        };

        var saveCallback = function(error, element){

            if(error){
                throw error;
            }
            res.send({clientId: element.id, secret: element.secret});

        }

        _saveToDB(AppModel, {name: appData.name}, appData, saveCallback);

    }

}