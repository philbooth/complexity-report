/*globals exports, require */

(function () {
    'use strict';

    var check, esprima;

    require('coffee-script');

    check = require('check-types');
    esprima = require('esprima');

    exports.run = run;

    function run (source) {
        var ast;

        check.verifyUnemptyString(source);

        ast = esprima.parse(source, {
            loc: true
        });
    }

    function processFunction (fn) {
    }
}());

