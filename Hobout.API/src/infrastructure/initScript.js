var AppModel = require('../models/application');
var UserModel = require('../models/user');

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
                email:'hoboutDev@gmail.com'}).save(function(err, user){
                    if(err){
                        console.log(err);
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
                                userId: user.id})
                                .save(function(err){
                                    if(err){
                                        console.log(err);
                                    }
                                });
                        };
                    });

                });
        }
    });


}