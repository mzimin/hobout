var Application = require('../../src/application');
var assert = require('assert');
var sinon = require('sinon');

describe('application', function(){

    describe('class initialization', function(){

        it('should initialize application and set port', function(){

            var appWithPort = new Application(777);
            var appWithoutPort = new Application();

            assert.equal(appWithPort.port, 777);
            assert.equal(appWithoutPort.port, 80);

        });
    });

    describe("api:", function(){

        var application = new Application();
        var callback = function(){return "I'm callback"};

        it('should correctly call get method', function(){

            var spy = sinon.spy(application.server, 'get');

            application.get('/test', callback);

            assert(spy.calledOn(application.server));
            assert(spy.calledWith('/test', callback));
            assert(spy.calledOnce);

        });

        it('should correctly call post method', function(){

            var spy = sinon.spy(application.server, 'post');

            application.post('/test', callback);

            assert(spy.calledOn(application.server));
            assert(spy.calledWith('/test', callback));
            assert(spy.calledOnce);

        });

        it('should correctly call put method', function(){

            var spy = sinon.spy(application.server, 'put');

            application.put('/test', callback);

            assert(spy.calledOn(application.server));
            assert(spy.calledWith('/test', callback));
            assert(spy.calledOnce);

        });

        it('should correctly call post method', function(){

            var spy = sinon.spy(application.server, 'del');

            application.del('/test', callback);

            assert(spy.calledOn(application.server));
            assert(spy.calledWith('/test', callback));
            assert(spy.calledOnce);


        });

        it('should correctly call handleStatic method', function(){

            var obj = {directory: './hobout.demoapp/bower_components'};
            application = new Application();
            var spy = sinon.spy(application.server, 'get');

            application.handleStatic('/test', obj);

            assert(spy.calledOn(application.server));
            assert(spy.calledOnce);
        });

        it('should correctly call run method', function(){

            var listenStub = sinon.stub().returns();
            application.server.listen = listenStub;

            application.run();

            assert(listenStub.calledOn(application.server));
            assert(listenStub.calledWith(application.port));
            assert(listenStub.calledOnce);

        });

    });

});