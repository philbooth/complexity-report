/*globals require, exports */

'use strict';

var traits = require('./traits'), dependencies = {};

exports.get = get;

function get () {
    return traits.actualise(
        function (node) {
            return node.callee.type === 'FunctionExpression' ? 1 : 0;
        },
        0, '()', undefined, [ 'arguments', 'callee' ], undefined, undefined,
        function (node, clearDependencies) {
            if (clearDependencies) {
                // TODO: This prohibits async running. Refine by passing in module id as key for dependency map map.
                dependencies = {};
            }

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
                                path: item.type === 'Literal' ? dependencies[item.value] || item.value : '* dynamic dependency *'
                            };
                        });
                    }

                    return {
                        line: node.loc.start.line,
                        path: '* dynamic dependencies *'
                    };
                }

                return;
            }

            if (
                node.callee.type === 'MemberExpression' &&
                node.callee.object.type === 'Identifier' &&
                node.callee.object.name === 'require' &&
                node.callee.property.type === 'Identifier' &&
                node.callee.property.name === 'config' &&
                node.arguments.length === 1 &&
                node.arguments[0].type === 'ObjectExpression' &&
                Array.isArray(node.arguments[0].properties)
            ) {
                node.arguments[0].properties.forEach(function (p) {
                    if (
                        p.key.type === 'Identifier' &&
                        p.key.name === 'paths' &&
                        p.value.type === 'ObjectExpression' &&
                        Array.isArray(p.value.properties)
                    ) {
                        p.value.properties.forEach(function (pp) {
                            if (pp.key.type === 'Identifier' && pp.value.type === 'Literal') {
                                dependencies[pp.key.name] = pp.value.value;
                            }
                        });
                    }
                });
            }
        }
    );
}

