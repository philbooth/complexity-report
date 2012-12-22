/*globals require, exports */

'use strict';

var traits = require('./traits');

exports.get = get;

function get () {
    return traits.actualise(
        function (node) {
            return [
                'ObjectExpression',
                'ArrayExpression',
                'FunctionExpression'
            ].indexOf(node.object.type) === -1 ? 0 : 1;
        },
        0, '.', undefined, [ 'object', 'property' ]
    );
}

