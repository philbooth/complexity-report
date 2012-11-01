/**
 * Complexity reporting tool for JavaScript.
 */

/*globals exports, require */

(function () {
    'use strict';

    var check, esprima, syntax, settings, report, operators, operands;

    exports.run = run;

    check = require('check-types');
    esprima = require('esprima');

    syntaxHandlers = {
        IfStatement: processCondition,
        ConditionalExpression: processCondition,
        BlockStatement: processBlock,
        LogicalExpression: processLogical,
        SwitchStatement: processSwitch,
        SwitchCase: processCase,
        BreakStatement: processBreak,
        ForStatement: processLoop,
        ForInStatement: processForIn,
        WhileStatement: processLoop,
        DoWhileStatement: processLoop,
        TryStatement: processTry,
        CatchClause: processCatch,
        FunctionDeclaration: processFunction,
        FunctionExpression: processFunction,
        VariableDeclaration: processVariables,
        VariableDeclarator: processVariable,
        Literal: processLiteral,
        ReturnStatement: processReturn,
        ExpressionStatement: processExpression,
        CallExpression: processCall,
        MemberExpression: processMember,
        Identifier: processIdentifier,
        AssignmentExpression: processAssignment,
        ObjectExpression: processObject,
        Property: processProperty
    };

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
            ],
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
            ForStatement: getLoopSyntaxDefinition(),
            ForInStatement: {
                complexity: function (node) {
                    return settings.forin;
                },
                operators: [
                    { name: 'forin' }
                ],
                children: [ 'body' ]
            },
            WhileStatement: getLoopSyntaxDefinition(),
            DoWhileStatement: getLoopSyntaxDefinition(),
            TryStatement: {
                children: [ 'block', 'handlers' ]
            },
            CatchClause: {
                complexity: function (node) {
                    return settings.trycatch;
                },
                children: [ 'body' ]
            },
            FunctionDeclaration: processFunction,
            FunctionExpression: processFunction,
            VariableDeclaration: {
                children: [ 'declarations' ]
            },
            VariableDeclarator: processVariable,
            Literal: {
                operands: [
                    {
                        name: function (node) {
                            if (check.isString(literal.value)) {
                                // Avoid conflicts between string literals and identifiers.
                                return '"' + literal.value + '"';
                            }

                            return literal.value;
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
                    { name: 'function call' }
                ],
                children: [ 'arguments', 'callee' ]
            },
            MemberExpression: {
                operators: [
                    { name: 'object member' }
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
            ObjectExpression: {
                children: [ 'properties' ]
            },
            Property: processVariable
        };
    }

    function getLoopSyntaxDefinition () {
        return {
            complexity: function (node) {
                return !!node.test;
            },
            operators: [
                { name: 'for' }
            ],
            children: [ 'body' ]
        };
    }

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
        var ast;

        check.verifyUnemptyString(source, 'Invalid source');

        if (check.isObject(options)) {
            settings = options;
        } else {
            settings = getDefaultSettings();
        }

        report = createReport();
        operators = {};
        operands = {};

        ast = esprima.parse(source, {
            loc: true
        });

        processTree(ast.body, undefined, {}, {});

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
            operators: createInitialOperatorOperandState(),
            operands: createInitialOperatorOperandState()
        };
    }

    function createInitialOperatorOperandState () {
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
        if (check.isObject(node) && check.isFunction(syntaxHandlers[node.type])) {
            syntaxHandlers[node.type](node, currentReport, currentOperators, currentOperands);
        }
    }

    function incrementComplexity (currentReport) {
        report.aggregate.complexity.cyclomatic += 1;

        if (currentReport) {
            currentReport.complexity.cyclomatic += 1;
        }
    }

    function operatorEncountered (operator, currentOperators, currentReport) {
        halsteadItemEncountered(operator, currentOperators, operators, currentReport, 'operators');
    }

    function operandEncountered (operand, currentOperands, currentReport) {
        halsteadItemEncountered(operand, currentOperands, operands, currentReport, 'operands');
    }

    function halsteadItemEncountered (item, currentItems, items, currentReport, metric) {
        incrementHalsteadItems(item, currentItems, currentReport, metric);
        incrementHalsteadItems(item, items, report.aggregate, metric);
    }

    function incrementHalsteadItems (item, currentItems, baseReport, metric) {
        incrementDistinctHalsteadItems(item, currentItems, baseReport, metric);
        incrementTotalHalsteadItems(baseReport, metric);
    }

    function incrementDistinctHalsteadItems (item, currentItems, baseReport, metric) {
        if (!currentItems[item]) {
            incrementHalsteadMetric(baseReport, metric, 'distinct');
            currentItems[item] = true;
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

    function safeName (object) {
        if (check.isObject(object) && check.isUnemptyString(object.name)) {
            return object.name;
        }

        return '<anonymous>';
    }

    function processFunction (fn, currentReport, currentOperators, currentOperands) {
        processFunctionBody(safeName(fn.id), fn.body);
    }

    function processFunctionBody (name, body) {
        var currentReport = createFunctionReport(name, body.loc),
            currentOperators = {},
            currentOperands = {};

        report.functions.push(currentReport);

        processNode(body, currentReport, currentOperators, currentOperands);
    }

    function processVariable (variable, currentReport, currentOperators, currentOperands) {
        if (variable.init) {
            if (
                variable.init.type === 'FunctionExpression' &&
                check.isObject(variable.init.id) === false
            ) {
                processFunctionBody(variable.id.name, variable.init.body);
            } else {
                processNode(variable.init, currentReport, currentOperators, currentOperands);
            }
        }
    }

    function processAssignment (assignment, currentReport, currentOperators, currentOperands) {
        processNode(assignment.left, currentReport, currentOperators, currentOperands);

        if (
            assignment.right.type === 'FunctionExpression' &&
            check.isObject(assignment.right.id) === false
        ) {
            if (assignment.left.type === 'MemberExpression') {
                processFunctionBody(
                    safeName(assignment.left.object) +
                        '.' + assignment.left.property.name,
                    assignment.right.body
                );
            } else {
                processNode(assignment.right, currentReport, currentOperators, currentOperands);
            }
        } else {
            processNode(assignment.right, currentReport, currentOperators, currentOperands);
        }
    }

    function processProperty (property, currentReport, currentOperators, currentOperands) {
        processVariable({
            init: property.value,
            id: property.key
        }, currentReport, currentOperators, currentOperands);
    }
}());

