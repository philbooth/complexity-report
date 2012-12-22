/*globals require, exports */

'use strict';

exports.actualise = actualiseOperands;

function actualiseOperands (identifiers) {
    var operands = [], i;

    for (i = 0; i < identifiers.length; i += 1) {
        operands.push({
            identifier: identifiers[i]
        });
    }

    return operands;
}

