'use strict';

const config = require('config');

let c = {
    auth: config.get('auth'),
    hook: config.get('hook')
};

// https://sub.domain.domain.tld/token-as:secret-path
c.hook.path = '/' + c.auth.token;
c.hook.url = 'https://' + c.hook.host + c.hook.path;

module.exports = c;
