'use strict';

var config = {};
var files = ['hook'];

for (var file in files) {
    var c;
    try {
        c = require(file + '-prod');
    } catch (err) {
        c = require(file + '-dev');
    }
    config[file] = c;
}

module.exports = config;
