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

    ast = esprima.parse(source, {
        loc: true
    });

    syntaxDefinitions = getSyntaxDefinitions(settings);
    report = createReport(ast.loc);

    processTree(ast.body, undefined, undefined);

    calculateMetrics();

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
            operators: [ { identifier: '{}' } ],
            operands: [ { identifier: safeName } ],
            children: [ 'properties' ]
        },
        Property: {
            lloc: 1,
            operators: [ { identifier: ':' } ],
            children: [ 'key', 'value' ],
            getAssignedName: function (node) { return safeName(node.key); }
        },
        ThisExpression: {
            operands: [ { identifier: 'this' } ]
        },
        ArrayExpression: {
            operators: [ { identifier: '[]' } ],
            operands: [ { identifier: safeName } ],
            children: [ 'elements' ]
        },
        MemberExpression: {
            lloc: function (node) {
                return [
                    'ObjectExpression',
                    'ArrayExpression',
                    'FunctionExpression'
                ].indexOf(node.object.type) === -1 ? 0 : 1;
            },
            operators: [ { identifier: '.' } ],
            children: [ 'object', 'property' ]
        },
        CallExpression: getFunctionCallSyntaxDefinition('()'),
        NewExpression: getFunctionCallSyntaxDefinition('new'),
        ExpressionStatement: {
            lloc: 1,
            children: [ 'expression' ]
        },
        VariableDeclaration: {
            operators: [ { identifier: function (node) { return node.kind; } } ],
            children: [ 'declarations' ]
        },
        VariableDeclarator: {
            lloc: 1,
            operators: [ {
                identifier: '=',
                optional: function (node) {
                    return !!node.init;
                }
            } ],
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
        UnaryExpression: {
            operators: [ {
                identifier: function (node) {
                    return node.operator + ' (' + (node.prefix ? 'pre' : 'post') + 'fix)';
                }
            } ],
            children: [ 'argument' ]
        },
        UpdateExpression: {
            operators: [ {
                identifier: function (node) {
                    return node.operator + ' (' + (node.prefix ? 'pre' : 'post') + 'fix)';
                }
            } ],
            children: [ 'argument' ]
        },
        BinaryExpression: {
            operators: [ { identifier: function (node) { return node.operator; } } ],
            children: [ 'left', 'right' ]
        },
        LogicalExpression: {
            complexity: function (node) { return settings.logicalor && node.operator === '||' ? 1 : 0; },
            operators: [ { identifier: function (node) { return node.operator; } } ],
            children: [ 'left', 'right' ]
        },
        SequenceExpression: {
            children: [ 'expressions' ]
        },
        IfStatement: {
            lloc: function (node) { return node.alternate ? 2 : 1; },
            complexity: 1,
            operators: [ {
                identifier: 'if'
            }, {
                identifier: 'else',
                optional: function (node) { return !!node.alternate; }
            } ],
            children: [ 'test', 'consequent', 'alternate' ]
        },
        ConditionalExpression: {
            complexity: 1,
            operators: [ { identifier: ':?' } ],
            children: [ 'test', 'consequent', 'alternate' ]
        },
        SwitchStatement: {
            lloc: 1,
            operators: [ { identifier: 'switch' } ],
            children: [ 'discriminant', 'cases' ]
        },
        SwitchCase: {
            lloc: 1,
            complexity: function (node) { return settings.switchcase && node.test ? 1 : 0; },
            operators: [ {
                identifier: function (node) {
                    return node.test ? 'case' : 'default';
                }
            } ],
            children: [ 'test', 'consequent' ]
        },
        BreakStatement: getBreakContinueSyntaxDefinition('break'),
        ContinueStatement: getBreakContinueSyntaxDefinition('continue'),
        ForStatement: getLoopSyntaxDefinition('for', 1),
        ForInStatement: {
            lloc: 1,
            complexity: function (node) { return settings.forin ? 1 : 0; },
            operators: [ { identifier: 'forin' } ],
            children: [ 'left', 'right', 'body' ]
        },
        WhileStatement: getLoopSyntaxDefinition('while', 1),
        DoWhileStatement: getLoopSyntaxDefinition('dowhile', 2),
        FunctionDeclaration: getFunctionSyntaxDefinition(1),
        FunctionExpression: getFunctionSyntaxDefinition(0),
        ReturnStatement: {
            lloc: 1,
            operators: [ { identifier: 'return' } ],
            children: [ 'argument' ]
        },
        TryStatement: {
            lloc: 1,
            children: [ 'block', 'handlers' ]
        },
        CatchClause: {
            lloc: 1,
            complexity: function (node) { return settings.trycatch ? 1 : 0; },
            operators: [ { identifier: 'catch' } ],
            children: [ 'param', 'body' ]
        },
        ThrowStatement: {
            lloc: 1,
            operators: [ { identifier: 'throw' } ],
            children: [ 'argument' ]
        },
        WithStatement: {
            lloc: 1,
            operators: [ { identifier: 'with' } ],
            children: [ 'object', 'body' ]
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
        lloc: function (node) { return node.callee.type === 'FunctionExpression' ? 1 : 0; },
        operators: [ { identifier: type } ],
        children: [ 'arguments', 'callee' ]
    };
}

