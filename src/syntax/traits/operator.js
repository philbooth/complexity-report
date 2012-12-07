/*globals exports */

'use strict';

exports.actualise = actualiseOperator;

function actualiseOperator (identifier, filter) {
    return {
        identifier: identifier,
        filter: filter
    }
}

