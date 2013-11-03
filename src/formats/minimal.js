/*globals exports */

'use strict';

exports.format = format;

function format (result) {
    return result.reports.reduce(function (formatted, report) {
        return formatted + formatModule(report) + '\n';
    }, '');
}

function formatModule (report) {
    return [
        report.path, ': ', report.maintainability,
        formatFunctions(report.functions)
    ].join('');
}

function formatFunctions (report) {
    return report.reduce(function (formatted, r) {
        return formatted + '\n' + formatFunction(r);
    }, '');
}

function formatFunction (report) {
    return [
        '  ',
        report.name,
        ' (',
        report.line,
        '): ',
        report.cyclomatic
    ].join('');
}

