/*globals exports */

'use strict';

exports.actualise = actualiseOperands;

function actualiseOperands (identifiers) {
    return identifiers.map(function (identifier) {
        return { identifier: identifier };
    });
}

