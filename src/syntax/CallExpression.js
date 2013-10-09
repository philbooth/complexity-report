/*globals require, exports */

'use strict';

var traits = require('./traits');

exports.get = get;

function get () {
    return traits.actualise(
        function (node) {
            return node.callee.type === 'FunctionExpression' ? 1 : 0;
        },
        0, '()', undefined, [ 'arguments', 'callee' ], undefined, undefined,
        function (node) {
            if (node.callee.type === 'Identifier' &&
                node.callee.name === 'require' &&
                node.arguments.length === 1 &&
                node.arguments[0].type === 'Literal'
            ) {
                return {
                    line: node.loc.start.line,
                    path: node.arguments[0].value
                };
            }
        }
    );
}

