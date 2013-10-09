/*globals exports, require */

'use strict';

var check, moduleAnalyser;

exports.analyse = analyse;

check = require('check-types');
moduleAnalyser = require('./module');

function analyse (modules, options) {
    // TODO: Asynchronize.

    check.verifyArray(modules, 'Invalid modules');

    return modules.map(function (m) {
        return moduleAnalyser.analyse(m.source, options);
    }, []);
}

