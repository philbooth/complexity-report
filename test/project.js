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

        test('analyse throws when module array contains non-JavaScript', function () {
            assert.throws(function () {
                cr.analyse([ { source: 'foo bar', path: 'baz' } ]);
            });
        });

        test('analyse does not throw when module array contains JavaScript', function () {
            assert.doesNotThrow(function () {
                cr.analyse([ { source: 'function foo () {}', path: 'foo' } ]);
            });
        });

        test('analyse throws when non-JavaScript is not first', function () {
            assert.throws(function () {
                cr.analyse([ { source: 'function foo () {}', path: 'foo' }, { source: 'function bar () {}', path: 'bar' }, { source: 'foo bar', path: 'baz' } ]);
            });
        });

        test('analyse does not throw when module array contains multiple JavaScript', function () {
            assert.doesNotThrow(function () {
                cr.analyse([ { source: 'function foo () {}', path: 'foo' }, { source: 'console.log("bar");', path: 'bar' }, { source: 'var i; for (i = 0; i < 10; i += 1) { alert(i); }', path: 'baz' } ]);
            });
        });

        test('analyse throws when module array is missing source', function () {
            assert.throws(function () {
                cr.analyse([ { path: 'foo' } ]);
            });
        });

        test('analyse throws when module array is missing path', function () {
            assert.throws(function () {
                cr.analyse([ { source: 'function foo () {}' } ]);
            });
        });

        suite('no modules:', function () {
            var result;

            setup(function () {
                result = cr.analyse([]);
            });

            teardown(function () {
                result = undefined;
            });

            test('object was returned', function () {
                assert.isObject(result);
            });

            test('reports array exists', function () {
                assert.isArray(result.reports);
            });

            test('reports array has zero length', function () {
                assert.lengthOf(result.reports, 0);
            });

            test('matrices array exists', function () {
                assert.isArray(result.matrices);
            });

            test('matrices array has one item', function () {
                assert.lengthOf(result.matrices, 1);
            });

            test('adjacency matrix exists', function () {
                assert.isArray(result.matrices[0].matrix);
            });

            test('adjacency matrix has zero length', function () {
                assert.lengthOf(result.matrices[0].matrix, 0);
            });

            test('first-order density is correct', function () {
                assert.strictEqual(result.matrices[0].density, 0);
            });
        });

        suite('two modules:', function () {
            var result;

            setup(function () {
                result = cr.analyse([
                    { source: 'function foo (a, b) { if (a) { b(a); } else { a(b); } } function bar (c, d) { var i; for (i = 0; i < c.length; i += 1) { d += 1; } console.log(d); }', path: 'b' },
                    { source: 'if (true) { "foo"; } else { "bar"; }', path: 'a' }
                ]);
            });

            teardown(function () {
                result = undefined;
            });

            test('reports is correct length', function () {
                assert.lengthOf(result.reports, 2);
            });

            test('first report aggregate has correct physical lines of code', function () {
                assert.strictEqual(result.reports[0].aggregate.complexity.sloc.physical, 1);
            });

            test('first report aggregate has correct logical lines of code', function () {
                assert.strictEqual(result.reports[0].aggregate.complexity.sloc.logical, 4);
            });

            test('first report aggregate has correct cyclomatic complexity', function () {
                assert.strictEqual(result.reports[0].aggregate.complexity.cyclomatic, 2);
            });

            test('first report functions is empty', function () {
                assert.lengthOf(result.reports[0].functions, 0);
            });

            test('first report aggregate has correct Halstead total operators', function () {
                assert.strictEqual(result.reports[0].aggregate.complexity.halstead.operators.total, 2);
            });

            test('first report aggregate has correct Halstead distinct operators', function () {
                assert.strictEqual(result.reports[0].aggregate.complexity.halstead.operators.distinct, 2);
            });

            test('first report aggregate has correct Halstead total operands', function () {
                assert.strictEqual(result.reports[0].aggregate.complexity.halstead.operands.total, 3);
            });

            test('first report aggregate has correct Halstead distinct operands', function () {
                assert.strictEqual(result.reports[0].aggregate.complexity.halstead.operands.distinct, 3);
            });

            test('first report aggregate has correct Halstead operator identifier length', function () {
                assert.lengthOf(
                    result.reports[0].aggregate.complexity.halstead.operators.identifiers,
                    result.reports[0].aggregate.complexity.halstead.operators.distinct
                );
            });

            test('first report aggregate has correct Halstead operand identifier length', function () {
                assert.lengthOf(
                    result.reports[0].aggregate.complexity.halstead.operands.identifiers,
                    result.reports[0].aggregate.complexity.halstead.operands.distinct
                );
            });

            test('first report aggregate has correct Halstead length', function () {
                assert.strictEqual(result.reports[0].aggregate.complexity.halstead.length, 5);
            });

            test('first report aggregate has correct Halstead vocabulary', function () {
                assert.strictEqual(result.reports[0].aggregate.complexity.halstead.vocabulary, 5);
            });

            test('first report aggregate has correct Halstead difficulty', function () {
                assert.strictEqual(result.reports[0].aggregate.complexity.halstead.difficulty, 1);
            });

            test('first report aggregate has correct Halstead volume', function () {
                assert.strictEqual(Math.round(result.reports[0].aggregate.complexity.halstead.volume), 12);
            });

            test('first report aggregate has correct Halstead effort', function () {
                assert.strictEqual(Math.round(result.reports[0].aggregate.complexity.halstead.effort), 12);
            });

            test('first report aggregate has correct Halstead bugs', function () {
                assert.strictEqual(Math.round(result.reports[0].aggregate.complexity.halstead.bugs), 0);
            });

            test('first report aggregate has correct Halstead time', function () {
                assert.strictEqual(Math.round(result.reports[0].aggregate.complexity.halstead.time), 1);
            });

            test('first report has correct path', function () {
                assert.strictEqual(result.reports[0].path, 'a');
            });

            test('second report maintainability index is correct', function () {
                assert.strictEqual(Math.round(result.reports[1].maintainability), 128);
            });

            test('second report first function has correct parameter count', function () {
                assert.strictEqual(result.reports[1].functions[0].complexity.params, 2);
            });

            test('second report second function has correct parameter count', function () {
                assert.strictEqual(result.reports[1].functions[1].complexity.params, 2);
            });

            test('second report aggregate has correct parameter count', function () {
                assert.strictEqual(result.reports[1].aggregate.complexity.params, 4);
            });

            test('second report mean parameter count is correct', function () {
                assert.strictEqual(result.reports[1].params, 2);
            });

            test('second report has correct path', function () {
                assert.strictEqual(result.reports[1].path, 'b');
            });
        });

        suite('modules with dependencies:', function () {
            var result;

            setup(function () {
                result = cr.analyse([
                    { source: 'require("./a");"d";', path: '/d.js' },
                    { source: 'require("./b");"c";', path: '/a/c.js' },
                    { source: 'require("./c");"b";', path: '/a/b.js' },
                    { source: 'require("./a/b");require("./a/c");"a";', path: '/a.js' }
                ]);
            });

            teardown(function () {
                result = undefined;
            });

            test('reports are in correct order', function () {
                assert.strictEqual(result.reports[0].path, '/a.js');
                assert.strictEqual(result.reports[1].path, '/d.js');
                assert.strictEqual(result.reports[2].path, '/a/b.js');
                assert.strictEqual(result.reports[3].path, '/a/c.js');
            });

            test('adjacency matrix is correct', function () {
                assert.lengthOf(result.matrices[0].matrix, 4);

                assert.lengthOf(result.matrices[0].matrix[0], 4);
                assert.isNull(result.matrices[0].matrix[0][0]);
                assert.strictEqual(result.matrices[0].matrix[0][1], 0);
                assert.strictEqual(result.matrices[0].matrix[0][2], 1);
                assert.strictEqual(result.matrices[0].matrix[0][3], 1);

                assert.lengthOf(result.matrices[0].matrix[1], 4);
                assert.strictEqual(result.matrices[0].matrix[1][0], 1);
                assert.isNull(result.matrices[0].matrix[1][1]);
                assert.strictEqual(result.matrices[0].matrix[1][2], 0);
                assert.strictEqual(result.matrices[0].matrix[1][3], 0);

                assert.lengthOf(result.matrices[0].matrix[2], 4);
                assert.strictEqual(result.matrices[0].matrix[2][0], 0);
                assert.strictEqual(result.matrices[0].matrix[2][1], 0);
                assert.isNull(result.matrices[0].matrix[2][2]);
                assert.strictEqual(result.matrices[0].matrix[2][3], 1);

                assert.lengthOf(result.matrices[0].matrix[3], 4);
                assert.strictEqual(result.matrices[0].matrix[3][0], 0);
                assert.strictEqual(result.matrices[0].matrix[3][1], 0);
                assert.strictEqual(result.matrices[0].matrix[3][2], 1);
                assert.isNull(result.matrices[0].matrix[3][3]);
            });

            test('first order density is correct', function () {
                assert.strictEqual(result.matrices[0].density, 5);
            });
        });
    });
});

