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
        '# Complexity report, ', (new Date()).toLocaleDateString(), '\n\n',
        '* First-order density: ', result.firstOrderDensity, '%\n',
        '* Change cost: ', result.changeCost, '%\n',
        '* Core size: ', result.coreSize, '%\n\n'
    ].join('');
}

function formatModule (report) {
    return [
        '## ', report.path, '\n\n',
        '* Maintainability index: ', report.maintainability, '\n',
        '* Aggregate cyclomatic complexity: ', report.aggregate.complexity.cyclomatic, '\n',
        '* Dependency count: ', report.dependencies.length, '\n',
        '* Mean parameter count: ', report.params,
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
        '* Function: **', report.name.replace('<', '&lt;'), '**\n',
        '    * Line No.: ', report.line, '\n',
        '    * Physical SLOC: ', report.complexity.sloc.physical, '\n',
        '    * Logical SLOC: ', report.complexity.sloc.logical, '\n',
        '    * Parameter count: ', report.complexity.params, '\n',
        '    * Cyclomatic complexity: ', report.complexity.cyclomatic, '\n',
        '    * Cyclomatic complexity density: ', report.complexity.cyclomaticDensity, '%\n',
        '    * Halstead difficulty: ', report.complexity.halstead.difficulty, '\n',
        '    * Halstead volume: ', report.complexity.halstead.volume, '\n',
        '    * Halstead effort: ', report.complexity.halstead.effort
    ].join('');
}

