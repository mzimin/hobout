var assert = require('assert');
var sinon = require('sinon');
var __ = require('../../src/infrastructure/util');
var UserModel = require('../../src/models/user');
var should = require('should');


describe("extension for correctly handling rest request to models", function(done){

    describe("query construction according request data", function(done){

        var requestStub = {query:{
            clientId: "democlient",
            sort: "password"
        }}

        var queryTestPattern = function(done, req, expectedQuery){

            UserModel.buildQuery(req).exec(function(err, getted){
                if(err){throw err;}
                expectedQuery.exec(function(err, expected){
                    if(err){throw err;}
                    should(JSON.stringify(getted)).eql(JSON.stringify(expected));
                    done();
                })
            });
        }

        it("should construct query filtered by clientid and sorting by password", function(done){

            var requestStub = {query:{
                clientId: "democlient",
                sort: "password"
            }};

            queryTestPattern(done, requestStub, UserModel.find({clientId: 'democlient'}).sort({password:-1}));
        });

        it("should construct query for empty request", function(done){

            var requestStub = {query:{}}

            queryTestPattern(done, requestStub, UserModel.find().sort({created:-1}));
        })


        it("should construct query for empty request", function(done){

            var requestStub = {query:{offset:2, limit:4}}

            queryTestPattern(done, requestStub, UserModel.find().sort({created:-1}).skip(2).limit(4));
        })


        it("should construct query if filter have several value divided by coma", function(done){

            var req = {query:{
                login: "testuser8,testuser5,hoboutDev",
                email: "hoboutdev@gmail.com,test5@test.com"
            }};

            queryTestPattern(done, req,
                UserModel.find()
                    .where('login').in(['testuser8','testuser5','hoboutDev'])
                    .where('email').in(['hoboutdev@gmail.com','test5@test.com']).
                    sort({created: -1}));

        })

    });

    describe("rest extensions", function(done){

        it('should handle get request correctly', function(done){

            var reqStub = {query:{}}
            var resStub = {send: function(val){
                this.val = val;
            }}

            var bq = sinon.spy(UserModel, 'buildQuery');
            var send = sinon.spy(resStub, 'send');

            function next(req, res){

                should(bq.calledOnce).be.ok;
                should(bq.calledOn(UserModel)).be.ok;
                should(bq.calledWith(reqStub)).be.ok;

                should(send.calledOnce).be.ok;
                should(send.calledOn(resStub)).be.ok;
                should(send.calledWith(resStub.val)).be.ok;

                return done();
            }

            UserModel.get(reqStub, resStub, next);

        });

        it('should handle post request correctly', function(done){

            var reqStub = {body:{email:"testemail@test.org", login:"qwerty", password:'12345'}}
            var resStub = {send: function(val){
                this.val = val;
            }}


            UserModel.prototype.save = function(cb){
                return cb(null, {});
            }

            var save = sinon.spy(UserModel.prototype, 'save');
            var send = sinon.spy(resStub, 'send');

            function next(req, res){

                should(save.calledOnce).be.ok;

                should(send.calledOnce).be.ok;
                should(send.calledOn(resStub)).be.ok;
                should(send.calledWith(resStub.val)).be.ok;

                return done();
            }

            UserModel.post(reqStub, resStub, next);

        });

        it('should handle del request correctly', function(done){

            var reqStub = {query: {id: 'someunrealid'}}
            var resStub = {send: function(val){
                this.val = val;
            }}

            UserModel.prototype.remove = function(cb){
                return cb(null, {});
            }

            UserModel.findById = function(id, cb){
                return cb(null, new UserModel());
            }

            var remove = sinon.spy(UserModel.prototype, 'remove');
            var find = sinon.spy(UserModel, 'findById')
            var send = sinon.spy(resStub, 'send');

            function next(req, res){

                should(remove.calledOnce).be.ok;

                should(find.calledOnce).be.ok;
                should(find.calledOn(UserModel)).be.ok;
                should(find.calledWith(reqStub.query.id)).be.ok;

                should(send.calledOnce).be.ok;
                should(send.calledOn(resStub)).be.ok;
                should(send.calledWith(resStub.val)).be.ok;

                return done();
            }

            UserModel.del(reqStub, resStub, next);

        });

        it('should handle put request correctly', function(done){

            var reqStub = {query: {id: 'someunrealid'}}
            var resStub = {send: function(val){
                this.val = val;
            }}

            UserModel.findById = function(id, cb){
                return cb(null, new UserModel());
            }

            UserModel.prototype.save = function(cb){
                return cb(null, {});
            }

            var save = sinon.spy(UserModel.prototype, 'save');
            var find = sinon.spy(UserModel, 'findById')
            var send = sinon.spy(resStub, 'send');

            function next(req, res){

                should(save.calledOnce).be.ok;

                should(find.calledOnce).be.ok;
                should(find.calledOn(UserModel)).be.ok;
                should(find.calledWith(reqStub.query.id)).be.ok;

                should(send.calledOnce).be.ok;
                should(send.calledOn(resStub)).be.ok;
                should(send.calledWith(resStub.val)).be.ok;

                return done();
            }

            UserModel.put(reqStub, resStub, next);

        });

    });

});
