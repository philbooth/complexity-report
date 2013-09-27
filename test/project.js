/*globals require, suite, test, setup, teardown */

'use strict';

var assert = require('chai').assert,

modulePath = '../src/project';

suite('project:', function () {
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

        test('analyse function is exported', function () {
            assert.isFunction(cr.analyse);
        });

        test('analyse throws when source is object', function () {
            assert.throws(function () {
                cr.analyse({});
            });
        });

        test('analyse throws when source is string', function () {
            assert.throws(function () {
                cr.analyse('function foo () {}');
            });
        });

        test('analyse does not throw when source is array', function () {
            assert.doesNotThrow(function () {
                cr.analyse([]);
            });
        });

        test('analyse throws when source array contains non-JavaScript', function () {
            assert.throws(function () {
                cr.analyse([ 'foo bar' ]);
            });
        });

        test('analyse does not throw when source array contains JavaScript', function () {
            assert.doesNotThrow(function () {
                cr.analyse([ 'function foo () {} ' ]);
            });
        });

        test('analyse throws when non-JavaScript is not first', function () {
            assert.throws(function () {
                cr.analyse([ 'function foo () {}', 'function bar () {}', 'foo bar' ]);
            });
        });

        test('analyse does not throw when source array contains multiple JavaScript', function () {
            assert.doesNotThrow(function () {
                cr.analyse([ 'function foo () {}', 'console.log("bar");', 'var i; for (i = 0; i < 10; i += 1) { alert(i); }' ]);
            });
        });

        suite('no modules:', function () {
            var reports;

            setup(function () {
                reports = cr.analyse([]);
            });

            teardown(function () {
                reports = undefined;
            });

            test('array was returned', function () {
                assert.isArray(reports);
            });

            test('array has zero length', function () {
                assert.lengthOf(reports, 0);
            });
        });

        suite('two modules:', function () {
            var reports;

            setup(function () {
                reports = cr.analyse([
                    'if (true) { "foo"; } else { "bar"; }',
                    'function foo (a, b) { if (a) { b(a); } else { a(b); } } function bar (c, d) { var i; for (i = 0; i < c.length; i += 1) { d += 1; } console.log(d); }'
                ]);
            });

            teardown(function () {
                reports = undefined;
            });

            test('reports is correct length', function () {
                assert.lengthOf(reports, 2);
            });

            test('first report aggregate has correct physical lines of code', function () {
                assert.strictEqual(reports[0].aggregate.complexity.sloc.physical, 1);
            });

            test('first report aggregate has correct logical lines of code', function () {
                assert.strictEqual(reports[0].aggregate.complexity.sloc.logical, 4);
            });

            test('first report aggregate has correct cyclomatic complexity', function () {
                assert.strictEqual(reports[0].aggregate.complexity.cyclomatic, 2);
            });

            test('first report functions is empty', function () {
                assert.lengthOf(reports[0].functions, 0);
            });

            test('first report aggregate has correct Halstead total operators', function () {
                assert.strictEqual(reports[0].aggregate.complexity.halstead.operators.total, 2);
            });

            test('first report aggregate has correct Halstead distinct operators', function () {
                assert.strictEqual(reports[0].aggregate.complexity.halstead.operators.distinct, 2);
            });

            test('first report aggregate has correct Halstead total operands', function () {
                assert.strictEqual(reports[0].aggregate.complexity.halstead.operands.total, 3);
            });

            test('first report aggregate has correct Halstead distinct operands', function () {
                assert.strictEqual(reports[0].aggregate.complexity.halstead.operands.distinct, 3);
            });

            test('first report aggregate has correct Halstead operator identifier length', function () {
                assert.lengthOf(
                    reports[0].aggregate.complexity.halstead.operators.identifiers,
                    reports[0].aggregate.complexity.halstead.operators.distinct
                );
            });

            test('first report aggregate has correct Halstead operand identifier length', function () {
                assert.lengthOf(
                    reports[0].aggregate.complexity.halstead.operands.identifiers,
                    reports[0].aggregate.complexity.halstead.operands.distinct
                );
            });

            test('first report aggregate has correct Halstead length', function () {
                assert.strictEqual(reports[0].aggregate.complexity.halstead.length, 5);
            });

            test('first report aggregate has correct Halstead vocabulary', function () {
                assert.strictEqual(reports[0].aggregate.complexity.halstead.vocabulary, 5);
            });

            test('first report aggregate has correct Halstead difficulty', function () {
                assert.strictEqual(reports[0].aggregate.complexity.halstead.difficulty, 1);
            });

            test('first report aggregate has correct Halstead volume', function () {
                assert.strictEqual(Math.round(reports[0].aggregate.complexity.halstead.volume), 12);
            });

            test('first report aggregate has correct Halstead effort', function () {
                assert.strictEqual(Math.round(reports[0].aggregate.complexity.halstead.effort), 12);
            });

            test('first report aggregate has correct Halstead bugs', function () {
                assert.strictEqual(Math.round(reports[0].aggregate.complexity.halstead.bugs), 0);
            });

            test('first report aggregate has correct Halstead time', function () {
                assert.strictEqual(Math.round(reports[0].aggregate.complexity.halstead.time), 1);
            });

            test('second report maintainability index is correct', function () {
                assert.strictEqual(Math.round(reports[1].maintainability), 128);
            });

            test('second report first function has correct parameter count', function () {
                assert.strictEqual(reports[1].functions[0].complexity.params, 2);
            });

            test('second report second function has correct parameter count', function () {
                assert.strictEqual(reports[1].functions[1].complexity.params, 2);
            });

            test('second report aggregate has correct parameter count', function () {
                assert.strictEqual(reports[1].aggregate.complexity.params, 4);
            });

            test('second report mean parameter count is correct', function () {
                assert.strictEqual(reports[1].params, 2);
            });
        });
    });
});

