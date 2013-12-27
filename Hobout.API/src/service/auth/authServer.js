var oauth2orize = require('oauth2orize');
var passport = require('passport');
var UserModel = require('../../models/user');
var ApplicationModel = require('../../models/application');

var server = oauth2orize.createServer();

// Exchange username & password for access token.


server.grant(oauth2orize.grant.code(function(client, redirectURI, user, ares, done) {
    var code = utils.uid(16)

    db.authorizationCodes.save(code, client.id, redirectURI, user.id, function(err) {
        if (err) { return done(err); }
        done(null, code);
    });
}));

// Grant implicit authorization.  The callback takes the `client` requesting
// authorization, the authenticated `user` granting access, and
// their response, which contains approved scope, duration, etc. as parsed by
// the application.  The application issues a token, which is bound to these
// values.

server.grant(oauth2orize.grant.token(function(client, user, ares, done) {
    var token = utils.uid(256);

    db.accessTokens.save(token, user.id, client.clientId, function(err) {
        if (err) { return done(err); }
        done(null, token);
    });
}));

// Exchange authorization codes for access tokens.  The callback accepts the
// `client`, which is exchanging `code` and any `redirectURI` from the
// authorization request for verification.  If these values are validated, the
// application issues an access token on behalf of the user who authorized the
// code.

server.exchange(oauth2orize.exchange.code(function(client, code, redirectURI, done) {
    db.authorizationCodes.find(code, function(err, authCode) {
        if (err) { return done(err); }
        if (client.id !== authCode.clientID) { return done(null, false); }
        if (redirectURI !== authCode.redirectURI) { return done(null, false); }

        var token = utils.uid(256)
        db.accessTokens.save(token, authCode.userID, authCode.clientID, function(err) {
            if (err) { return done(err); }
            done(null, token);
        });
    });
}));

// Exchange user id and password for access tokens.  The callback accepts the
// `client`, which is exchanging the user's name and password from the
// authorization request for verification. If these values are validated, the
// application issues an access token on behalf of the user who authorized the code.

server.exchange(oauth2orize.exchange.password(function(client, username, password, scope, done) {

    //Validate the client
    db.clients.findByClientId(client.clientId, function(err, localClient) {
        if (err) { return done(err); }
        if(localClient === null) {
            return done(null, false);
        }
        if(localClient.clientSecret !== client.clientSecret) {
            return done(null, false);
        }
        //Validate the user
        db.users.findByUsername(username, function(err, user) {
            if (err) { return done(err); }
            if(user === null) {
                return done(null, false);
            }
            if(password !== user.password) {
                return done(null, false);
            }
            //Everything validated, return the token
            var token = utils.uid(256);
            db.accessTokens.save(token, user.id, client.clientId, function(err) {
                if (err) { return done(err); }
                done(null, token);
            });
        });
    });
}));

// Exchange the client id and password/secret for an access token.  The callback accepts the
// `client`, which is exchanging the client's id and password/secret from the
// authorization request for verification. If these values are validated, the
// application issues an access token on behalf of the client who authorized the code.

server.exchange(oauth2orize.exchange.clientCredentials(function(client, scope, done) {

    //Validate the client
    db.clients.findByClientId(client.clientId, function(err, localClient) {
        if (err) { return done(err); }
        if(localClient === null) {
            return done(null, false);
        }
        if(localClient.clientSecret !== client.clientSecret) {
            return done(null, false);
        }
        var token = utils.uid(256);
        //Pass in a null for user id since there is no user with this grant type
        db.accessTokens.save(token, null, client.clientId, function(err) {
            if (err) { return done(err); }
            done(null, token);
        });
    });
}));