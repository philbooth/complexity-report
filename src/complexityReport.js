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

    function processTree (tree, report) {
        var i;

        check.verifyArray(tree, 'Invalid syntax tree');

        for (i = 0; i < tree.length; i += 1) {
            processNode(tree[i], report);
        }
    }

    function processNode (node, report) {
        check.verifyObject(node, 'Invalid syntax node');

        if (check.isFunction(syntaxHandlers[node.type])) {
            syntaxHandlers[node.type](node, report);
        }
    }

    function processCondition (condition, report) {
        report.aggregate.complexity.cyclomatic += 1;

        if (condition.consequent) {
            processNode(condition.consequent, report);
        }

        if (condition.alternate) {
            processNode(condition.alternate, report);
        }
    }

    function processBlock (block, report) {
        processTree(block.body, report);
    }

    function processFunction (fn, report) {
        var functionReport = createFunctionReport(fn.id.name);

        report.functions.push(functionReport);

        if (fn.body) {
            processNode(fn.body, report);
        }
    }
}());

