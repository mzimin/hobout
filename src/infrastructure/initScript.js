var AppModel = require('../models/application');
var UserModel = require('../models/user');
var logger = require('../infrastructure/logger')(module);

module.exports = function(){

    function initClientAppData(){

        UserModel.findOne({email: 'hoboutdev@gmail.com'}, function(err, user){
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
                                    cid: 'democlient',
                                    name: 'hoboutClient',
                                    secret: '11111',
                                    redirectURI: (process.env.LHOST || 'http://local.hobout.com') + '/auth/callback',
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

    function initTestData(){

        UserModel.findOne({email: 'test@test.com'}, function(err, user){
            if(err){
                throw err;
            }
            if(!user){
                new UserModel({

                    login: 'testuser',
                    name: 'Test User',
                    password: '12345',
                    email: 'test@test.com'}).save(function(err, user){
                        if(err){
                            logger.error(err);
                            return;
                        }

                        function cb(err){if(err) { throw err }};

                        for(var i = 0; i < 10; i++){

                            new UserModel({
                                login: 'testuser' + i,
                                name: 'test test' + i,
                                password: Math.random().toString(),
                                email: 'test' + i + '@test.com'}).save(cb);

                        }


                        AppModel.findOne({cid: 'testclient'}, function(err, app){
                            if(err){
                                throw err;
                            }
                            if(!app){
                                new AppModel({
                                    cid: 'testclient',
                                    name: 'Test App',
                                    secret: '22222',
                                    redirectURI: (process.env.LHOST || 'http://local.hobout.com') + '/auth/callback',
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

    initClientAppData();
    initTestData();

}