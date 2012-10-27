/*globals exports */

'use strict';

exports.format = format;

function format (reports) {
    var formatted = '', i;

    for (i = 0; i < reports.length; i += 1) {
        formatted += formatModule(reports[i]);
    }
}

function formatModule (report) {
    return [
        '\n',
        report.module,
        '\n\n',
        'Aggregate complexity: ',
        report.aggregate.complexity.cyclomatic,
        '\n\n',
        formatFunctions(report.functions)
    ].join('');
}

function formatFunctions (report) {
    var formatted = '', i;

    for (i = 0; i < report.length; i += 1) {
        formatted += '\n\n' + formatFunction(report[i]);
    }

    return formatted;
}

function formatFunction (report) {
    return [
        'Function: ',
        report.name,
        '\n',
        'Cyclomatic complexity: ',
        report.complexity.cyclomatic
    ].join('');
}

