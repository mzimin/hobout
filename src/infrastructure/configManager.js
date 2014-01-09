function ConfigManager(config){
    if(config){

        this._config = require('../../config/' + config);
    }
}

ConfigManager.prototype = {
    get: function(key){
        var result = null;
        if(key in this._config){
            result = this._config[key];
        }
        return result;
    }
}

module.exports = function(cfg){
    return new ConfigManager(cfg);
}