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

            test('run returns functions property', function () {
                assert.isArray(cr.run('"foo"').functions);
            });

            suite('run against function call:', function () {
                var report;

                setup(function () {
                    report = cr.run('parseInt("10", 10);');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 1);
                });

                test('functions is empty', function () {
                    assert.lengthOf(report.functions, 0);
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

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 2);
                });

                test('functions is empty', function () {
                    assert.lengthOf(report.functions, 0);
                });
            });

            suite('run against condition with alternate:', function () {
                var report;

                setup(function () {
                    report = cr.run('if (true) { "foo"; } else { "bar"; }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 2);
                });

                test('functions is empty', function () {
                    assert.lengthOf(report.functions, 0);
                });
            });

            suite('run against dual condition:', function () {
                var report;

                setup(function () {
                    report = cr.run('if (true) { "foo"; } if (false) { "bar"; }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 3);
                });
            });

            suite('run against alternate dual condition:', function () {
                var report;

                setup(function () {
                    report = cr.run('if (true) { "foo"; } else if (false) { "bar"; }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 3);
                });
            });

            suite('run against nested condition:', function () {
                var report;

                setup(function () {
                    report = cr.run('if (true) { "foo"; if (false) { "bar"; } }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 3);
                });
            });

            suite('run against switch statement:', function () {
                var report;

                setup(function () {
                    report = cr.run('switch (Date.now()) { case 1: "foo"; break; case 2: "bar"; break; default: "baz"; }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 3);
                });

                test('functions is empty', function () {
                    assert.lengthOf(report.functions, 0);
                });
            });

            suite('run against switch statement with fall-through case:', function () {
                var report;

                setup(function () {
                    report = cr.run('switch (Date.now()) { case 1: case 2: "foo"; break; default: "bar"; }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 3);
                });

                test('functions is empty', function () {
                    assert.lengthOf(report.functions, 0);
                });
            });

            suite('run against switch statement containing condition:', function () {
                var report;

                setup(function () {
                    report = cr.run('switch (Date.now()) { case 1: "foo"; break; case 2: "bar"; break; default: if (true) { "baz"; } }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 4);
                });

                test('functions is empty', function () {
                    assert.lengthOf(report.functions, 0);
                });
            });

            suite('run against switch statement:', function () {
                var report;

                setup(function () {
                    report = cr.run('switch (Date.now()) { case 1: "foo"; break; case 2: "bar"; break; default: "baz"; }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 3);
                });

                test('functions is empty', function () {
                    assert.lengthOf(report.functions, 0);
                });
            });

            suite('run against for loop:', function () {
                var report;

                setup(function () {
                    report = cr.run('var i; for (i = 0; i < 10; i += 1) { "foo"; }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 2);
                });

                test('functions is empty', function () {
                    assert.lengthOf(report.functions, 0);
                });
            });

            suite('run against for loop containing condition:', function () {
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
            });

            suite('run against for...in loop:', function () {
                var report;

                setup(function () {
                    report = cr.run('var property; for (property in { foo: "bar", baz: "qux" }) { "wibble"; }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 1);
                });

                test('functions is empty', function () {
                    assert.lengthOf(report.functions, 0);
                });
            });

            suite('run against for...in loop containing condition:', function () {
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
            });

            suite('run against while loop:', function () {
                var report;

                setup(function () {
                    report = cr.run('while (true) { "foo"; }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 2);
                });

                test('functions is empty', function () {
                    assert.lengthOf(report.functions, 0);
                });
            });

            suite('run against while loop containing condition:', function () {
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
            });

            suite('run against do...while loop:', function () {
                var report;

                setup(function () {
                    report = cr.run('do { "foo"; } while (true)');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 2);
                });

                test('functions is empty', function () {
                    assert.lengthOf(report.functions, 0);
                });
            });

            suite('run against do...while loop containing condition:', function () {
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
            });

            suite('run against try...catch', function () {
                var report;

                setup(function () {
                    report = cr.run('try { "foo"; } catch (e) { e.message; }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 1);
                });

                test('functions is empty', function () {
                    assert.lengthOf(report.functions, 0);
                });
            });

            suite('run against try containing condition', function () {
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
            });

            suite('run against catch containing condition', function () {
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
            });

            suite('run against function declaration:', function () {
                var report;

                setup(function () {
                    report = cr.run('function foo () { "bar"; }');
                });

                teardown(function () {
                    report = undefined;
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

                test('function has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.functions[0].complexity.cyclomatic, 1);
                });
            });

            suite('run against nested function declaration:', function () {
                var report;

                setup(function () {
                    report = cr.run('function foo () { bar(); function bar () { "baz"; } }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('functions has correct length', function () {
                    assert.lengthOf(report.functions, 2);
                });

                test('first function has correct name', function () {
                    assert.strictEqual(report.functions[0].name, 'foo');
                });

                test('second function has correct name', function () {
                    assert.strictEqual(report.functions[1].name, 'bar');
                });
            });

            suite('run against function declaration containing conditional:', function () {
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
            });

            suite('run against assignment expression', function () {
                var report;

                setup(function () {
                    report = cr.run('var foo = "bar";');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 1);
                });

                test('functions is empty', function () {
                    assert.lengthOf(report.functions, 0);
                });
            });

            suite('run against ternary condtional expression assigned to variable:', function () {
                var report;

                setup(function () {
                    report = cr.run('var foo = true ? "bar" : "baz";');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 2);
                });
            });

            suite('run against logical or expression assigned to variable:', function () {
                var report;

                setup(function () {
                    report = cr.run('var foo = true || false;');
                });

                teardown(function () {
                    report = undefined;
                });

                test('aggregate has correct cyclomatic complexity', function () {
                    assert.strictEqual(report.aggregate.complexity.cyclomatic, 2);
                });
            });

            suite('run against anonymous function assigned to variable:', function () {
                var report;

                setup(function () {
                    report = cr.run('var foo = function () { "bar"; }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('functions has correct length', function () {
                    assert.lengthOf(report.functions, 1);
                });

                test('function has correct name', function () {
                    assert.strictEqual(report.functions[0].name, 'foo');
                });
            });

            suite('run against named function assigned to variable:', function () {
                var report;

                setup(function () {
                    report = cr.run('var foo = function bar () { "baz"; }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('function has correct name', function () {
                    assert.strictEqual(report.functions[0].name, 'bar');
                });
            });

            suite('run against ternary condtional expression returned from function:', function () {
                var report;

                setup(function () {
                    report = cr.run('function foo () { return true ? "bar" : "baz"; }');
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
            });

            suite('run against logical or expression returned from function:', function () {
                var report;

                setup(function () {
                    report = cr.run('function foo () { return true || false; }');
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
            });

            suite('run against anonymous function returned from function:', function () {
                var report;

                setup(function () {
                    report = cr.run('function foo () { return function () { "bar"; }; }');
                });

                teardown(function () {
                    report = undefined;
                });

                test('functions has correct length', function () {
                    assert.lengthOf(report.functions, 2);
                });

                test('first function has correct name', function () {
                    assert.strictEqual(report.functions[0].name, 'foo');
                });

                test('second function is anonymous', function () {
                    assert.isUndefined(report.functions[1].name);
                });
            });

            suite('run against named function returned from function:', function () {
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
            });

            suite('run against ternary condtional expression passed as argument:', function () {
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
            });

            suite('run against logical or expression passed as argument:', function () {
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

            suite('run against anonymous function passed as argument:', function () {
                var report;

                setup(function () {
                    report = cr.run('setTimeout(function () { "foo"; }, 1000);');
                });

                teardown(function () {
                    report = undefined;
                });

                test('functions has correct length', function () {
                    assert.lengthOf(report.functions, 1);
                });

                test('function is anonymous', function () {
                    assert.isUndefined(report.functions[0].name);
                });
            });

            suite('run against named function passed as argument:', function () {
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
        });
    });
}());

