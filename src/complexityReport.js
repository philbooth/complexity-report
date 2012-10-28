/**
 * Complexity reporting tool for JavaScript.
 */

/*globals exports, require */

(function () {
    'use strict';

    var check, esprima, syntaxHandlers, settings, report;

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

        ast = esprima.parse(source, {
            loc: true
        });

        processTree(ast.body);

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

    function processTree (tree, currentReport) {
        var i;

        check.verifyArray(tree, 'Invalid syntax tree');

        for (i = 0; i < tree.length; i += 1) {
            processNode(tree[i], currentReport);
        }
    }

    function processNode (node, currentReport) {
        check.verifyObject(node, 'Invalid syntax node');

        if (check.isFunction(syntaxHandlers[node.type])) {
            syntaxHandlers[node.type](node, currentReport);
        }
    }

    function processCondition (condition, currentReport) {
        incrementComplexity(currentReport);

        if (condition.consequent) {
            processNode(condition.consequent, currentReport);
        }

        if (condition.alternate) {
            processNode(condition.alternate, currentReport);
        }
    }

    function incrementComplexity (currentReport) {
        report.aggregate.complexity.cyclomatic += 1;

        if (currentReport) {
            currentReport.complexity.cyclomatic += 1;
        }
    }

    function processBlock (block, currentReport) {
        processTree(block.body, currentReport);
    }

    function processLogical (logical, currentReport) {
        if (settings.logicalor && logical.operator === '||') {
            processCondition({
                consequent: logical.left,
                alternate: logical.right
            }, currentReport);
        }
    }

    function processSwitch (s, currentReport) {
        processTree(s.cases, currentReport);
    }

    function processCase (c, currentReport) {
        if (settings.switchcase && c.test) {
            processCondition({
                consequent: {
                    type: 'BlockStatement',
                    body: c.consequent
                }
            }, currentReport);
        } else {
            processTree(c.consequent, currentReport);
        }
    }

    function processLoop (loop, currentReport) {
        if (loop.test) {
            processCondition({
                consequent: loop.body
            }, currentReport);
        }
    }

    function processForIn (forIn, currentReport) {
        if (settings.forin) {
            incrementComplexity(currentReport);
        }

        processNode(forIn.body, currentReport);
    }

    function processTry (t, currentReport) {
        processNode(t.block, currentReport);
        processTree(t.handlers, currentReport);
    }

    function processCatch (c, currentReport) {
        if (settings.trycatch) {
            incrementComplexity(currentReport);
        }

        processNode(c.body, currentReport);
    }

    function processFunction (fn, currentReport) {
        var name;

        if (check.isObject(fn.id)) {
            name = fn.id.name;
        }

        processFunctionBody(name, fn.body);
    }

    function processFunctionBody (name, body) {
        var currentReport = createFunctionReport(name, body.loc);

        report.functions.push(currentReport);

        processNode(body, currentReport);
    }

    function processVariables (variables, currentReport) {
        processTree(variables.declarations, currentReport);
    }

    function processVariable (variable, currentReport) {
        incrementDistinctOperands(currentReport);

        if (variable.init) {
            if (
                variable.init.type === 'FunctionExpression' &&
                check.isObject(variable.init.id) === false
            ) {
                incrementDistinctOperands(currentReport);
                processFunctionBody(variable.id.name, variable.init.body);
            } else {
                processNode(variable.init, currentReport);
            }
        }
    }

    function incrementDistinctOperands (currentReport) {
        report.aggregate.complexity.halstead.operands.distinct += 1;

        if (currentReport) {
            currentReport.complexity.halstead.operands.distinct += 1;
        }
    }

    function processLiteral (literal, currentReport) {
        incrementDistinctOperands(currentReport);
    }

    function processReturn (rtn, currentReport) {
        processNode(rtn.argument, currentReport);
    }

    function processExpression (expression, currentReport) {
        processNode(expression.expression, currentReport);
    }

    function processCall (call, currentReport) {
        processTree(call['arguments'], currentReport);
        processNode(call.callee, currentReport);
    }
}());

