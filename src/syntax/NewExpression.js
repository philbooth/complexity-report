/*globals require, exports */

'use strict';

var traits = require('./traits');

exports.get = get;

function get () {
    return traits.actualise(
        function (node) {
            return node.callee.type === 'FunctionExpression' ? 1 : 0;
        },
        0, 'new', undefined, [ 'arguments', 'callee' ]
    );
}

