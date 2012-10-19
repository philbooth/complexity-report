/*globals exports, require */

(function () {
    'use strict';

    var check, esprima,

    syntaxHandlers = {
        IfStatement: processCondition
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

        //console.dir(ast);

        processAst(ast.body, report);

        return report;
    }

    function createReport () {
        return {
            aggregate: createFunctionReport()
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

    function processAst (ast, report) {
        var i;

        check.verifyArray(ast, 'Invalid syntax tree');

        for (i = 0; i < ast.length; i += 1) {
            check.verifyObject(ast[i], 'Invalid node');

            if (check.isFunction(syntaxHandlers[ast[i].type])) {
                syntaxHandlers[ast[i].type](ast[i], report);
            }
        }
    }

    function processCondition (condition, report) {
        report.aggregate.complexity.cyclomatic += 1;

        console.dir(condition.test);
        console.dir(condition.consequent);
        console.dir(condition.alternate);
    }

    function processBlock (block, report) {
    }

    function processFunction (fn, report) {
    }
}());

