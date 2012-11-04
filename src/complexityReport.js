/**
 * Complexity reporting tool for JavaScript.
 */

/*jshint globalstrict:true */
/*globals exports, require */

'use strict';

var check, esprima, syntaxDefinitions, report;

exports.run = run;

check = require('check-types');
esprima = require('esprima');

/**
 * Public function `run`.
 *
 * Returns a an object detailing the complexity of the code in the
 * source argument.
 *
 * @param source {string}    The source code to analyse for complexity.
 * @param [options] {object} Options to modify the complexity calculation.
 *
 */
function run (source, options) {
    var settings, ast;

    check.verifyUnemptyString(source, 'Invalid source');

    if (check.isObject(options)) {
        settings = options;
    } else {
        settings = getDefaultSettings();
    }

    syntaxDefinitions = getSyntaxDefinitions(settings);
    report = createReport();

    ast = esprima.parse(source, {
        loc: true
    });

    processTree(ast.body, undefined, undefined);

    return report;
}

function getDefaultSettings () {
    return {
        logicalor: true,
        switchcase: true,
        forin: false,
        trycatch: false
    };
}

function getSyntaxDefinitions (settings) {
    // TODO: Refactor to traits.
    return {
        Literal: {
            operands: [ {
                identifier: function (node) {
                    if (check.isString(node.value)) {
                        // Avoid conflicts between string literals and identifiers.
                        return '"' + node.value + '"';
                    }

                    return node.value;
                }
            } ]
        },
        Identifier: {
            operands: [ { identifier: function (node) { return node.name; } } ]
        },
        BlockStatement: {
            children: [ 'body' ]
        },
        ObjectExpression: {
            operands: [ { identifier: safeName } ],
            children: [ 'properties' ]
        },
        Property: {
            operators: [ { identifier: ':' } ],
            children: [ 'key', 'value' ],
            getAssignedName: function (node) { return safeName(node.key); }
        },
        ThisExpression: {
            operands: [ { identifier: 'this' } ]
        },
        MemberExpression: {
            operators: [ { identifier: function (node) { return '.'; } } ],
            children: [ 'object', 'property' ]
        },
        CallExpression: getFunctionCallSyntaxDefinition('()'),
        NewExpression: getFunctionCallSyntaxDefinition('new'),
        ExpressionStatement: {
            children: [ 'expression' ]
        },
        VariableDeclaration: {
            operators: [ { identifier: function (node) { return node.kind; } } ],
            children: [ 'declarations' ]
        },
        VariableDeclarator: {
            operators: [ { identifier: '=', optional: function (node) { return !!node.init; } } ],
            children: [ 'id', 'init' ],
            getAssignedName: function (node) { return safeName(node.id); }
        },
        AssignmentExpression: {
            operators: [ { identifier: function (node) { return node.operator; } } ],
            children: [ 'left', 'right' ],
            getAssignedName: function (node) {
                if (node.left.type === 'MemberExpression') {
                    return safeName(node.left.object) + '.' + node.left.property.name;
                }
                        
                return safeName(node.left.id);
            }
        },
        BinaryExpression: {
            operators: [ { identifier: function (node) { return node.operator; } } ],
            children: [ 'left', 'right' ]
        },
        LogicalExpression: {
            complexity: function (node) { return settings.logicalor && node.operator === '||'; },
            operators: [ { identifier: function (node) { return node.operator; } } ],
            children: [ 'left', 'right' ]
        },
        IfStatement: {
            complexity: true,
            operators: [
                { identifier: 'if' },
                { identifier: 'else', optional: function (node) { return !!node.alternate; } }
            ],
            children: [ 'test', 'consequent', 'alternate' ]
        },
        ConditionalExpression: {
            complexity: true,
            operators: [ { identifier: ':?' } ],
            children: [ 'test', 'consequent', 'alternate' ]
        },
        SwitchStatement: {
            operators: [ { identifier: 'switch' } ],
            children: [ 'discriminant', 'cases' ]
        },
        SwitchCase: {
            complexity: function (node) { return settings.switchcase && node.test; },
            operators: [ { identifier: function (node) { return node.test ? 'case' : 'default'; } } ],
            children: [ 'test', 'consequent' ]
        },
        BreakStatement: {
            operators: [ { identifier: 'break' } ]
        },
        ForStatement: getLoopSyntaxDefinition('for'),
        ForInStatement: {
            complexity: function (node) { return settings.forin; },
            operators: [ { identifier: 'forin' } ],
            children: [ 'left', 'right', 'body' ]
        },
        WhileStatement: getLoopSyntaxDefinition('while'),
        DoWhileStatement: getLoopSyntaxDefinition('dowhile'),
        FunctionDeclaration: getFunctionSyntaxDefinition(),
        FunctionExpression: getFunctionSyntaxDefinition(),
        ReturnStatement: {
            operators: [ { identifier: 'return' } ],
            children: [ 'argument' ]
        },
        TryStatement: {
            children: [ 'block', 'handlers' ]
        },
        CatchClause: {
            complexity: function (node) { return settings.trycatch; },
            operators: [ { identifier: 'catch' } ],
            children: [ 'param', 'body' ]
        },
        ThrowStatement: {
            operators: [ { identifier: 'throw' } ],
            children: [ 'argument' ]
        }
    };
}

function safeName (object, defaultName) {
    if (check.isObject(object) && check.isUnemptyString(object.name)) {
        return object.name;
    }

    if (check.isUnemptyString(defaultName)) {
        return defaultName;
    }

    return '<anonymous>';
}

