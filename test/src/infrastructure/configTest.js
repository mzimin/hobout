var should = require('should');
var ConfigurationManager = require('../../../src/infrastructure/configManager');

describe('configuration manager', function(){

    it('return value from config', function(){

        var configFile = {testValue: 'testing data'};
        var manager = new ConfigurationManager();
        manager._config = configFile;

        should(manager.get('testValue')).be.eql('testing data');

    })

});