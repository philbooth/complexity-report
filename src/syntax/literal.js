/*globals require, exports */

'use strict';

var traits = require('./traits'),
    check = require('check-types');

exports.get = getLiteral;

function getLiteral () {
    return traits.actualiseOperand(function (node) {
        if (check.isString(node.value)) {
            // Avoid conflicts between string literals and identifiers.
            return '"' + node.value + '"';
        }

        return node.value;
    });
}

