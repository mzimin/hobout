var AppModel = require('../models/application');
var UserModel = require('../models/user');
var logger = require('../infrastructure/logger')(module);
var configManager = require('../infrastructure/configManager')('app');

module.exports = function(){

    function initClientAppData(){

        function generateApp(cid, redirect, user){
            AppModel.findOne({cid: cid}, function(err, app){
                if(err){
                    throw err;
                }
                if(!app){
                    new AppModel({
                        cid: cid,
                        name: cid,
                        secret: '11111',
                        redirectURI: redirect,
                        userId: user.id})
                        .save(function(err){
                            if(err){
                                logger.error(err);
                            }
                        });
                };
            });
        }

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

                        generateApp('democlient', 'http://auth.hobout.com/auth/callback', user);
                        generateApp('apigeeImplicit', 'https://apigee.com/oauth_callback/client/oauth2ImplicitGrantCallback', user);
                        generateApp('apigeeCode', 'https://apigee.com/oauth_callback/client/oauth2CodeCallback', user);

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
                                    redirectURI: configManager.get('clientApp') + '/auth/callback',
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