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
        FunctionDeclaration: processFunction
    };

    function run (source) {
        var report, ast;

        check.verifyUnemptyString(source, 'Invalid source');

        report = createReport();

        ast = esprima.parse(source, {
            loc: true
        });

        //console.log('');
        //console.log('-= AST BEGIN =-');
        //console.dir(ast);
        //console.log('-= AST END =-');
        //console.log('');

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

    function processFunction (fn, report) {
        var currentReport = createFunctionReport(fn.id.name);

        report.functions.push(currentReport);

        if (fn.body) {
            processNode(fn.body, report, currentReport);
        }
    }
}());

