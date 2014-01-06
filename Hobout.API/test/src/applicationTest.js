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

    describe("api", function(){

        var application;
        application = new Application();
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

        it('should correctly call head method', function(){

            application = new Application();
            var spy = sinon.spy(application.server, 'head');

            application.head('/test', callback);

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

    describe('model registration', function(){

        var application = new Application();
        var spyg = sinon.spy(application, 'get');
        var spyp = sinon.spy(application, 'post');
        var spyput = sinon.spy(application, 'put');
        var spyd = sinon.spy(application, 'del');

        var actionStub = sinon.stub();

        var modelCtr = function(){
        }

        modelCtr.get = actionStub;
        modelCtr.post = actionStub;
        modelCtr.put = actionStub;
        modelCtr.del = actionStub;
        modelCtr.collection = {name:'testhome'};

        it("register model correctly to answer for request", function(){

            application.registerModel(modelCtr);
            assert(spyg.calledOn(application));
            assert(spyg.calledWith('/testhome', actionStub));
            assert(spyg.calledOnce);

            assert(spyp.calledOn(application));
            assert(spyp.calledWith('/testhome', actionStub));
            assert(spyp.calledOnce);

            assert(spyput.calledOn(application));
            assert(spyput.calledWith('/testhome', actionStub));
            assert(spyput.calledOnce);

            assert(spyd.calledOn(application));
            assert(spyd.calledWith('/testhome', actionStub));
            assert(spyd.calledOnce);

        })

    })

});