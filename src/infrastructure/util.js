var crypto = require('crypto');
var fs = require('fs');
var logger = require('./logger')(module);

module.exports = {

    randomKey: function(length){

        return crypto.randomBytes(length).toString('base64');

    },

    render: function(res, content){

        res.writeHead(200, {
            'Content-Length': Buffer.byteLength(content),
            'Content-Type': 'text/html'
        });
        res.write(content);
        res.end();

    },

    renderDialog: function(client, res){

        fs.readFile(__dirname + '../../../views/oauthdialog.html', 'utf8', function(err, html){
            html = html.replace("##client.name##", client.name);
            module.exports.render(res, html);
        });

    },

    redirect: function(url, res, prefix){

        var redirectURL = url;
        if(prefix){
            redirectURL = prefix + url;
        }

        res.header('Location', redirectURL);
        res.send(302);

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