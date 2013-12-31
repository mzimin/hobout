var AppModel = require('../models/application');
var UserModel = require('../models/user');
var logger = require('../infrastructure/logger')(module);

module.exports = function(){

    UserModel.findOne({email: 'hoboutDev@gmail.com'}, function(err, user){
        if(err){
            throw err;
        }
        if(!user){
            new UserModel({
                login: 'hoboutDev',
                name: 'Demo User',
                password: '12345',
                email:'hoboutdev@gmail.com'}).save(function(err, user){
                    if(err){
                        logger.error(err);
                        return;
                    }

                    AppModel.findOne({name: 'hoboutClient'}, function(err, app){
                        if(err){
                            throw err;
                        }
                        if(!app){
                            new AppModel({
                                name: 'hoboutClient',
                                secret: '11111',
                                redirectURI: 'http://local.hobout.com/auth/callback',
                                userId: user.id})
                                .save(function(err){
                                    if(err){
                                        logger.error(err);
                                    }
                                });
                        };
                    });

                });
        }
    });


}