function getFunctionCallSyntaxDefinition (type) {
    return {
        operators: [ { identifier: type } ],
        children: [ 'arguments', 'callee' ]
    };
}

function getLoopSyntaxDefinition (type) {
    return {
        complexity: function (node) { return !!node.test; },
        operators: [ { identifier: type } ],
        children: [ 'init', 'test', 'update', 'body' ]
    };
}

function getFunctionSyntaxDefinition () {
    return {
        operators: [ { identifier: 'function' } ],
        operands: [ { identifier: function (node) { return safeName(node.id); } } ],
        children: [ 'params', 'body' ],
        isFunction: true
    };
}

function createReport () {
    return {
        aggregate: createFunctionReport(),
        functions: []
    };
}

function createFunctionReport (name, lines) {
    return {
        name: name,
        lines: lines,
        complexity: {
            cyclomatic: 1,
            halstead: createInitialHalsteadState()
        }
    };
}

function createInitialHalsteadState () {
    return {
        operators: createInitialHalsteadItemState(),
        operands: createInitialHalsteadItemState()
    };
}

function createInitialHalsteadItemState () {
    return {
        distinct: 0,
        total: 0,
        identifiers: []
    };
}

function processTree (tree, assignedName, currentReport) {
    var i;

    check.verifyArray(tree, 'Invalid syntax tree');

    for (i = 0; i < tree.length; i += 1) {
        processNode(tree[i], assignedName, currentReport);
    }
}

function processNode (node, assignedName, currentReport) {
    var def;

    if (check.isObject(node)) {
        def = syntaxDefinitions[node.type];
        
        if (check.isObject(syntaxDefinitions[node.type])) {
            processComplexity(node, currentReport);
            processOperators(node, currentReport);
            processOperands(node, currentReport);
            
            if (def.isFunction) {
                processChildrenInNewScope(node, assignedName);
            } else {
                processChildren(node, currentReport);
            }
        }
    }
}

function processComplexity (node, currentReport) {
    var def = syntaxDefinitions[node.type];

    if (
        def.complexity === true ||
        (
            check.isFunction(def.complexity) &&
            def.complexity(node)
        )
    ) {
        incrementComplexity(currentReport);
    }
}

function incrementComplexity (currentReport) {
    report.aggregate.complexity.cyclomatic += 1;

    if (currentReport) {
        currentReport.complexity.cyclomatic += 1;
    }
}

function processOperators (node, currentReport) {
    processHalsteadMetric(node, 'operators', currentReport);
}

function processOperands (node, currentReport) {
    processHalsteadMetric(node, 'operands', currentReport);
}

function processHalsteadMetric (node, metric, currentReport) {
    var def = syntaxDefinitions[node.type], i, identifier;

    if (check.isArray(def[metric])) {
        for (i = 0; i < def[metric].length; i += 1) {
            if (check.isFunction(def[metric][i].identifier)) {
                identifier = def[metric][i].identifier(node);
            } else {
                identifier = def[metric][i].identifier;
            }

            if (
                check.isFunction(def[metric][i].optional) === false ||
                def[metric][i].optional(node) === true
            ) {
                halsteadItemEncountered(currentReport, metric, identifier);
            }
        }
    }
}

function halsteadItemEncountered (currentReport, metric, identifier) {
    if (currentReport) {
        incrementHalsteadItems(currentReport, metric, identifier);
    }

    incrementHalsteadItems(report.aggregate, metric, identifier);
}

function incrementHalsteadItems (baseReport, metric, identifier) {
    incrementDistinctHalsteadItems(baseReport, metric, identifier);
    incrementTotalHalsteadItems(baseReport, metric);
}

function incrementDistinctHalsteadItems (baseReport, metric, identifier) {
    if (Object.prototype.hasOwnProperty(identifier)) {
        // Avoid clashes with built-in property names.
        incrementDistinctHalsteadItems(baseReport, metric, '_' + identifier);
    } else if (isHalsteadMetricDistinct(baseReport, metric, identifier)) {
        recordDistinctHalsteadMetric(baseReport, metric, identifier);
        incrementHalsteadMetric(baseReport, metric, 'distinct');
    }
}

function isHalsteadMetricDistinct (baseReport, metric, identifier) {
    return baseReport.complexity.halstead[metric].identifiers.indexOf(identifier) === -1;
}

function recordDistinctHalsteadMetric (baseReport, metric, identifier) {
    baseReport.complexity.halstead[metric].identifiers.push(identifier);
}

function incrementHalsteadMetric (baseReport, metric, type) {
    if (baseReport) {
        baseReport.complexity.halstead[metric][type] += 1;
    }
}

function incrementTotalHalsteadItems (baseReport, metric) {
    incrementHalsteadMetric(baseReport, metric, 'total');
}

function processChildrenInNewScope (node, assignedName) {
    var newReport = createFunctionReport(safeName(node.id, assignedName), node.loc);

    report.functions.push(newReport);

    processChildren(node, newReport);
}

function processChildren (node, currentReport) {
    var def = syntaxDefinitions[node.type], i;

    if (check.isArray(def.children)) {
        for (i = 0; i < def.children.length; i += 1) {
            processChild(
                node[def.children[i]],
                check.isFunction(def.getAssignedName) ? def.getAssignedName(node) : '',
                currentReport
            );
        }
    }
}

function processChild (child, assignedName, currentReport) {
    var fn = check.isArray(child) ? processTree : processNode;
    fn(child, assignedName, currentReport);
}

