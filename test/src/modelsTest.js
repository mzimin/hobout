var assert = require('assert');
var sinon = require('sinon');
var __ = require('../../src/infrastructure/util');
var restExtensions = require('../../src/models/restExtensions');




describe("extension for correctly handling rest request to models", function(){

    describe("query construction according request data", function(){

    });

    describe("rest extensions", function(){

        var modelStub = function(){};
        __.extend(modelStub, restExtensions);

        var sendStub = sinon.stub();
        var constructQuery = sinon.spy(modelStub, 'constructQuery');
        var find = sinon.spy(model.Stub, 'find');

        var requestStub = {
            body: {},
            query: {}
        };

        var responseStub = {send: sendStub};

        it('model should handle get request correctly', function(){

            modelStub.get(requestStub, responseStub);

            assert(constructQuery.calledOnce);
            assert(constructQuery.calledOn(modelStub));
            assert(constructQuery.calledWith(requestStub));




        });

        it('model should handle post request correctly', function(){

        });

        it('model should handle del request correctly', function(){

        });

        it('model should handle put request correctly', function(){

        });

    });

});
