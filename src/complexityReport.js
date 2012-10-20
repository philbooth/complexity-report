/*globals exports, require */

(function () {
    'use strict';

    var check, esprima, syntaxHandlers;

    exports.run = run;

    require('coffee-script');

    check = require('check-types');
    esprima = require('esprima');

    syntaxHandlers = {
        IfStatement: processCondition,
        BlockStatement: processBlock,
        FunctionDeclaration: processFunction,
        VariableDeclaration: processVariables,
        VariableDeclarator: processVariable,
        ReturnStatement: processReturn,
        FunctionExpression: processFunction,
        ExpressionStatement: processExpression,
        CallExpression: processCall
    };

    function run (source) {
        var report, ast;

        check.verifyUnemptyString(source, 'Invalid source');

        report = createReport();

        // TODO: Ditch `loc` if we don't end up using it.
        ast = esprima.parse(source, {
            loc: true
        });

        processTree(ast.body, report);

        return report;
    }

    function createReport () {
        return {
            aggregate: createFunctionReport(),
            functions: []
        };
    }

    function createFunctionReport (name) {
        return {
            name: name,
            complexity: {
                cyclomatic: 1
            }
        };
    }

    function processTree (tree, report, currentReport) {
        var i;

        check.verifyArray(tree, 'Invalid syntax tree');

        for (i = 0; i < tree.length; i += 1) {
            processNode(tree[i], report, currentReport);
        }
    }

    function processNode (node, report, currentReport) {
        check.verifyObject(node, 'Invalid syntax node');

        if (check.isFunction(syntaxHandlers[node.type])) {
            syntaxHandlers[node.type](node, report, currentReport);
        }
    }

    function processCondition (condition, report, currentReport) {
        report.aggregate.complexity.cyclomatic += 1;
        if (currentReport) {
            currentReport.complexity.cyclomatic += 1;
        }

        if (condition.consequent) {
            processNode(condition.consequent, report, currentReport);
        }

        if (condition.alternate) {
            processNode(condition.alternate, report, currentReport);
        }
    }

    function processBlock (block, report, currentReport) {
        processTree(block.body, report, currentReport);
    }

    function processFunction (fn, report, currentReport) {
        var name;

        if (check.isObject(fn.id)) {
            name = fn.id.name;
        }

        processFunctionBody(name, fn.body, report);
    }

    function processFunctionBody (name, body, report) {
        var currentReport = createFunctionReport(name);

        report.functions.push(currentReport);

        processNode(body, report, currentReport);
    }

    function processVariables (variables, report, currentReport) {
        processTree(variables.declarations, report, currentReport);
    }

    function processVariable (variable, report, currentReport) {
        var name;

        if (variable.init.type === 'FunctionExpression') {
            if (check.isObject(variable.init.id)) {
                name = variable.init.id.name;
            } else {
                name = variable.id.name;
            }

            processFunctionBody(name, variable.init.body, report);
        }
    }

    function processReturn (rtn, report, currentReport) {
        processNode(rtn.argument, report, currentReport);
    }

    function processExpression (expression, report, currentReport) {
        processNode(expression.expression, report, currentReport);
    }

    function processCall (call, report, currentReport) {
        processTree(call.arguments, report, currentReport);
    }
}());

