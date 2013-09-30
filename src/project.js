/*globals exports, require */

'use strict';

var check, moduleAnalyser;

exports.analyse = analyse;

check = require('check-types');
moduleAnalyser = require('./module');

function analyse (sources, options) {
    // TODO: Asynchronize.

    check.verifyArray(sources, 'Invalid sources');

    return sources.map(function (source) {
        return moduleAnalyser.analyse(source, options);
    }, []);
}

