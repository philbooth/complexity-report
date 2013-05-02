/*global require, suite, setup, teardown, test */

(function () {
    'use strict';

    var assert = require('chai').assert,

    modulePath = '../src/complexityReport';

    suite('complexityReport:', function () {
        test('require does not throw', function () {
            assert.doesNotThrow(function () {
                require(modulePath);
            });
        });

        test('require returns object', function () {
            assert.isObject(require(modulePath));
        });

        suite('require:', function () {
            var cr;

            setup(function () {
                cr = require(modulePath);
            });

            teardown(function () {
                cr = undefined;
            });

            test('run function is exported', function () {
                assert.isFunction(cr.run);
            });

            test('run throws when source is object', function () {
                assert.throws(function () {
                    cr.run({});
                });
            });

            test('run throws when source is empty string', function () {
                assert.throws(function () {
                    cr.run('');
                });
            });

            test('run throws when source is not javascript', function () {
                assert.throws(function () {
                    cr.run('foo bar');
                });
            });

            test('run does not throw when source is javascript', function () {
                assert.doesNotThrow(function () {
                    cr.run('console.log("foo");');
                });
            });

            test('run returns object', function () {
                assert.isObject(cr.run('"foo"'));
            });

            test('run returns aggregate complexity property', function () {
                assert.isObject(cr.run('"foo"').aggregate.complexity);
            });

            test('run returns aggregate lines of code property', function () {
                assert.isObject(cr.run('"foo"').aggregate.complexity.sloc);
            });

            test('run returns aggregate physical lines of code property', function () {
                assert.isNumber(cr.run('"foo"').aggregate.complexity.sloc.physical);
            });

            test('run returns aggregate logical lines of code property', function () {
                assert.isNumber(cr.run('"foo"').aggregate.complexity.sloc.logical);
            });

            test('run returns aggregate cyclomatic complexity property', function () {
                assert.isNumber(cr.run('"foo"').aggregate.complexity.cyclomatic);
            });

            test('run returns aggregate halstead property', function () {
                assert.isObject(cr.run('"foo"').aggregate.complexity.halstead);
            });

            test('run returns aggregate halstead operators property', function () {
                assert.isObject(cr.run('"foo"').aggregate.complexity.halstead.operators);
            });

            test('run returns aggregate halstead total operators property', function () {
                assert.isNumber(cr.run('"foo"').aggregate.complexity.halstead.operators.total);
            });

            test('run returns aggregate halstead distinct operators property', function () {
                assert.isNumber(cr.run('"foo"').aggregate.complexity.halstead.operators.distinct);
            });

            test('run returns aggregate halstead operator identifiers property', function () {
                assert.isArray(cr.run('"foo"').aggregate.complexity.halstead.operators.identifiers);
            });

            test('run returns aggregate halstead operands property', function () {
                assert.isObject(cr.run('"foo"').aggregate.complexity.halstead.operands);
            });

            test('run returns aggregate halstead total operands property', function () {
                assert.isNumber(cr.run('"foo"').aggregate.complexity.halstead.operands.total);
            });

            test('run returns aggregate halstead distinct operands property', function () {
                assert.isNumber(cr.run('"foo"').aggregate.complexity.halstead.operands.distinct);
            });

            test('run returns aggregate halstead operand identifiers property', function () {
                assert.isArray(cr.run('"foo"').aggregate.complexity.halstead.operands.identifiers);
            });

            test('run returns maintainability property', function () {
                assert.isNumber(cr.run('"foo"').maintainability);
            });

            test('run returns functions property', function () {
                assert.isArray(cr.run('"foo"').functions);
            });

            suite('function call:', function () {
                var report;

                setup(function () {
                    report = cr.run('parseInt("10", 10);');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct physical lines of code', function () {
                    assert.strictEqual(report.aggregate.complexity.sloc.physical, 1);
                });

                test('aggregate has correct logical lines of code', function () {
                    assert.strictEqual(report.aggregate.complexity.sloc.logical, 1);
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 1);
                });

                test('functions is empty', function () {
                    assert.lengthOf(report.functions, 0);
                });

                test('aggregate has correct Halstead total operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.total, 1);
                });

                test('aggregate has correct Halstead distinct operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.distinct, 1);
                });

                test('aggregate has correct Halstead total operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.total, 3);
                });

                test('aggregate has correct Halstead distinct operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.distinct, 3);
                });

                test('aggregate has correct Halstead operator identifier length', function () {
                    assert.lengthOf(
                        report.aggregate.complexity.halstead.operators.identifiers,
                        report.aggregate.complexity.halstead.operators.distinct
                    );
                });

                test('aggregate has correct Halstead operand identifier length', function () {
                    assert.lengthOf(
                        report.aggregate.complexity.halstead.operands.identifiers,
                        report.aggregate.complexity.halstead.operands.distinct
                    );
                });

                test('aggregate has correct Halstead length', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.length, 4);
                });

                test('aggregate has correct Halstead vocabulary', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.vocabulary, 4);
                });

                test('aggregate has correct Halstead difficulty', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.difficulty, 0.5);
                });

                test('aggregate has correct Halstead volume', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.volume, 8);
                });

                test('aggregate has correct Halstead effort', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.effort, 4);
                });

                test('aggregate has correct Halstead bugs', function () {
                    assert.strictEqual(Math.round(report.aggregate.complexity.halstead.bugs), 0);
                });

                test('aggregate has correct Halstead time', function () {
                    assert.strictEqual(Math.round(report.aggregate.complexity.halstead.time), 0);
                });

                test('maintainability index is correct', function () {
                    assert.strictEqual(Math.round(report.maintainability), 166);
                });

                test('aggregate has correct parameter count', function () {
                    assert.strictEqual(report.aggregate.complexity.params, 0);
                });

                test('mean parameter count is correct', function () {
                    assert.strictEqual(report.params, 0);
                });
            });

            suite('condition:', function () {
                var report;

                setup(function () {
                    report = cr.run('if (true) { "foo"; }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct physical lines of code', function () {
                    assert.strictEqual(report.aggregate.complexity.sloc.physical, 1);
                });

                test('aggregate has correct logical lines of code', function () {
                    assert.strictEqual(report.aggregate.complexity.sloc.logical, 2);
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 2);
                });

                test('functions is empty', function () {
                    assert.lengthOf(report.functions, 0);
                });

                test('aggregate has correct Halstead total operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.total, 1);
                });

                test('aggregate has correct Halstead distinct operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.distinct, 1);
                });

                test('aggregate has correct Halstead total operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.total, 2);
                });

                test('aggregate has correct Halstead distinct operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.distinct, 2);
                });

                test('aggregate has correct Halstead operator identifier length', function () {
                    assert.lengthOf(
                        report.aggregate.complexity.halstead.operators.identifiers,
                        report.aggregate.complexity.halstead.operators.distinct
                    );
                });

                test('aggregate has correct Halstead operand identifier length', function () {
                    assert.lengthOf(
                        report.aggregate.complexity.halstead.operands.identifiers,
                        report.aggregate.complexity.halstead.operands.distinct
                    );
                });

                test('aggregate has correct Halstead length', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.length, 3);
                });

                test('aggregate has correct Halstead vocabulary', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.vocabulary, 3);
                });

                test('aggregate has correct Halstead difficulty', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.difficulty, 0.5);
                });

                test('aggregate has correct Halstead volume', function () {
                    assert.strictEqual(Math.round(report.aggregate.complexity.halstead.volume), 5);
                });

                test('aggregate has correct Halstead effort', function () {
                    assert.strictEqual(Math.round(report.aggregate.complexity.halstead.effort), 2);
                });

                test('aggregate has correct Halstead bugs', function () {
                    assert.strictEqual(Math.round(report.aggregate.complexity.halstead.bugs), 0);
                });

                test('aggregate has correct Halstead time', function () {
                    assert.strictEqual(Math.round(report.aggregate.complexity.halstead.time), 0);
                });

                test('maintainability index is correct', function () {
                    assert.strictEqual(Math.round(report.maintainability), 157);
                });
            });

            suite('condition with alternate:', function () {
                var report;

                setup(function () {
                    report = cr.run('if (true) { "foo"; } else { "bar"; }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct physical lines of code', function () {
                    assert.strictEqual(report.aggregate.complexity.sloc.physical, 1);
                });

                test('aggregate has correct logical lines of code', function () {
                    assert.strictEqual(report.aggregate.complexity.sloc.logical, 4);
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 2);
                });

                test('functions is empty', function () {
                    assert.lengthOf(report.functions, 0);
                });

                test('aggregate has correct Halstead total operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.total, 2);
                });

                test('aggregate has correct Halstead distinct operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.distinct, 2);
                });

                test('aggregate has correct Halstead total operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.total, 3);
                });

                test('aggregate has correct Halstead distinct operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.distinct, 3);
                });

                test('aggregate has correct Halstead operator identifier length', function () {
                    assert.lengthOf(
                        report.aggregate.complexity.halstead.operators.identifiers,
                        report.aggregate.complexity.halstead.operators.distinct
                    );
                });

                test('aggregate has correct Halstead operand identifier length', function () {
                    assert.lengthOf(
                        report.aggregate.complexity.halstead.operands.identifiers,
                        report.aggregate.complexity.halstead.operands.distinct
                    );
                });

                test('aggregate has correct Halstead length', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.length, 5);
                });

                test('aggregate has correct Halstead vocabulary', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.vocabulary, 5);
                });

                test('aggregate has correct Halstead difficulty', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.difficulty, 1);
                });

                test('aggregate has correct Halstead volume', function () {
                    assert.strictEqual(Math.round(report.aggregate.complexity.halstead.volume), 12);
                });

                test('aggregate has correct Halstead effort', function () {
                    assert.strictEqual(Math.round(report.aggregate.complexity.halstead.effort), 12);
                });

                test('aggregate has correct Halstead bugs', function () {
                    assert.strictEqual(Math.round(report.aggregate.complexity.halstead.bugs), 0);
                });

                test('aggregate has correct Halstead time', function () {
                    assert.strictEqual(Math.round(report.aggregate.complexity.halstead.time), 1);
                });
            });

            suite('dual condition:', function () {
                var report;

                setup(function () {
                    report = cr.run('if (true) { "foo"; } if (false) { "bar"; }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct logical lines of code', function () {
                    assert.strictEqual(report.aggregate.complexity.sloc.logical, 4);
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 3);
                });

                test('aggregate has correct Halstead total operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.total, 2);
                });

                test('aggregate has correct Halstead distinct operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.distinct, 1);
                });

                test('aggregate has correct Halstead total operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.total, 4);
                });

                test('aggregate has correct Halstead distinct operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.distinct, 4);
                });

                test('aggregate has correct Halstead operator identifier length', function () {
                    assert.lengthOf(
                        report.aggregate.complexity.halstead.operators.identifiers,
                        report.aggregate.complexity.halstead.operators.distinct
                    );
                });

                test('aggregate has correct Halstead operand identifier length', function () {
                    assert.lengthOf(
                        report.aggregate.complexity.halstead.operands.identifiers,
                        report.aggregate.complexity.halstead.operands.distinct
                    );
                });

                test('aggregate has correct Halstead length', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.length, 6);
                });

                test('aggregate has correct Halstead vocabulary', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.vocabulary, 5);
                });

                test('aggregate has correct Halstead difficulty', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.difficulty, 0.5);
                });
            });

            suite('alternate dual condition:', function () {
                var report;

                setup(function () {
                    report = cr.run('if (true) { "foo"; } else if (false) { "bar"; }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct logical lines of code', function () {
                    assert.strictEqual(report.aggregate.complexity.sloc.logical, 5);
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 3);
                });

                test('aggregate has correct Halstead total operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.total, 3);
                });

                test('aggregate has correct Halstead distinct operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.distinct, 2);
                });

                test('aggregate has correct Halstead total operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.total, 4);
                });

                test('aggregate has correct Halstead distinct operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.distinct, 4);
                });

                test('aggregate has correct Halstead operator identifier length', function () {
                    assert.lengthOf(
                        report.aggregate.complexity.halstead.operators.identifiers,
                        report.aggregate.complexity.halstead.operators.distinct
                    );
                });

                test('aggregate has correct Halstead operand identifier length', function () {
                    assert.lengthOf(
                        report.aggregate.complexity.halstead.operands.identifiers,
                        report.aggregate.complexity.halstead.operands.distinct
                    );
                });
            });

            suite('nested condition:', function () {
                var report;

                setup(function () {
                    report = cr.run('if (true) { "foo"; if (false) { "bar"; } }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct logical lines of code', function () {
                    assert.strictEqual(report.aggregate.complexity.sloc.logical, 4);
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 3);
                });
            });

            suite('switch statement:', function () {
                var report;

                setup(function () {
                    report = cr.run('switch (Date.now()) { case 1: "foo"; break; case 2: "bar"; break; default: "baz"; }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct logical lines of code', function () {
                    assert.strictEqual(report.aggregate.complexity.sloc.logical, 9);
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 3);
                });

                test('functions is empty', function () {
                    assert.lengthOf(report.functions, 0);
                });

                test('aggregate has correct Halstead total operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.total, 8);
                });

                test('aggregate has correct Halstead distinct operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.distinct, 6);
                });

                test('aggregate has correct Halstead total operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.total, 7);
                });

                test('aggregate has correct Halstead distinct operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.distinct, 7);
                });
            });

            suite('switch statement with fall-through case:', function () {
                var report;

                setup(function () {
                    report = cr.run('switch (Date.now()) { case 1: case 2: "foo"; break; default: "bar"; }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct logical lines of code', function () {
                    assert.strictEqual(report.aggregate.complexity.sloc.logical, 7);
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 3);
                });

                test('functions is empty', function () {
                    assert.lengthOf(report.functions, 0);
                });

                test('aggregate has correct Halstead total operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.total, 7);
                });

                test('aggregate has correct Halstead distinct operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.distinct, 6);
                });

                test('aggregate has correct Halstead total operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.total, 6);
                });

                test('aggregate has correct Halstead distinct operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.distinct, 6);
                });
            });

            suite('switch statement containing condition:', function () {
                var report;

                setup(function () {
                    report = cr.run('switch (Date.now()) { case 1: "foo"; break; case 2: "bar"; break; default: if (true) { "baz"; } }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct logical lines of code', function () {
                    assert.strictEqual(report.aggregate.complexity.sloc.logical, 10);
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 4);
                });

                test('functions is empty', function () {
                    assert.lengthOf(report.functions, 0);
                });

                test('aggregate has correct Halstead total operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.total, 9);
                });

                test('aggregate has correct Halstead distinct operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.distinct, 7);
                });

                test('aggregate has correct Halstead total operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.total, 8);
                });

                test('aggregate has correct Halstead distinct operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.distinct, 8);
                });
            });

            suite('for loop:', function () {
                var report;

                setup(function () {
                    report = cr.run('var i; for (i = 0; i < 10; i += 1) { "foo"; }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct logical lines of code', function () {
                    assert.strictEqual(report.aggregate.complexity.sloc.logical, 3);
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 2);
                });

                test('functions is empty', function () {
                    assert.lengthOf(report.functions, 0);
                });

                test('aggregate has correct Halstead total operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.total, 5);
                });

                test('aggregate has correct Halstead distinct operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.distinct, 5);
                });

                test('aggregate has correct Halstead total operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.total, 8);
                });

                test('aggregate has correct Halstead distinct operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.distinct, 5);
                });

                test('aggregate has correct Halstead length', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.length, 13);
                });

                test('aggregate has correct Halstead vocabulary', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.vocabulary, 10);
                });

                test('aggregate has correct Halstead difficulty', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.difficulty, 4);
                });
            });

            suite('for loop containing condition:', function () {
                var report;

                setup(function () {
                    report = cr.run('var i; for (i = 0; i < 10; i += 1) { if (true) { "foo"; } }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 3);
                });

                test('aggregate has correct Halstead total operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.total, 6);
                });

                test('aggregate has correct Halstead distinct operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.distinct, 6);
                });

                test('aggregate has correct Halstead total operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.total, 9);
                });

                test('aggregate has correct Halstead distinct operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.distinct, 6);
                });
            });

            suite('for...in loop:', function () {
                var report;

                setup(function () {
                    report = cr.run('var property; for (property in { foo: "bar", baz: "qux" }) { "wibble"; }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct logical lines of code', function () {
                    assert.strictEqual(report.aggregate.complexity.sloc.logical, 5);
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 1);
                });

                test('functions is empty', function () {
                    assert.lengthOf(report.functions, 0);
                });

                test('aggregate has correct Halstead total operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.total, 5);
                });

                test('aggregate has correct Halstead distinct operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.distinct, 4);
                });

                test('aggregate has correct Halstead total operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.total, 8);
                });

                test('aggregate has correct Halstead distinct operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.distinct, 7);
                });

                test('aggregate has correct Halstead length', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.length, 13);
                });

                test('aggregate has correct Halstead vocabulary', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.vocabulary, 11);
                });

                test('aggregate has correct Halstead difficulty', function () {
                    assert.strictEqual(Math.round(report.aggregate.complexity.halstead.difficulty), 2);
                });
            });

            suite('for...in loop containing condition:', function () {
                var report;

                setup(function () {
                    report = cr.run('var property, object = { foo: "bar", baz: "qux" }; for (property in object) { if (object.hasOwnProperty(property)) { "wibble"; } }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 2);
                });

                test('aggregate has correct Halstead total operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.total, 9);
                });

                test('aggregate has correct Halstead distinct operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.distinct, 8);
                });

                test('aggregate has correct Halstead total operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.total, 13);
                });

                test('aggregate has correct Halstead distinct operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.distinct, 9);
                });
            });

            suite('while loop:', function () {
                var report;

                setup(function () {
                    report = cr.run('while (true) { "foo"; }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct logical lines of code', function () {
                    assert.strictEqual(report.aggregate.complexity.sloc.logical, 2);
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 2);
                });

                test('functions is empty', function () {
                    assert.lengthOf(report.functions, 0);
                });

                test('aggregate has correct Halstead total operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.total, 1);
                });

                test('aggregate has correct Halstead distinct operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.distinct, 1);
                });

                test('aggregate has correct Halstead total operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.total, 2);
                });

                test('aggregate has correct Halstead distinct operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.distinct, 2);
                });
            });

            suite('while loop containing condition:', function () {
                var report;

                setup(function () {
                    report = cr.run('while (true) { if (true) { "foo"; } }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 3);
                });

                test('aggregate has correct Halstead total operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.total, 2);
                });

                test('aggregate has correct Halstead distinct operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.distinct, 2);
                });

                test('aggregate has correct Halstead total operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.total, 3);
                });

                test('aggregate has correct Halstead distinct operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.distinct, 2);
                });
            });

            suite('do...while loop:', function () {
                var report;

                setup(function () {
                    report = cr.run('do { "foo"; } while (true)');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct logical lines of code', function () {
                    assert.strictEqual(report.aggregate.complexity.sloc.logical, 3);
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 2);
                });

                test('functions is empty', function () {
                    assert.lengthOf(report.functions, 0);
                });

                test('aggregate has correct Halstead total operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.total, 1);
                });

                test('aggregate has correct Halstead distinct operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.distinct, 1);
                });

                test('aggregate has correct Halstead total operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.total, 2);
                });

                test('aggregate has correct Halstead distinct operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.distinct, 2);
                });
            });

            suite('do...while loop containing condition:', function () {
                var report;

                setup(function () {
                    report = cr.run('do { if (true) { "foo"; } } while (true)');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 3);
                });

                test('aggregate has correct Halstead total operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.total, 2);
                });

                test('aggregate has correct Halstead distinct operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.distinct, 2);
                });

                test('aggregate has correct Halstead total operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.total, 3);
                });

                test('aggregate has correct Halstead distinct operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.distinct, 2);
                });
            });

            suite('try...catch:', function () {
                var report;

                setup(function () {
                    report = cr.run('try { "foo"; } catch (e) { e.message; }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct logical lines of code', function () {
                    assert.strictEqual(report.aggregate.complexity.sloc.logical, 4);
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 1);
                });

                test('functions is empty', function () {
                    assert.lengthOf(report.functions, 0);
                });

                test('aggregate has correct Halstead total operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.total, 2);
                });

                test('aggregate has correct Halstead distinct operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.distinct, 2);
                });

                test('aggregate has correct Halstead total operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.total, 4);
                });

                test('aggregate has correct Halstead distinct operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.distinct, 3);
                });
            });

            suite('try containing condition', function () {
                var report;

                setup(function () {
                    report = cr.run('try { if (true) { "foo"; } } catch (e) { "bar"; }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 2);
                });

                test('aggregate has correct Halstead total operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.total, 2);
                });

                test('aggregate has correct Halstead distinct operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.distinct, 2);
                });

                test('aggregate has correct Halstead total operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.total, 4);
                });

                test('aggregate has correct Halstead distinct operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.distinct, 4);
                });
            });

            suite('catch containing condition', function () {
                var report;

                setup(function () {
                    report = cr.run('try { "foo"; } catch (e) { if (true) { "bar"; } }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 2);
                });

                test('aggregate has correct Halstead total operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.total, 2);
                });

                test('aggregate has correct Halstead distinct operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.distinct, 2);
                });

                test('aggregate has correct Halstead total operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.total, 4);
                });

                test('aggregate has correct Halstead distinct operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.distinct, 4);
                });
            });

            suite('function declaration:', function () {
                var report;

                setup(function () {
                    report = cr.run('function foo () { "bar"; }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct logical lines of code', function () {
                    assert.strictEqual(report.aggregate.complexity.sloc.logical, 2);
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 1);
                });

                test('functions has correct length', function () {
                    assert.lengthOf(report.functions, 1);
                });

                test('function has correct name', function () {
                    assert.strictEqual(report.functions[0].name, 'foo');
                });

                test('function has complexity property', function () {
                    assert.isObject(report.functions[0].complexity);
                });

                test('function has correct physical lines of code', function () {
                    assert.strictEqual(report.functions[0].complexity.sloc.physical, 1);
                });

                test('function has correct logical lines of code', function () {
                    assert.strictEqual(report.functions[0].complexity.sloc.logical, 1);
                });

                test('function has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.functions[0].complexity.cyclomatic, 1);
                });

                test('function has correct parameter count', function () {
                    assert.strictEqual(report.functions[0].complexity.params, 0);
                });

                test('aggregate has correct Halstead total operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.total, 1);
                });

                test('aggregate has correct Halstead distinct operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.distinct, 1);
                });

                test('aggregate has correct Halstead total operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.total, 2);
                });

                test('aggregate has correct Halstead distinct operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.distinct, 2);
                });

                test('aggregate has correct Halstead length', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.length, 3);
                });

                test('aggregate has correct Halstead vocabulary', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.vocabulary, 3);
                });

                test('aggregate has correct Halstead difficulty', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.difficulty, 0.5);
                });

                test('function has correct Halstead length', function () {
                    assert.strictEqual(report.functions[0].complexity.halstead.length, 1);
                });

                test('function has correct Halstead vocabulary', function () {
                    assert.strictEqual(report.functions[0].complexity.halstead.vocabulary, 1);
                });

                test('function has correct Halstead difficulty', function () {
                    assert.strictEqual(report.functions[0].complexity.halstead.difficulty, 0);
                });

                test('function has correct Halstead volume', function () {
                    assert.strictEqual(report.functions[0].complexity.halstead.volume, 0);
                });

                test('function has correct Halstead effort', function () {
                    assert.strictEqual(report.functions[0].complexity.halstead.effort, 0);
                });

                test('function has correct Halstead bugs', function () {
                    assert.strictEqual(report.functions[0].complexity.halstead.bugs, 0);
                });

                test('function has correct Halstead time', function () {
                    assert.strictEqual(report.functions[0].complexity.halstead.time, 0);
                });

                test('maintainability index is correct', function () {
                    assert.strictEqual(report.maintainability, 171);
                });

                test('aggregate has correct parameter count', function () {
                    assert.strictEqual(report.aggregate.complexity.params, 0);
                });
            });

            suite('nested function declaration:', function () {
                var report;

                setup(function () {
                    report = cr.run('function foo () { bar(); function bar () { "baz"; } }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct logical lines of code', function () {
                    assert.strictEqual(report.aggregate.complexity.sloc.logical, 4);
                });

                test('functions has correct length', function () {
                    assert.lengthOf(report.functions, 2);
                });

                test('first function has correct logical lines of code', function () {
                    assert.strictEqual(report.functions[0].complexity.sloc.logical, 2);
                });

                test('second function has correct logical lines of code', function () {
                    assert.strictEqual(report.functions[1].complexity.sloc.logical, 1);
                });

                test('first function has correct name', function () {
                    assert.strictEqual(report.functions[0].name, 'foo');
                });

                test('second function has correct name', function () {
                    assert.strictEqual(report.functions[1].name, 'bar');
                });

                test('aggregate has correct Halstead total operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.total, 3);
                });

                test('aggregate has correct Halstead distinct operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.distinct, 2);
                });

                test('aggregate has correct Halstead total operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.total, 4);
                });

                test('aggregate has correct Halstead distinct operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.distinct, 3);
                });
            });

            suite('function declaration containing condition:', function () {
                var report;

                setup(function () {
                    report = cr.run('function foo () { if (true) { "bar"; } }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 2);
                });

                test('function has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.functions[0].complexity.cyclomatic, 2);
                });

                test('aggregate has correct Halstead total operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.total, 2);
                });

                test('aggregate has correct Halstead distinct operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.distinct, 2);
                });

                test('aggregate has correct Halstead total operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.total, 3);
                });

                test('aggregate has correct Halstead distinct operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.distinct, 3);
                });
            });

            suite('assignment expression', function () {
                var report;

                setup(function () {
                    report = cr.run('var foo = "bar";');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct logical lines of code', function () {
                    assert.strictEqual(report.aggregate.complexity.sloc.logical, 1);
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 1);
                });

                test('functions is empty', function () {
                    assert.lengthOf(report.functions, 0);
                });

                test('aggregate has correct Halstead total operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.total, 2);
                });

                test('aggregate has correct Halstead distinct operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.distinct, 2);
                });

                test('aggregate has correct Halstead total operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.total, 2);
                });

                test('aggregate has correct Halstead distinct operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.distinct, 2);
                });
            });

            suite('ternary condtional expression assigned to variable:', function () {
                var report;

                setup(function () {
                    report = cr.run('var foo = true ? "bar" : "baz";');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct logical lines of code', function () {
                    assert.strictEqual(report.aggregate.complexity.sloc.logical, 1);
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 2);
                });

                test('aggregate has correct Halstead total operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.total, 3);
                });

                test('aggregate has correct Halstead distinct operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.distinct, 3);
                });

                test('aggregate has correct Halstead total operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.total, 4);
                });

                test('aggregate has correct Halstead distinct operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.distinct, 4);
                });
            });

            suite('nested ternary condtional expression:', function () {
                var report;

                setup(function () {
                    report = cr.run('var foo = true ? "bar" : (false ? "baz" : "qux");');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct logical lines of code', function () {
                    assert.strictEqual(report.aggregate.complexity.sloc.logical, 1);
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 3);
                });

                test('aggregate has correct Halstead total operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.total, 4);
                });

                test('aggregate has correct Halstead distinct operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.distinct, 3);
                });

                test('aggregate has correct Halstead total operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.total, 6);
                });

                test('aggregate has correct Halstead distinct operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.distinct, 6);
                });
            });

            suite('logical or expression assigned to variable:', function () {
                var report;

                setup(function () {
                    report = cr.run('var foo = true || false;');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct logical lines of code', function () {
                    assert.strictEqual(report.aggregate.complexity.sloc.logical, 1);
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 2);
                });

                test('aggregate has correct Halstead total operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.total, 3);
                });

                test('aggregate has correct Halstead distinct operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.distinct, 3);
                });

                test('aggregate has correct Halstead total operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.total, 3);
                });

                test('aggregate has correct Halstead distinct operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.distinct, 3);
                });
            });

            suite('anonymous function assigned to variable:', function () {
                var report;

                setup(function () {
                    report = cr.run('var foo = function () { "bar"; }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct logical lines of code', function () {
                    assert.strictEqual(report.aggregate.complexity.sloc.logical, 2);
                });

                test('functions has correct length', function () {
                    assert.lengthOf(report.functions, 1);
                });

                test('function has correct name', function () {
                    assert.strictEqual(report.functions[0].name, 'foo');
                });

                test('aggregate has correct Halstead total operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.total, 3);
                });

                test('aggregate has correct Halstead distinct operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.distinct, 3);
                });

                test('aggregate has correct Halstead total operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.total, 3);
                });

                test('aggregate has correct Halstead distinct operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.distinct, 3);
                });
            });

            suite('named function assigned to variable:', function () {
                var report;

                setup(function () {
                    report = cr.run('var foo = function bar () { "baz"; }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct logical lines of code', function () {
                    assert.strictEqual(report.aggregate.complexity.sloc.logical, 2);
                });

                test('function has correct name', function () {
                    assert.strictEqual(report.functions[0].name, 'bar');
                });

                test('aggregate has correct Halstead total operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.total, 3);
                });

                test('aggregate has correct Halstead distinct operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.distinct, 3);
                });
            });

            suite('ternary condtional expression returned from function:', function () {
                var report;

                setup(function () {
                    report = cr.run('function foo () { return true ? "bar" : "baz"; }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct logical lines of code', function () {
                    assert.strictEqual(report.aggregate.complexity.sloc.logical, 2);
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 2);
                });

                test('function has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.functions[0].complexity.cyclomatic, 2);
                });

                test('aggregate has correct Halstead total operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.total, 3);
                });

                test('aggregate has correct Halstead distinct operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.distinct, 3);
                });

                test('aggregate has correct Halstead total operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.total, 4);
                });

                test('aggregate has correct Halstead distinct operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.distinct, 4);
                });
            });

            suite('logical or expression returned from function:', function () {
                var report;

                setup(function () {
                    report = cr.run('function foo () { return true || false; }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct logical lines of code', function () {
                    assert.strictEqual(report.aggregate.complexity.sloc.logical, 2);
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 2);
                });

                test('function has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.functions[0].complexity.cyclomatic, 2);
                });

                test('aggregate has correct Halstead total operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.total, 3);
                });

                test('aggregate has correct Halstead distinct operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.distinct, 3);
                });
            });

            suite('anonymous function returned from function:', function () {
                var report;

                setup(function () {
                    report = cr.run('function foo () { return function () { "bar"; }; }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct logical lines of code', function () {
                    assert.strictEqual(report.aggregate.complexity.sloc.logical, 3);
                });

                test('functions has correct length', function () {
                    assert.lengthOf(report.functions, 2);
                });

                test('first function has correct name', function () {
                    assert.strictEqual(report.functions[0].name, 'foo');
                });

                test('second function is anonymous', function () {
                    assert.strictEqual(report.functions[1].name, '<anonymous>');
                });

                test('aggregate has correct Halstead total operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.total, 3);
                });

                test('aggregate has correct Halstead distinct operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.distinct, 2);
                });

                test('aggregate has correct Halstead total operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.total, 3);
                });

                test('aggregate has correct Halstead distinct operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.distinct, 3);
                });
            });

            suite('named function returned from function:', function () {
                var report;

                setup(function () {
                    report = cr.run('function foo () { return function bar () { "baz"; }; }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('second function has correct name', function () {
                    assert.strictEqual(report.functions[1].name, 'bar');
                });

                test('aggregate has correct Halstead total operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.total, 3);
                });

                test('aggregate has correct Halstead distinct operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.distinct, 3);
                });
            });

            suite('ternary condtional expression passed as argument:', function () {
                var report;

                setup(function () {
                    report = cr.run('parseInt("10", true ? 10 : 8);');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 2);
                });

                test('aggregate has correct Halstead total operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.total, 2);
                });

                test('aggregate has correct Halstead distinct operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.distinct, 2);
                });

                test('aggregate has correct Halstead total operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.total, 5);
                });

                test('aggregate has correct Halstead distinct operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.distinct, 5);
                });
            });

            suite('logical or expression passed as argument:', function () {
                var report;

                setup(function () {
                    report = cr.run('parseInt("10", 10 || 8);');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 2);
                });
            });

            suite('anonymous function passed as argument:', function () {
                var report;

                setup(function () {
                    report = cr.run('setTimeout(function () { "foo"; }, 1000);');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct logical lines of code', function () {
                    assert.strictEqual(report.aggregate.complexity.sloc.logical, 2);
                });

                test('functions has correct length', function () {
                    assert.lengthOf(report.functions, 1);
                });

                test('function is anonymous', function () {
                    assert.strictEqual(report.functions[0].name, '<anonymous>');
                });

                test('aggregate has correct Halstead total operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.total, 2);
                });

                test('aggregate has correct Halstead distinct operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.distinct, 2);
                });

                test('aggregate has correct Halstead total operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.total, 4);
                });

                test('aggregate has correct Halstead distinct operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.distinct, 4);
                });
            });

            suite('named function passed as argument:', function () {
                var report;

                setup(function () {
                    report = cr.run('setTimeout(function foo () { "bar"; }, 1000);');
                });

                teardown(function () {
                    report = undefined;
                });

                test('function has correct name', function () {
                    assert.strictEqual(report.functions[0].name, 'foo');
                });
            });

            suite('logical or expression with logicalor false:', function () {
                var report;

                setup(function () {
                    report = cr.run('var foo = true || false;', {
                        logicalor: false
                    });
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 1);
                });
            });

            suite('switch statement with switchcase false:', function () {
                var report;

                setup(function () {
                    report = cr.run('switch (Date.now()) { case 1: "foo"; break; case 2: "bar"; break; default: "baz"; }', {
                        switchcase: false
                    });
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 1);
                });
            });

            suite('for...in loop with forin true:', function () {
                var report;

                setup(function () {
                    report = cr.run('var property; for (property in { foo: "bar", baz: "qux" }) { "wibble"; }', {
                        forin: true
                    });
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 2);
                });
            });

            suite('try...catch with trycatch true:', function () {
                var report;

                setup(function () {
                    report = cr.run('try { "foo"; } catch (e) { e.message; }', {
                        trycatch: true
                    });
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 2);
                });
            });

            suite('IIFE:', function () {
                var report;

                setup(function () {
                    report = cr.run('(function (foo) { if (foo === "foo") { console.log(foo); return; } "bar"; }("foo"));');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct logical lines of code', function () {
                    assert.strictEqual(report.aggregate.complexity.sloc.logical, 6);
                });

                test('functions has correct length', function () {
                    assert.lengthOf(report.functions, 1);
                });

                test('function has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.functions[0].complexity.cyclomatic, 2);
                });

                test('function has correct parameter count', function () {
                    assert.strictEqual(report.functions[0].complexity.params, 1);
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 2);
                });

                test('aggregate has correct Halstead total operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.total, 7);
                });

                test('aggregate has correct Halstead distinct operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.distinct, 6);
                });

                test('aggregate has correct Halstead total operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.total, 9);
                });

                test('aggregate has correct Halstead distinct operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.distinct, 6);
                });

                test('aggregate has correct parameter count', function () {
                    assert.strictEqual(report.aggregate.complexity.params, 1);
                });
            });

            suite('logical and condition:', function () {
                var report;

                setup(function () {
                    report = cr.run('if ("foo" && "bar") { "baz"; }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct logical lines of code', function () {
                    assert.strictEqual(report.aggregate.complexity.sloc.logical, 2);
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 2);
                });

                test('aggregate has correct Halstead total operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.total, 2);
                });

                test('aggregate has correct Halstead distinct operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.distinct, 2);
                });

                test('aggregate has correct Halstead total operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.total, 3);
                });

                test('aggregate has correct Halstead distinct operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.distinct, 3);
                });
            });

            suite('call on function object:', function () {
                var report;

                setup(function () {
                    report = cr.run('(function () { "foo"; }).call(this);');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct logical lines of code', function () {
                    assert.strictEqual(report.aggregate.complexity.sloc.logical, 3);
                });

                test('functions has correct length', function () {
                    assert.lengthOf(report.functions, 1);
                });

                test('aggregate has correct Halstead total operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.total, 3);
                });

                test('aggregate has correct Halstead distinct operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.distinct, 3);
                });

                test('aggregate has correct Halstead total operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.total, 4);
                });

                test('aggregate has correct Halstead distinct operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.distinct, 4);
                });
            });

            suite('anonymous function assigned to property:', function () {
                var report;

                setup(function () {
                    report = cr.run('var foo = {}; foo.bar = function () { "foobar"; };');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct logical lines of code', function () {
                    assert.strictEqual(report.aggregate.complexity.sloc.logical, 3);
                });

                test('functions has correct length', function () {
                    assert.lengthOf(report.functions, 1);
                });

                test('function has correct name', function () {
                    assert.strictEqual(report.functions[0].name, 'foo.bar');
                });

                test('aggregate has correct Halstead total operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.total, 6);
                });

                test('aggregate has correct Halstead distinct operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.distinct, 5);
                });

                test('aggregate has correct Halstead total operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.total, 6);
                });

                test('aggregate has correct Halstead distinct operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.distinct, 4);
                });
            });

            suite('anonymous function assigned to property of literal:', function () {
                var report;

                setup(function () {
                    report = cr.run('"".bar = function () { "bar"; };');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct logical lines of code', function () {
                    assert.strictEqual(report.aggregate.complexity.sloc.logical, 2);
                });

                test('functions has correct length', function () {
                    assert.lengthOf(report.functions, 1);
                });

                test('function has correct name', function () {
                    assert.strictEqual(report.functions[0].name, '<anonymous>.bar');
                });
            });

            suite('empty object literal:', function () {
                var report;

                setup(function () {
                    report = cr.run('var foo = {};');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct logical lines of code', function () {
                    assert.strictEqual(report.aggregate.complexity.sloc.logical, 1);
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 1);
                });

                test('functions has correct length', function () {
                    assert.lengthOf(report.functions, 0);
                });

                test('aggregate has correct Halstead total operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.total, 3);
                });

                test('aggregate has correct Halstead distinct operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.distinct, 3);
                });

                test('aggregate has correct Halstead total operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.total, 2);
                });

                test('aggregate has correct Halstead distinct operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.distinct, 2);
                });
            });

            suite('function property of literal object:', function () {
                var report;

                setup(function () {
                    report = cr.run('var foo = { bar: "bar", baz: function () { "baz"; } };');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct logical lines of code', function () {
                    assert.strictEqual(report.aggregate.complexity.sloc.logical, 4);
                });

                test('functions has correct length', function () {
                    assert.lengthOf(report.functions, 1);
                });

                test('function has correct name', function () {
                    assert.strictEqual(report.functions[0].name, 'baz');
                });

                test('aggregate has correct Halstead total operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.total, 6);
                });

                test('aggregate has correct Halstead distinct operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.distinct, 5);
                });

                test('aggregate has correct Halstead total operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.total, 7);
                });

                test('aggregate has correct Halstead distinct operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.distinct, 6);
                });
            });

            suite('duplicate function properties of literal object:', function () {
                var report;

                setup(function () {
                    report = cr.run('var foo = { bar: function () { if (true) { "bar"; } }, bar: function () { "bar"; } };');
                });

                teardown(function () {
                    report = undefined;
                });

                test('functions has correct length', function () {
                    assert.lengthOf(report.functions, 2);
                });

                test('first function has correct name', function () {
                    assert.strictEqual(report.functions[0].name, 'bar');
                });

                test('second function has correct name', function () {
                    assert.strictEqual(report.functions[1].name, 'bar');
                });

                test('first function has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.functions[0].complexity.cyclomatic, 2);
                });

                test('second function has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.functions[1].complexity.cyclomatic, 1);
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 2);
                });
            });

            suite('throw exception:', function () {
                var report;

                setup(function () {
                    report = cr.run('try { throw new Error("foo"); } catch (e) { alert(error.message); }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct logical lines of code', function () {
                    assert.strictEqual(report.aggregate.complexity.sloc.logical, 4);
                });

                test('functions has correct length', function () {
                    assert.lengthOf(report.functions, 0);
                });

                test('aggregate has correct Halstead total operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.total, 5);
                });

                test('aggregate has correct Halstead distinct operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.distinct, 5);
                });

                test('aggregate has correct Halstead total operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.total, 6);
                });

                test('aggregate has correct Halstead distinct operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.distinct, 6);
                });
            });

            suite('prefix and postfix increment:', function () {
                var report;

                setup(function () {
                    report = cr.run('var a = 0; ++a; a++;');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct logical lines of code', function () {
                    assert.strictEqual(report.aggregate.complexity.sloc.logical, 3);
                });

                test('functions has correct length', function () {
                    assert.lengthOf(report.functions, 0);
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 1);
                });

                test('aggregate has correct Halstead total operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.total, 4);
                });

                test('aggregate has correct Halstead distinct operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.distinct, 4);
                });

                test('aggregate has correct Halstead total operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.total, 4);
                });

                test('aggregate has correct Halstead distinct operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.distinct, 2);
                });
            });

            suite('array literal:', function () {
                var report;

                setup(function () {
                    report = cr.run('[ "foo", "bar" ];');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct logical lines of code', function () {
                    assert.strictEqual(report.aggregate.complexity.sloc.logical, 1);
                });

                test('functions has correct length', function () {
                    assert.lengthOf(report.functions, 0);
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 1);
                });

                test('aggregate has correct Halstead total operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.total, 1);
                });

                test('aggregate has correct Halstead distinct operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.distinct, 1);
                });

                test('aggregate has correct Halstead total operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.total, 3);
                });

                test('aggregate has correct Halstead distinct operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.distinct, 3);
                });
            });

            suite('multiple physical lines:', function () {
                var report;

                setup(function () {
                    report = cr.run('// This is a\n// multi-line\n// comment.\nparseInt(\n\t(function () {\n\t\t// Moar\n\t\t// commentz!\n\t\treturn [\n\t\t\t"1",\n\t\t\t"0"\n\t\t].join("");\n\t}()),\n\t10\n);');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct physical lines of code', function () {
                    assert.strictEqual(report.aggregate.complexity.sloc.physical, 11);
                });

                test('aggregate has correct logical lines of code', function () {
                    assert.strictEqual(report.aggregate.complexity.sloc.logical, 4);
                });

                test('functions has correct length', function () {
                    assert.lengthOf(report.functions, 1);
                });

                test('function has correct physical lines of code', function () {
                    assert.strictEqual(report.functions[0].complexity.sloc.physical, 8);
                });

                test('function has correct logical lines of code', function () {
                    assert.strictEqual(report.functions[0].complexity.sloc.logical, 2);
                });

                test('maintainability index is correct', function () {
                    assert.strictEqual(Math.round(report.maintainability), 146);
                });
            });

            suite('multiple functions:', function () {
                var report;

                setup(function () {
                    report = cr.run('function foo (a, b) { if (a) { b(a); } else { a(b); } } function bar (c, d) { var i; for (i = 0; i < c.length; i += 1) { d += 1; } console.log(d); }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('maintainability index is correct', function () {
                    assert.strictEqual(Math.round(report.maintainability), 128);
                });

                test('first function has correct parameter count', function () {
                    assert.strictEqual(report.functions[0].complexity.params, 2);
                });

                test('second function has correct parameter count', function () {
                    assert.strictEqual(report.functions[1].complexity.params, 2);
                });

                test('aggregate has correct parameter count', function () {
                    assert.strictEqual(report.aggregate.complexity.params, 4);
                });

                test('mean parameter count is correct', function () {
                    assert.strictEqual(report.params, 2);
                });
            });

            suite('issue 3 / reddit.ISV_Damocles:', function () {
                var report;

                setup(function () {
                    report = cr.run('var callback = arguments[arguments.length-1] instanceof Function ? arguments[arguments.length-1] : function() {};');
                });

                teardown(function () {
                    report = undefined;
                });

                test('maintainability index is correct', function () {
                    assert.strictEqual(report.maintainability, 171);
                });
            });

            suite('empty return:', function () {
                var report;

                setup(function () {
                    report = cr.run('function foo () { return; }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct Halstead total operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.total, 2);
                });

                test('aggregate has correct Halstead distinct operators', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operators.distinct, 2);
                });

                test('aggregate has correct Halstead total operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.total, 1);
                });

                test('aggregate has correct Halstead distinct operands', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.operands.distinct, 1);
                });

                test('aggregate has correct Halstead difficulty', function () {
                    assert.strictEqual(report.aggregate.complexity.halstead.difficulty, 1);
                });

                test('function has correct Halstead difficulty', function () {
                    assert.strictEqual(report.functions[0].complexity.halstead.difficulty, 0.5);
                });

                test('maintainability index is correct', function () {
                    assert.strictEqual(report.maintainability, 171);
                });
            });

            suite('Microsoft variant maintainability index:', function () {
                var report;

                setup(function () {
                    report = cr.run('function foo (a, b) { if (a) { b(a); } else { a(b); } } function bar (c, d) { var i; for (i = 0; i < c.length; i += 1) { d += 1; } console.log(d); }', {
                        newmi: true
                    });
                });

                teardown(function () {
                    report = undefined;
                });

                test('maintainability index is correct', function () {
                    assert.strictEqual(Math.round(report.maintainability), 75);
                });
            });

            suite('Functions with consistent parameter counts:', function () {
                var report;

                setup(function () {
                    report = cr.run('function foo (a) {} function bar (b) {} function baz (c) {}');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct parameter count', function () {
                    assert.strictEqual(report.aggregate.complexity.params, 3);
                });

                test('mean parameter count is correct', function () {
                    assert.strictEqual(report.params, 1);
                });
            });

            suite('Functions with inconsistent parameter counts:', function () {
                var report;

                setup(function () {
                    report = cr.run('function foo (a, b, c, d, e) {} function bar (a, b, c, d, e) {} function baz (a) {}');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct parameter count', function () {
                    assert.strictEqual(report.aggregate.complexity.params, 11);
                });

                test('mean parameter count is correct', function () {
                    assert.strictEqual(report.params, 11/3);
                });
            });
        });
    });
}());

