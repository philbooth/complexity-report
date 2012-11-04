/**
 * Complexity reporting tool for JavaScript.
 */

/*globals exports, require */

(function () {
    'use strict';

    var check, esprima, syntaxDefinitions, report, operators, operands;

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
        operators = {};
        operands = {};

        ast = esprima.parse(source, {
            loc: true
        });

        processTree(ast.body, undefined, undefined, {}, {});

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
                    name: function (node) {
                        if (check.isString(node.value)) {
                            // Avoid conflicts between string literals and identifiers.
                            return '"' + node.value + '"';
                        }

                        return node.value;
                    }
                } ]
            },
            Identifier: {
                operands: [ { name: function (node) { return node.name; } } ]
            },
            BlockStatement: {
                children: [ 'body' ]
            },
            ObjectExpression: {
                operands: [ { name: safeName } ],
                children: [ 'properties' ]
            },
            Property: {
                operators: [ { name: ':' } ],
                children: [ 'key', 'value' ],
                getAssignedName: function (node) { return safeName(node.key); }
            },
            ThisExpression: {
                operands: [ { name: 'this' } ]
            },
            MemberExpression: {
                operators: [ { name: function (node) { return '.'; } } ],
                children: [ 'object', 'property' ]
            },
            CallExpression: getFunctionCallSyntaxDefinition('()'),
            NewExpression: getFunctionCallSyntaxDefinition('new'),
            ExpressionStatement: {
                children: [ 'expression' ]
            },
            VariableDeclaration: {
                operators: [ { name: function (node) { return node.kind; } } ],
                children: [ 'declarations' ]
            },
            VariableDeclarator: {
                operators: [ { name: '=', optional: function (node) { return !!node.init; } } ],
                children: [ 'id', 'init' ],
                getAssignedName: function (node) { return safeName(node.id); }
            },
            AssignmentExpression: {
                operators: [ { name: function (node) { return node.operator; } } ],
                children: [ 'left', 'right' ],
                getAssignedName: function (node) {
                    if (node.left.type === 'MemberExpression') {
                        return safeName(node.left.object) + '.' + node.left.property.name;
                    }
                            
                    return safeName(node.left.id);
                }
            },
            BinaryExpression: {
                operators: [ { name: function (node) { return node.operator; } } ],
                children: [ 'left', 'right' ]
            },
            LogicalExpression: {
                complexity: function (node) { return settings.logicalor && node.operator === '||'; },
                operators: [ { name: function (node) { return node.operator; } } ],
                children: [ 'left', 'right' ]
            },
            IfStatement: {
                complexity: true,
                operators: [
                    { name: 'if' },
                    { name: 'else', optional: function (node) { return !!node.alternate; } }
                ],
                children: [ 'test', 'consequent', 'alternate' ]
            },
            ConditionalExpression: {
                complexity: true,
                operators: [ { name: ':?' } ],
                children: [ 'test', 'consequent', 'alternate' ]
            },
            SwitchStatement: {
                operators: [ { name: 'switch' } ],
                children: [ 'discriminant', 'cases' ]
            },
            SwitchCase: {
                complexity: function (node) { return settings.switchcase && node.test; },
                operators: [ { name: function (node) { return node.test ? 'case' : 'default'; } } ],
                children: [ 'test', 'consequent' ]
            },
            BreakStatement: {
                operators: [ { name: 'break' } ]
            },
            ForStatement: getLoopSyntaxDefinition('for'),
            ForInStatement: {
                complexity: function (node) { return settings.forin; },
                operators: [ { name: 'forin' } ],
                children: [ 'left', 'right', 'body' ]
            },
            WhileStatement: getLoopSyntaxDefinition('while'),
            DoWhileStatement: getLoopSyntaxDefinition('dowhile'),
            FunctionDeclaration: getFunctionSyntaxDefinition(),
            FunctionExpression: getFunctionSyntaxDefinition(),
            ReturnStatement: {
                operators: [ { name: 'return' } ],
                children: [ 'argument' ]
            },
            TryStatement: {
                children: [ 'block', 'handlers' ]
            },
            CatchClause: {
                complexity: function (node) { return settings.trycatch; },
                operators: [ { name: 'catch' } ],
                children: [ 'param', 'body' ]
            },
            ThrowStatement: {
                operators: [ { name: 'throw' } ],
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
            operators: [ { name: type } ],
            children: [ 'arguments', 'callee' ]
        };
    }

    function getLoopSyntaxDefinition (type) {
        return {
            complexity: function (node) { return !!node.test; },
            operators: [ { name: type } ],
            children: [ 'init', 'test', 'update', 'body' ]
        };
    }

    function getFunctionSyntaxDefinition () {
        return {
            operators: [ { name: 'function' } ],
            operands: [ { name: function (node) { return safeName(node.id); } } ],
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
            total: 0
        };
    }

    function processTree (tree, assignedName, currentReport, currentOperators, currentOperands) {
        var i;

        check.verifyArray(tree, 'Invalid syntax tree');

        for (i = 0; i < tree.length; i += 1) {
            processNode(tree[i], assignedName, currentReport, currentOperators, currentOperands);
        }
    }

    function processNode (node, assignedName, currentReport, currentOperators, currentOperands) {
        var def;

        if (check.isObject(node)) {
            def = syntaxDefinitions[node.type];
            
            if (check.isObject(syntaxDefinitions[node.type])) {
                processComplexity(node, currentReport);
                processOperators(node, currentOperators, currentReport);
                processOperands(node, currentOperands, currentReport);
                
                if (def.isFunction) {
                    processChildrenInNewScope(node, assignedName);
                } else {
                    processChildren(node, currentReport, currentOperators, currentOperands);
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

    function processOperators (node, currentOperators, currentReport) {
        processHalsteadMetric(node, 'operators', operators, currentOperators, currentReport);
    }

    function processOperands (node, currentOperands, currentReport) {
        processHalsteadMetric(node, 'operands', operands, currentOperands, currentReport);
    }

    function processHalsteadMetric (node, metric, items, currentItems, currentReport) {
        var def = syntaxDefinitions[node.type], i, name;

        if (check.isArray(def[metric])) {
            for (i = 0; i < def[metric].length; i += 1) {
                if (check.isFunction(def[metric][i].name)) {
                    name = def[metric][i].name(node);
                } else {
                    name = def[metric][i].name;
                }

                if (
                    check.isFunction(def[metric][i].optional) === false ||
                    def[metric][i].optional(node) === true
                ) {
                    halsteadItemEncountered(name, currentItems, items, currentReport, metric);
                }
            }
        }
    }

    function halsteadItemEncountered (name, currentItems, items, currentReport, metric) {
        incrementHalsteadItems(name, currentItems, currentReport, metric);
        incrementHalsteadItems(name, items, report.aggregate, metric);
    }

    function incrementHalsteadItems (name, currentItems, baseReport, metric) {
        incrementDistinctHalsteadItems(name, currentItems, baseReport, metric);
        incrementTotalHalsteadItems(baseReport, metric);
    }

    function incrementDistinctHalsteadItems (name, currentItems, baseReport, metric) {
        if (Object.prototype.hasOwnProperty(name)) {
            // Avoid clashes with built-in property names.
            incrementDistinctHalsteadItems('_' + name, currentItems, baseReport, metric);
        } else if (!currentItems[name]) {
            incrementHalsteadMetric(baseReport, metric, 'distinct');
            currentItems[name] = true;
        }
    }

    function incrementTotalHalsteadItems (baseReport, metric) {
        incrementHalsteadMetric(baseReport, metric, 'total');
    }

    function incrementHalsteadMetric (baseReport, metric, type) {
        if (baseReport) {
            baseReport.complexity.halstead[metric][type] += 1;
        }
    }

    function processChildrenInNewScope (node, assignedName) {
        var newReport = createFunctionReport(safeName(node.id, assignedName), node.loc);

        report.functions.push(newReport);

        processChildren(node, newReport, {}, {});
    }

    function processChildren (node, currentReport, currentOperators, currentOperands) {
        var def = syntaxDefinitions[node.type], i;

        if (check.isArray(def.children)) {
            for (i = 0; i < def.children.length; i += 1) {
                processChild(
                    node[def.children[i]],
                    check.isFunction(def.getAssignedName) ? def.getAssignedName(node) : '',
                    currentReport,
                    currentOperators,
                    currentOperands
                );
            }
        }
    }

    function processChild (child, assignedName, currentReport, currentOperators, currentOperands) {
        var fn = check.isArray(child) ? processTree : processNode;
        fn(child, assignedName, currentReport, currentOperators, currentOperands);
    }
}());

