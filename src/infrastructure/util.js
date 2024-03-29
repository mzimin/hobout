var crypto = require('crypto');
var fs = require('fs');
var logger = require('./logger')(module);

module.exports = {

    randomKey: function(length){

        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var result = [];
        for (var i = length; i > 0; --i) {
            result.push(chars[Math.round(Math.random() * (chars.length - 1))]);
        }
        return result.join('');

    },

    render: function(res, content){

        res.writeHead(200, {
            'Content-Length': Buffer.byteLength(content),
            'Content-Type': 'text/html'
        });
        res.write(content);
        res.end();

    },

    isObject: function(elem){

        return (typeof elem == 'object');

    },

    format: function(string, dataToReplace){

        var result = string;
        if(string && dataToReplace && dataToReplace.length > 0){
            for(var i = 0; i < dataToReplace.length; i++){
                result = result.replace('{'+i+'}', dataToReplace[i]);
            }
        }
        return result;

    },

    createHmac: function(alg, key){
        return crypto.createHmac(alg, key);
    },

    each: function(arr, callback){

        if(arr && arr.length > 0){
            for(var i = 0; i < arr.length; i++){
                callback(arr[i]);
            }
        }

    },

    //extend ctr with all functions ("static methods") from extensions if ctr do not have own methods with the same name
    extend: function(ctr, extensions){

        for(var key in extensions){
            if(!ctr[key]){
                ctr[key] = extensions[key];
            }
        }

    },

    //return function binded to the context
    reference: function(context, func) {
        return function() {
            func.apply(context, arguments);
        }
    }

};