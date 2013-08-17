/**
 * Complexity reporting tool for JavaScript.
 */

/*globals exports, require */

'use strict';

var check, esprima;

exports.run = run;

check = require('check-types');
esprima = require('esprima');

/**
 * Public function `run`.
 *
 * Returns a an object detailing the complexity of the code in the
 * source argument.
 *
 * @param source {string|[strings...]} The source code to analyse for complexity.
 * @param [options] {object}           Options to modify the complexity calculation.
 *
 */
function run (source, options) {
    // TODO: Asynchronize.

    if (check.isArray(source)) {
        return require('./project').analyse(source, options);
    }

    return require('./module').analyse(source, options);
}

