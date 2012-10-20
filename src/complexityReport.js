/*globals exports, require */

(function () {
    'use strict';

    var check, esprima,

    syntaxHandlers = {
        IfStatement: processCondition,
        FunctionDeclaration: processFunction
    };

    require('coffee-script');

    check = require('check-types');
    esprima = require('esprima');

    exports.run = run;

    function run (source) {
        var ast, report = createReport();

        check.verifyUnemptyString(source, 'Invalid source');

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

        console.log('');
        console.log('-= TEST BEGIN =-');
        console.dir(condition.test);
        console.log('-= TEST END =-');
        console.log('');
        console.log('');
        console.log('-= CONSEQUENT BEGIN =-');
        console.dir( condition.consequent);
        console.log('-= CONSEQUENT END =-');
        console.log('');
        console.log('');
        console.log('-= ALTERNATE BEGIN =-');
        console.dir(condition.alternate);
        console.log('-= ALTERNATE END =-');
        console.log('');
    }

    function processBlock (block, report) {
    }

    function processFunction (fn, report) {
        var functionReport = createFunctionReport(fn.id.name);

        report.functions.push(functionReport);

        console.log('');
        console.log('-= FN BEGIN =-');
        console.dir(fn);
        console.log('-= FN END =-');
        console.log('');
    }
}());

