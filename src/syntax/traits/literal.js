/*globals module */

'use strict';

module.exports = {
    operands: [
        {
            identifier: function (node) {
                if (check.isString(node.value)) {
                    // Avoid conflicts between string literals and identifiers.
                    return '"' + node.value + '"';
                }

                return node.value;
            }
        }
    ]
};

