/*globals require, exports */

'use strict';

var check = require('check-types');

exports.actualise = actualiseOperators;

function actualiseOperators (properties) {
    var operators = [], i, property;

    return properties.map(function (property) {
        if (check.isObject(property) && typeof property.identifier !== 'undefined') {
            return property;
        }

        return { identifier: property };
    });
}

