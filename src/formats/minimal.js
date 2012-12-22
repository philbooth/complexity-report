/*globals exports */

'use strict';

exports.format = format;

function format (reports) {
    var formatted = '', i;

    for (i = 0; i < reports.length; i += 1) {
        formatted += formatModule(reports[i]) + '\n';
    }

    return formatted;
}

function formatModule (report) {
    return [
        report.module,
        ': ',
        report.maintainability,
        formatFunctions(report.functions)
    ].join('');
}

function formatFunctions (report) {
    var formatted = '', i;

    for (i = 0; i < report.length; i += 1) {
        formatted += '\n' + formatFunction(report[i]);
    }

    return formatted;
}

function formatFunction (report) {
    return [
        '  ',
        report.name,
        ' (',
        report.line,
        '): ',
        report.complexity.cyclomatic
    ].join('');
}

