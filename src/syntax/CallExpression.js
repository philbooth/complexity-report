/*globals require, exports */

'use strict';

var traits = require('./traits'), amdPathAliases = {};

exports.get = get;

function get () {
    return traits.actualise(
        function (node) {
            return node.callee.type === 'FunctionExpression' ? 1 : 0;
        },
        0, '()', undefined, [ 'arguments', 'callee' ], undefined, undefined,
        function (node, clearAliases) {
            if (clearAliases) {
                // TODO: This prohibits async running. Refine by passing in module id as key for amdPathAliases.
                amdPathAliases = {};
            }

            if (node.callee.type === 'Identifier' && node.callee.name === 'require') {
                return processRequire(node);
            }

            if (
                node.callee.type === 'MemberExpression' &&
                node.callee.object.type === 'Identifier' &&
                node.callee.object.name === 'require' &&
                node.callee.property.type === 'Identifier' &&
                node.callee.property.name === 'config'
            ) {
                processAmdRequireConfig(node.arguments);
            }
        }
    );
}

function processRequire (node) {
    if (node.arguments.length === 1) {
        return processCommonJsRequire(node);
    }

    if (node.arguments.length === 2) {
        return processAmdRequire(node);
    }
}

function processCommonJsRequire (node) {
    return createDependency(node, resolveRequireDependency(node.arguments[0]), 'CommonJS');
}

function resolveRequireDependency (dependency, resolver) {
    if (dependency.type === 'Literal') {
        if (typeof resolver === 'function') {
            return resolver(dependency.value);
        }

        return dependency.value;
    }

    return '* dynamic dependency *';
}

function createDependency (node, path, type) {
    return {
        line: node.loc.start.line,
        path: path,
        type: type
    };
}

function processAmdRequire (node) {
    if (node.arguments[0].type === 'ArrayExpression') {
        return node.arguments[0].elements.map(processAmdRequireItem.bind(null, node));
    }

    if (node.arguments[0].type === 'Literal') {
        return processAmdRequireItem(node, node.arguments[0]);
    }

    return createDependency(node, '* dynamic dependencies *', 'AMD');
}

function processAmdRequireItem (node, item) {
    return createDependency(node, resolveRequireDependency(item, resolveAmdRequireDependency), 'AMD');
}

function resolveAmdRequireDependency (dependency) {
    return amdPathAliases[dependency] || dependency;
}

function processAmdRequireConfig (args) {
    if (args.length === 1 && args[0].type === 'ObjectExpression') {
        args[0].properties.forEach(processAmdRequireConfigProperty);
    }
}

function processAmdRequireConfigProperty (property) {
    if (property.key.type === 'Identifier' && property.key.name === 'paths' && property.value.type === 'ObjectExpression') {
        property.value.properties.forEach(setAmdPathAlias);
    }
}

function setAmdPathAlias (alias) {
    if (alias.key.type === 'Identifier' && alias.value.type === 'Literal') {
        amdPathAliases[alias.key.name] = alias.value.value;
    }
}

