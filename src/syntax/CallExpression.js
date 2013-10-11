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
            if (node.callee.type === 'Identifier' && node.callee.name === 'require') {
                if (node.arguments.length === 1) {
                    return {
                        line: node.loc.start.line,
                        path: node.arguments[0].type === 'Literal' ? node.arguments[0].value : '* dynamic dependency *'
                    };
                }

                if (node.arguments.length === 2) {
                    if (node.arguments[0].type === 'ArrayExpression') {
                        return node.arguments[0].elements.map(function (item) {
                            return {
                                line: node.loc.start.line,
                                path: item.type === 'Literal' ? item.value : '* dynamic dependency *'
                            };
                        });
                    }

                    return {
                        line: node.loc.start.line,
                        path: '* dynamic dependencies *'
                    };
                }
            }
        }
    );
}

