/*globals require, exports */

'use strict';

var check = require('check-types');

exports.actualise = actualiseOperators;

function actualiseOperators (properties) {
    var operators = [], i, property;

    for (i = 0; i < properties.length; i += 1) {
        property = properties[i];

        if (check.isObject(property) && typeof property.identifier !== 'undefined') {
            operators.push(property);
        } else {
            operators.push({
                identifier: property
            });
        }
    }

    return operators;
}

