/**
 * Complexity reporting tool for JavaScript.
 */

/*globals exports, require */

(function () {
    'use strict';

    var check, esprima, syntax, report, operators, operands;

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

        syntax = getSyntaxDefinitions(settings);
        report = createReport();
        operators = {};
        operands = {};

        ast = esprima.parse(source, {
            loc: true
        });

        processTree(ast.body, undefined, {}, {});

        console.log('\n');
        console.dir(operators);
        console.dir(operands);

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
        return {
            IfStatement: {
                complexity: true, // incrementComplexity
                operators: [ // operatorEncountered
                    { name: 'if' },
                    {
                        name: 'else',
                        optional: function (node) {
                            return !!node.alternate;
                        }
                    }
                ],
                children: [ 'test', 'consequent', 'alternate' ] // processTree / processNode
            },
            ConditionalExpression: {
                complexity: true,
                operators: [
                    { name: ':?' }
                ],
                children: [ 'test', 'consequent', 'alternate' ]
            },
            BlockStatement: {
                children: [ 'body' ]
            },
            LogicalExpression: {
                complexity: function (node) {
                    return settings.logicalor && node.operator === '||';
                },
                operators: [
                    {
                        name: function (node) {
                            return node.operator;
                        }
                    }
                ],
                children: [ 'left', 'right' ]
            },
            SwitchStatement: {
                operators: [
                    { name: 'switch' }
                ],
                children: [ 'discriminant', 'cases' ]
            },
            SwitchCase: {
                complexity: function (node) {
                    return settings.switchcase && node.test;
                },
                operators: [
                    {
                        name: function (node) {
                            return node.test ? 'case' : 'default';
                        }
                    }
                ],
                children: [ 'test', 'consequent' ]
            },
            BreakStatement: {
                operators: [
                    { name: 'break' }
                ]
            },
            ForStatement: getLoopSyntaxDefinition('for'),
            ForInStatement: {
                complexity: function (node) {
                    return settings.forin;
                },
                operators: [
                    { name: 'forin' }
                ],
                children: [ 'left', 'right', 'body' ]
            },
            WhileStatement: getLoopSyntaxDefinition('while'),
            DoWhileStatement: getLoopSyntaxDefinition('dowhile'),
            TryStatement: {
                children: [ 'block', 'handlers' ]
            },
            CatchClause: {
                complexity: function (node) {
                    return settings.trycatch;
                },
                operators: [
                    { name: 'catch' }
                ],
                children: [ 'param', 'body' ]
            },
            FunctionDeclaration: processFunction,
            FunctionExpression: processFunction,
            VariableDeclaration: {
                operators: [
                    {
                        name: function (node) {
                            return node.kind;
                        }
                    }
                ],
                children: [ 'declarations' ]
            },
            VariableDeclarator: processVariable,
            Literal: {
                operands: [
                    {
                        name: function (node) {
                            if (check.isString(node.value)) {
                                // Avoid conflicts between string literals and identifiers.
                                return '"' + node.value + '"';
                            }

                            return node.value;
                        }
                    }
                ]
            },
            ReturnStatement: {
                children: [ 'argument' ]
            },
            ExpressionStatement: {
                children: [ 'expression' ]
            },
            CallExpression: {
                operators: [
                    { name: '()' }
                ],
                children: [ 'arguments', 'callee' ]
            },
            MemberExpression: {
                operators: [
                    {
                        name: function (node) {
                            return '.';
                        }
                    }
                ],
                children: [ 'object', 'property' ]
            },
            Identifier: {
                operands: [
                    {
                        name: function (node) {
                            return node.name;
                        }
                    }
                ]
            },
            AssignmentExpression: processAssignment,
            BinaryExpression: {
                operators: [
                    {
                        name: function (node) {
                            return node.operator;
                        }
                    }
                ],
                children: [ 'left', 'right' ]
            },
            ObjectExpression: {
                operands: [
                    { name: safeName }
                ],
                children: [ 'properties' ]
            },
            Property: processProperty
        };
    }

    function getLoopSyntaxDefinition (type) {
        return {
            complexity: function (node) {
                return !!node.test;
            },
            operators: [
                { name: type }
            ],
            children: [ 'init', 'test', 'update', 'body' ]
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

    function processTree (tree, currentReport, currentOperators, currentOperands) {
        var i;

        check.verifyArray(tree, 'Invalid syntax tree');

        for (i = 0; i < tree.length; i += 1) {
            processNode(tree[i], currentReport, currentOperators, currentOperands);
        }
    }

    function processNode (node, currentReport, currentOperators, currentOperands) {
        if (check.isObject(node)) {
            if (check.isFunction(syntax[node.type])) {
                syntax[node.type](node, currentReport, currentOperators, currentOperands);
            } else {
                processSyntax(node, currentReport, currentOperators, currentOperands);
            }
        }
    }

    function processSyntax (node, currentReport, currentOperators, currentOperands) {
        var current = syntax[node.type];

        if (check.isObject(current)) {
            processComplexity(node, currentReport);
            processOperators(node, currentOperators, currentReport);
            processOperands(node, currentOperands, currentReport);
            processChildren(node, currentReport, currentOperators, currentOperands);
        }
    }

    function processComplexity (node, currentReport) {
        var currentSyntax = syntax[node.type];

        if (
            currentSyntax.complexity === true ||
            (
                check.isFunction(currentSyntax.complexity) &&
                currentSyntax.complexity(node)
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
        var currentSyntax = syntax[node.type], i, name;

        if (check.isArray(currentSyntax[metric])) {
            for (i = 0; i < currentSyntax[metric].length; i += 1) {
                if (check.isFunction(currentSyntax[metric][i].name)) {
                    name = currentSyntax[metric][i].name(node);
                } else {
                    name = currentSyntax[metric][i].name;
                }

                if (
                    check.isFunction(currentSyntax[metric][i].optional) === false ||
                    currentSyntax[metric][i].optional(node) === true
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
            // HACK: Avoid clashes with built-in property names.
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

    function processChildren (node, currentReport, currentOperators, currentOperands) {
        var currentSyntax = syntax[node.type], i, child, fn;

        if (check.isArray(currentSyntax.children)) {
            for (i = 0; i < currentSyntax.children.length; i += 1) {
                child = node[currentSyntax.children[i]];
                fn = check.isArray(child) ? processTree : processNode;
                fn(child, currentReport, currentOperators, currentOperands);
            }
        }
    }

    function processFunction (fn, currentReport, currentOperators, currentOperands) {
        processFunctionWithName(fn, safeName(fn.id));
    }

    function safeName (object) {
        if (check.isObject(object) && check.isUnemptyString(object.name)) {
            return object.name;
        }

        return '<anonymous>';
    }

    function processFunctionWithName (fn, name) {
        var currentReport = createFunctionReport(name, fn.loc),
            currentOperators = {},
            currentOperands = {};

        report.functions.push(currentReport);

        processNode(fn.id, currentReport, currentOperators, currentOperands);
        processTree(fn.params, currentReport, currentOperators, currentOperands);
        processNode(fn.body, currentReport, currentOperators, currentOperands);
    }

    function processVariable (variable, currentReport, currentOperators, currentOperands) {
        if (variable.init) {
            processAssignmentWithFName({
                operator: '=',
                left: variable.id,
                right: variable.init
            }, safeName(variable.id), currentReport, currentOperators, currentOperands);
        } else {
            processNode(variable.id, currentReport, currentOperators, currentOperands);
        }
    }

    function processAssignmentWithFName (assignment, fname, currentReport, currentOperators, currentOperands) {
        operatorEncountered(assignment.operator, currentOperators, currentReport);

        processNode(assignment.left, currentReport, currentOperators, currentOperands);
        
        if (
            assignment.right.type === 'FunctionExpression' &&
            check.isObject(assignment.right.id) === false
        ) {
            processFunctionWithName(assignment.right, fname);
        } else {
            processNode(assignment.right, currentReport, currentOperators, currentOperands);
        }
    }

    function processAssignment (expression, currentReport, currentOperators, currentOperands) {
        var fname;

        if (expression.left.type === 'MemberExpression') {
            fname = safeName(expression.left.object) + '.' + expression.left.property.name;
        } else {
            fname = safeName(expression.left.id);
        }

        processAssignmentWithFName(expression, fname, currentReport, currentOperators, currentOperands);
    }

    function operatorEncountered (name, currentOperators, currentReport) {
        halsteadItemEncountered (name, currentOperators, operators, currentReport, 'operators')
    }

    function processProperty (property, currentReport, currentOperators, currentOperands) {
        processAssignmentWithFName({
            operator: ':',
            left: property.key,
            right: property.value
        }, safeName(property.key), currentReport, currentOperators, currentOperands);
    }
}());

