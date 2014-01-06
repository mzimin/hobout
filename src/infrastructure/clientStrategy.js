/**
 * Module dependencies.
 */
var passport = require('passport')
    , util = require('util');

/**
 * `ClientStrategy` constructor.
 *
 * @api protected
 */
function Strategy(options, verify) {
    if (typeof options == 'function') {
        verify = options;
        options = {};
    }
    if (!verify) throw new Error('OAuth 2.0 client strategy requires a verify function');

    passport.Strategy.call(this);
    this.name = 'oauth2-client';
    this._verify = verify;
    this._passReqToCallback = options.passReqToCallback;
}

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(Strategy, passport.Strategy);

/**
 * Authenticate request based on client credentials in the request body.
 *
 * @param {Object} req
 * @api protected
 */
Strategy.prototype.authenticate = function(req) {
    if (!req.body || (!req.body['client_id'])) {
        return this.fail();
    }

    var clientId = req.body['client_id'];
    var clientSecret = req.body['client_secret'] || null;

    var self = this;

    function verified(err, client, info) {
        if (err) { return self.error(err); }
        if (!client) { return self.fail(); }
        self.success(client, info);
    }

    if (self._passReqToCallback) {
        this._verify(req, clientId, clientSecret, verified);
    } else {
        this._verify(clientId, clientSecret, verified);
    }
}

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
