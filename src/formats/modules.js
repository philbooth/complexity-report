/*globals exports */

'use strict';

exports.format = format;

function format (reports) {
    return reports.reduce(function (formatted, report) {
        return formatted + report.path + '\n';
    }, '');
}

