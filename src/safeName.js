/*globals require, module */

'use strict';

var check = require('check-types');

module.exports = function (object, defaultName) {
    if (check.isObject(object) && check.isUnemptyString(object.name)) {
        return object.name;
    }

    if (check.isUnemptyString(defaultName)) {
        return defaultName;
    }

    return '<anonymous>';
};
