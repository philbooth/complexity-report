/**
 * Complexity reporting tool for JavaScript.
 */

/*globals exports, require */

(function () {
    'use strict';

    var check, esprima, syntaxHandlers, settings, report, operators;

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
        CallExpression: processCall
    };

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

    function processCondition (condition, currentReport, currentOperators, currentOperands) {
        incrementComplexity(currentReport);
        operatorEncountered(condition.type, currentReport, currentOperators);

        processNode(condition.test, currentReport, currentOperators, currentOperands);
        processNode(condition.consequent, currentReport, currentOperators, currentOperands);
        processNode(condition.alternate, currentReport, currentOperators, currentOperands);
    }

    function incrementComplexity (currentReport) {
        report.aggregate.complexity.cyclomatic += 1;

        if (currentReport) {
            currentReport.complexity.cyclomatic += 1;
        }
    }

    function operatorEncountered (operator, currentReport, currentOperators) {
        incrementTotalOperators(report.aggregate);
        incrementDistinctOperators(operator, operators, report.aggregate);

        incrementTotalOperators(currentReport);
        incrementDistinctOperators(operator, currentOperators, currentReport);
    }

    function incrementTotalOperators (baseReport) {
        incrementOperators(baseReport, 'total');
    }

    function incrementDistinctOperators (operator, existingOperators, baseReport) {
        // TODO: Consider what to do if operator is undefined
        if (!existingOperators[operator]) {
            incrementOperators(baseReport, 'distinct');
            existingOperators[operator] = true;
        }
    }

    function incrementOperators (baseReport, type) {
        incrementHalsteadMetric(baseReport, 'operators', type);
    }

    function operandEncountered (operand, currentReport, currentOperands) {
        incrementTotalOperands(report.aggregate);
        incrementTotalOperands(currentReport);
        incrementDistinctOperands(operand, currentOperands);
    }

    function incrementTotalOperands (baseReport) {
        incrementOperands(baseReport, 'total');
    }

    function incrementDistinctOperands(operand, currentOperands) {
        // The operand should be considered distinct if it is in a
        // var declaration, listed as the argument for a function
        // body, first usage of a literal, first usage of a global
        // or first call to a function. Because of closures, nested
        // functions should of course inherit the operand lists of
        // their parents.
    }

    function incrementOperands (baseReport, type) {
        incrementHalsteadMetric(baseReport, 'operands', type);
    }

    function incrementHalsteadMetric (baseReport, metric, type) {
        if (baseReport) {
            baseReport.complexity.halstead[metric][type] += 1;
        }
    }

    function processBlock (block, currentReport, currentOperators, currentOperands) {
        processTree(block.body, currentReport, currentOperators, currentOperands);
    }

    function processLogical (logical, currentReport, currentOperators, currentOperands) {
        if (settings.logicalor && logical.operator === '||') {
            processCondition({
                type: logical.operator,
                consequent: logical.left,
                alternate: logical.right
            }, currentReport, currentOperators, currentOperands);
        } else {
            operatorEncountered(logical.operator, currentReport, currentOperators);
        }
    }

    function processSwitch (s, currentReport, currentOperators, currentOperands) {
        operatorEncountered(s.type, currentReport, currentOperators);

        processTree(s.cases, currentReport, currentOperators, currentOperands);
    }

    function processCase (c, currentReport, currentOperators, currentOperands) {
        operatorEncountered(c.type, currentReport, currentOperators);

        if (settings.switchcase && c.test) {
            processCondition({
                consequent: {
                    type: 'BlockStatement',
                    body: c.consequent
                }
            }, currentReport, currentOperators, currentOperands);
        } else {
            processTree(c.consequent, currentReport, currentOperators, currentOperands);
        }
    }

    function processLoop (loop, currentReport, currentOperators, currentOperands) {
        operatorEncountered(loop.type, currentReport, currentOperators);

        if (loop.test) {
            processCondition({
                consequent: loop.body
            }, currentReport, currentOperators, currentOperands);
        }
    }

    function processForIn (forIn, currentReport, currentOperators, currentOperands) {
        operatorEncountered(forIn.type, currentReport, currentOperators);

        if (settings.forin) {
            incrementComplexity(currentReport);
        }

        processNode(forIn.body, currentReport, currentOperators, currentOperands);
    }

    function processTry (t, currentReport, currentOperators, currentOperands) {
        processNode(t.block, currentReport, currentOperators, currentOperands);
        processTree(t.handlers, currentReport, currentOperators, currentOperands);
    }

    function processCatch (c, currentReport, currentOperators, currentOperands) {
        if (settings.trycatch) {
            incrementComplexity(currentReport);
        }

        processNode(c.body, currentReport, currentOperators, currentOperands);
    }

    function processFunction (fn, currentReport, currentOperators, currentOperands) {
        var name;

        if (check.isObject(fn.id)) {
            name = fn.id.name;
        }

        processFunctionBody(name, fn.body);
    }

    function processFunctionBody (name, body) {
        var currentReport = createFunctionReport(name, body.loc),
            currentOperators = {},
            currentOperands = {};

        report.functions.push(currentReport);

        processNode(body, currentReport, currentOperators, currentOperands);
    }

    function processVariables (variables, currentReport, currentOperators, currentOperands) {
        processTree(variables.declarations, currentReport, currentOperators, currentOperands);
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

    function processLiteral (literal, currentReport, currentOperators, currentOperands) {
        var value;

        if (check.isString(literal)) {
            // Avoid conflicts between string literals and identifiers.
            value = '"' + literal.value + '"';
        } else {
            value = literal.value;
        }

        operandEncountered(value, currentReport, currentOperands);
    }

    function processReturn (rtn, currentReport, currentOperators, currentOperands) {
        processNode(rtn.argument, currentReport, currentOperators, currentOperands);
    }

    function processExpression (expression, currentReport, currentOperators, currentOperands) {
        processNode(expression.expression, currentReport, currentOperators, currentOperands);
    }

    function processCall (call, currentReport, currentOperators, currentOperands) {
        operatorEncountered(call.type, currentReport, currentOperators);
        operandEncountered(call.callee.name, currentReport, currentOperands);

        processTree(call['arguments'], currentReport, currentOperators, currentOperands);
        processNode(call.callee, currentReport, currentOperators, currentOperands);
    }
}());

