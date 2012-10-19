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

            suite('run against function call:', function () {
                var report;

                setup(function () {
                    report = cr.run('parseInt("10", 10);');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate cyclomatic complexity is 1', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 1);
                });
            });

            suite('run against function definition:', function () {
                var report;

                setup(function () {
                    report = cr.run('function foo () { "bar"; }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('cyclomatic complexity is 1', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 1);
                });
            });

            suite('run against assignment:', function () {
                var report;

                setup(function () {
                    report = cr.run('var foo = "bar";');
                });

                teardown(function () {
                    report = undefined;
                });

                test('cyclomatic complexity is 1', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 1);
                });
            });

            suite('run against condition:', function () {
                var report;

                setup(function () {
                    report = cr.run('if (true) { "foo"; }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('cyclomatic complexity is 2', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 2);
                });
            });
        });
    });
}());

