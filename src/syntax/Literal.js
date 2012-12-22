/*globals require, exports */

'use strict';

var traits = require('./traits'),
    check = require('check-types');

exports.get = get;

function get () {
    return traits.actualise(
        0, 0, undefined,
        function (node) {
            if (check.isString(node.value)) {
                // Avoid conflicts between string literals and identifiers.
                return '"' + node.value + '"';
            }

            return node.value;
        }
    );
}

