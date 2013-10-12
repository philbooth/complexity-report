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
        var report = moduleAnalyser.analyse(m.source, options);
        report.path = m.path;
        return report;
    }, []);
}

