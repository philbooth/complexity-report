/*globals require, exports */

'use strict';

var operand = require('./operand');

exports.actualise = actualiseOperators;

function actualiseOperators (properties) {
    var i, operators = [];

    for (i = 0; i < properties.length; i += 1) {
        operators.push(operator.actualise(properties[i].identifier, properties[i].filter));
    }

    return operators;
}