function getBreakContinueSyntaxDefinition (type) {
    return {
        lloc: 1,
        operators: [ { identifier: true } ],
        children: [ 'label' ]
    };
}

function getLoopSyntaxDefinition (type, lloc) {
    return {
        lloc: lloc,
        complexity: function (node) { return node.test ? 1 : 0; },
        operators: [ { identifier: type } ],
        children: [ 'init', 'test', 'update', 'body' ]
    };
}

function getFunctionSyntaxDefinition (lloc) {
    return {
        lloc: lloc,
        operators: [ { identifier: 'function' } ],
        operands: [ { identifier: function (node) { return safeName(node.id); } } ],
        children: [ 'params', 'body' ],
        isFunction: true
    };
}

function createReport (lines) {
    return {
        aggregate: createFunctionReport(undefined, lines),
        functions: []
    };
}

function createFunctionReport (name, lines) {
    return {
        name: name,
        lines: lines,
        complexity: {
            sloc: {
                physical: lines.end.line - lines.start.line + 1,
                logical: 0
            },
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
            processLloc(node, currentReport);
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

function processLloc (node, currentReport) {
    incrementCounter(node, 'lloc', incrementLogicalSloc, currentReport);
}

function incrementCounter (node, name, incrementFn, currentReport) {
    var amount = syntaxDefinitions[node.type][name];

    if (check.isNumber(amount)) {
        incrementFn(currentReport, amount);
    } else if (check.isFunction(amount)) {
        incrementFn(currentReport, amount(node));
    }
}

function incrementLogicalSloc (currentReport, amount) {
    report.aggregate.complexity.sloc.logical += amount;

    if (currentReport) {
        currentReport.complexity.sloc.logical += amount;
    }
}

function processComplexity (node, currentReport) {
    incrementCounter(node, 'complexity', incrementComplexity, currentReport);
}

function incrementComplexity (currentReport, amount) {
    report.aggregate.complexity.cyclomatic += amount;

    if (currentReport) {
        currentReport.complexity.cyclomatic += amount;
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

function calculateMetrics () {
    var i, data,
    
    metrics = {
        indices: {
            loc: 0,
            complexity: 1,
            effort: 2
        },
        sums: [ 0, 0, 0 ]
    };

    for (i = 0; i < report.functions.length; i += 1) {
        data = report.functions[i].complexity;
        
        calculateHalsteadMetrics(data.halstead);
        sumMaintainabilityMetrics(metrics, data);
    }

    calculateHalsteadMetrics(report.aggregate.complexity.halstead);
    if (i === 0) {
        // Sane handling of modules that contain no functions.
        sumMaintainabilityMetrics(metrics, report.aggregate.complexity);
        i = 1;
    }

    calculateMaintainabilityIndex(
        metrics.sums.map(
            function (sum) {
                return sum / i;
            }
        ),
        metrics.indices
    );
}

function calculateHalsteadMetrics (data) {
    data.length = data.operators.total + data.operands.total;
    data.vocabulary = data.operators.distinct + data.operands.distinct;
    data.difficulty =
        (data.operators.distinct / 2) *
        (data.operands.total / data.operands.distinct);
    data.volume = data.length * (Math.log(data.vocabulary) / Math.log(2));
    data.effort = data.difficulty * data.volume;
    data.bugs = data.volume / 3000;
    data.time = data.effort / 18;
}

function sumMaintainabilityMetrics (metrics, data) {
    metrics.sums[metrics.indices.loc] += data.sloc.logical;
    metrics.sums[metrics.indices.complexity] += data.cyclomatic;
    metrics.sums[metrics.indices.effort] += data.halstead.effort;
}

function calculateMaintainabilityIndex (averages, indices) {
    report.maintainability =
        171 -
        (3.42 * Math.log(averages[indices.effort])) -
        (0.23 * Math.log(averages[indices.complexity])) -
        (16.2 * Math.log(averages[indices.loc]));
}

