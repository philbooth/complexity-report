/*globals exports */

'use strict';

exports.format = format;

function format (result) {
    return result.reports.reduce(function (formatted, report) {
        return formatted + formatModule(report) + '\n\n';
    }, formatProject(result));
}

function formatProject (result) {
    return [
        'First-order density: ', result.firstOrderDensity, '%\n',
        'Change cost: ', result.changeCost, '%\n',
        'Core size: ', result.coreSize, '%\n\n'
    ].join('');
}

function formatModule (report) {
    return [
        report.path, '\n\n',
        '  Maintainability index: ', report.maintainability, '\n',
        '  Cyclomatic complexity: ', report.aggregate.cyclomatic, '\n',
        '  Cyclomatic complexity density: ', report.aggregate.cyclomaticDensity, '%\n',
        '  Dependency count: ', report.dependencies.length, '\n',
        '  Mean parameter count: ', report.params,
        formatFunctions(report.functions)
    ].join('');
}

function formatFunctions (report) {
    return report.reduce(function (formatted, r) {
        return formatted + '\n\n' + formatFunction(r);
    }, '');
}

function formatFunction (report) {
    return [
        '  Function: ', report.name, '\n',
        '    Line No.: ', report.line, '\n',
        '    Physical SLOC: ', report.sloc.physical, '\n',
        '    Logical SLOC: ', report.sloc.logical, '\n',
        '    Parameter count: ', report.params, '\n',
        '    Cyclomatic complexity: ', report.cyclomatic, '\n',
        '    Cyclomatic complexity density: ', report.cyclomaticDensity, '%\n',
        '    Halstead difficulty: ', report.halstead.difficulty, '\n',
        '    Halstead volume: ', report.halstead.volume, '\n',
        '    Halstead effort: ', report.halstead.effort
    ].join('');
}

