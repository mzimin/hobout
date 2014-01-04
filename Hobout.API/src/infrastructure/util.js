var crypto = require('crypto');
var fs = require('fs');


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

    format: function(string, dataToReplace){
        var result = string;
        if(string && dataToReplace && dataToReplace.length > 0){
            for(var i = 0; i < dataToReplace.length; i++){
                result = result.replace('{'+i+'}', dataToReplace[i]);
            }
        }
        return result;
    }


};