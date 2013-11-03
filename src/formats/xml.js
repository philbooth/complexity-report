/*globals exports */

'use strict';

exports.format = format;

function format (result) {
    return createElementWithAttributes(
        0,
        'project',
        'xmlns="" xml:lang="en" timestamp="' +
            Date.now() +
            '" first-order-denisty="' +
            result.firstOrderDensity +
            '" change-cost="' +
            result.changeCost +
            '" core-size="' +
            result.coreSize + '"',
        true,
        result.reports.reduce(function (formatted, report) {
            return formatted + formatModule(4, report);
        }, '')
    );
}

function createElementWithAttributes (indentation, tag, attributes, linebreak, content) {
    return createElementWithTags(indentation, tag + ' ' + attributes, tag, linebreak, content);
}

function createElementWithTags (indentation, openingTag, closingTag, linebreak, content) {
    return indent('<', indentation) + openingTag + '>' +
        (linebreak ? '\n' : '') + content +
        (linebreak ? indent('</', indentation) : '</') + closingTag + '>\n';
}

function indent (string, indentation) {
    return (new Array(indentation + 1)).join(' ') + string;
}

function formatModule (indentation, report) {
    var i, functions = '', nextIndentation = incrementIndentation(indentation);

    for (i = 0; i < report.functions.length; i += 1) {
        functions += formatFunction(nextIndentation, report.functions[i]);
    }

    return createElementWithAttributes(
        indentation, 'module', 'path="' + report.path + '"', true,
        createElement(nextIndentation, 'maintainability', false, report.maintainability) +
            formatAggregate(nextIndentation, report.aggregate) + functions
    );
}

function incrementIndentation (indentation) {
    return indentation + 4;
}

function formatFunction (indentation, data) {
    var nextIndentation = incrementIndentation(indentation);

    return createElementWithAttributes(
        indentation, 'function', 'name="' + data.name.replace('<', '&lt;').replace('>', '&gt;') + '"', true,
        createElement(nextIndentation, 'line', false, data.line) +
            formatSlocComplexity(nextIndentation, data.sloc) +
                formatParameterComplexity(nextIndentation, data.params) +
                formatCyclomaticComplexity(nextIndentation, data.cyclomatic) +
                formatCyclomaticDensity(nextIndentation, data.cyclomaticDensity) +
                formatHalsteadComplexity(nextIndentation, data.halstead)
    );
}

function createElement (indentation, tag, linebreak, content) {
    return createElementWithTags(indentation, tag, tag, linebreak, content);
}

function formatSlocComplexity (indentation, data) {
    return createElement(
        indentation, 'sloc', true,
        formatSlocMetrics(incrementIndentation(indentation), data)
    );
}

function formatSlocMetrics (indentation, data) {
    return createElement(indentation, 'physical', false, data.physical) +
        createElement(indentation, 'logical', false, data.logical);
}

function formatParameterComplexity (indentation, data) {
    return createElement(indentation, 'parameters', false, data);
}

function formatCyclomaticComplexity (indentation, data) {
    return createElement(indentation, 'cyclomatic', false, data);
}

function formatCyclomaticDensity (indentation, data) {
    return createElement(indentation, 'cyclomatic-density', false, data);
}

function formatHalsteadComplexity (indentation, data) {
    return createElement(
        indentation, 'halstead', true,
        formatHalsteadMetrics(incrementIndentation(indentation), data)
    );
}

function formatHalsteadMetrics (indentation, data) {
    return createElement(indentation, 'length', false, data.length) +
        createElement(indentation, 'vocabulary', false, data.vocabulary) +
        createElement(indentation, 'difficulty', false, data.difficulty) +
        createElement(indentation, 'volume', false, data.volume) +
        createElement(indentation, 'effort', false, data.effort) +
        createElement(indentation, 'bugs', false, data.bugs) +
        createElement(indentation, 'time', false, data.time);
}

function formatAggregate (indentation, data) {
    var nextIndentation = incrementIndentation(indentation);

    return createElement(
        indentation, 'aggregate', true,
        formatSlocComplexity(nextIndentation, data.sloc) +
            formatParameterComplexity(nextIndentation, data.params) +
            formatCyclomaticComplexity(nextIndentation, data.cyclomatic) +
            formatCyclomaticDensity(nextIndentation, data.cyclomaticDensity) +
            formatHalsteadComplexity(nextIndentation, data.halstead)
    );
}

