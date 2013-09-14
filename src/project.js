/*globals exports, require */

'use strict';

var check, moduleAnalyser;

exports.analyse = analyse;

check = require('check-types');
moduleAnalyser = require('./module');

function analyse (sources, options) {
    // TODO: Asynchronize.

    check.verifyArray(sources, 'Invalid sources');

    return sources.reduce(function (reports, source) {
        moduleAnalyser.analyse(source, options);
    }, []);
}

