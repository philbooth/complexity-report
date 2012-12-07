/*globals require, exports */

'use strict';

var operand = require('./operand');

exports.actualise = actualiseOperands;

function actualiseOperands (identifiers) {
    var i, operands = [];

    for (i = 0; i < identifiers.length; i += 1) {
        operands.push(operand.actualise(identifiers[i]));
    }

    return operands;
}

