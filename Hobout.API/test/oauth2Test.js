var assert = require('assert');
var http = require('http');
var UserModel = require('../src/models/user');
var AppModel = require('../src/models/application');
var app = require('../index');
var http = require('http');

var __ = require('../src/infrastructure/util');

describe('oauth2 authorization approaches', function () {

    var host = 'http://local.hobout.com';

    var testUser, testApp = {id:1, redirectURI: 'some_uri'};

    it("should show client dialog window", function(){
                        var url = __.format("{0}/auth?response_type=code&client_id={1}&redirect_uri={2}",
                            [testApp.id, testApp.redirectURI]);
        http.get(url, function(res){
            console.log("Got response: " + res.statusCode);
            assert(res.statusCode != 200);
            done();
        })


    });

//    new UserModel({
//        login: 'testUser',
//        name: 'testUser',
//        password: 'test123',
//        email:'test@qqqq.com'})
//        .save(function(err, user){
//            if(err){
//                console.log(err);
//                return;
//            }
//            testUser = user;
//
//            new AppModel({
//                name: 'testClient',
//                secret: '22222',
//                redirectURI: 'www.testapp.com/auth/callback',
//                userId: user.id})
//                .save(function(err, app){
//                    if(err){
//                        logger.error(err);
//                    }
//                    testApp = app;
//
//                    it("should show client dialog window", function(){
//                        var url = __.format("{0}?response_type=code&client_id={1}&redirect_uri={2}",
//                            [host, testApp.id, testApp.redirectURI]);
//                        api.get(url).expect(200);
//                        done();
//
//                    })
//
//                    testUser.remove();
//                    testApp.remove();
//
//                });
//        });


//
//    it('should return 200', function (done) {
//        http.get('http://localhost:8000', function (res) {
//            assert.equal(200, res.statusCode);
//            done();
//        });
//    });
//
//    it('should say "Hello, world!"', function (done) {
//        http.get('http://localhost:8000', function (res) {
//            var data = '';
//
//            res.on('data', function (chunk) {
//                data += chunk;
//            });
//
//            res.on('end', function () {
//                assert.equal('Hello, world!\n', data);
//                done();
//            });
//        });
//    });
});