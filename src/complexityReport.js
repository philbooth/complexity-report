/**
 * Complexity reporting tool for JavaScript.
 */

/*globals exports, require */

'use strict';

var check, esprima, syntaxDefinitions, safeName, syntaxes, report;

exports.run = run;

check = require('check-types');
esprima = require('esprima');
safeName = require('./safeName');
syntaxDefinitions = require('./syntax');

/**
 * Public function `run`.
 *
 * Returns a an object detailing the complexity of the code in the
 * source argument.
 *
 * @param source {string}    The source code to analyse for complexity.
 * @param [options] {object} Options to modify the complexity calculation.
 *
 */
function run (source, options) {
    // TODO: Asynchronize.

    var settings, ast;

    check.verifyUnemptyString(source, 'Invalid source');

    if (check.isObject(options)) {
        settings = options;
    } else {
        settings = getDefaultSettings();
    }

    ast = esprima.parse(source, {
        loc: true
    });

    syntaxes = syntaxDefinitions.get(settings);
    report = createReport(ast.loc);

    processTree(ast.body, undefined, undefined);

    calculateMetrics();

    return report;
}

function getDefaultSettings () {
    return {
        logicalor: true,
        switchcase: true,
        forin: false,
        trycatch: false
    };
}

function createReport (lines) {
    return {
        aggregate: createFunctionReport(undefined, lines),
        functions: []
    };
}

function createFunctionReport (name, lines) {
    return {
        name: name,
        line: lines.start.line,
        complexity: {
            sloc: {
                physical: lines.end.line - lines.start.line + 1,
                logical: 0
            },
            cyclomatic: 1,
            halstead: createInitialHalsteadState()
        }
    };
}

function createInitialHalsteadState () {
    return {
        operators: createInitialHalsteadItemState(),
        operands: createInitialHalsteadItemState()
    };
}

function createInitialHalsteadItemState () {
    return {
        distinct: 0,
        total: 0,
        identifiers: []
    };
}

function processTree (tree, assignedName, currentReport) {
    var i;

    check.verifyArray(tree, 'Invalid syntax tree');

    for (i = 0; i < tree.length; i += 1) {
        processNode(tree[i], assignedName, currentReport);
    }
}

function processNode (node, assignedName, currentReport) {
    var syntax;

    if (check.isObject(node)) {
        syntax = syntaxes[node.type];

        if (check.isObject(syntaxes[node.type])) {
            processLloc(node, currentReport);
            processComplexity(node, currentReport);
            processOperators(node, currentReport);
            processOperands(node, currentReport);

            if (syntax.newScope) {
                processChildrenInNewScope(node, assignedName);
            } else {
                processChildren(node, currentReport);
            }
        }
    }
}

function processLloc (node, currentReport) {
    incrementCounter(node, 'lloc', incrementLogicalSloc, currentReport);
}

function incrementCounter (node, name, incrementFn, currentReport) {
    var amount = syntaxes[node.type][name];

    if (check.isNumber(amount)) {
        incrementFn(currentReport, amount);
    } else if (check.isFunction(amount)) {
        incrementFn(currentReport, amount(node));
    }
}

function incrementLogicalSloc (currentReport, amount) {
    report.aggregate.complexity.sloc.logical += amount;

    if (currentReport) {
        currentReport.complexity.sloc.logical += amount;
    }
}

function processComplexity (node, currentReport) {
    incrementCounter(node, 'complexity', incrementComplexity, currentReport);
}

function incrementComplexity (currentReport, amount) {
    report.aggregate.complexity.cyclomatic += amount;

    if (currentReport) {
        currentReport.complexity.cyclomatic += amount;
    }
}

function processOperators (node, currentReport) {
    processHalsteadMetric(node, 'operators', currentReport);
}

function processOperands (node, currentReport) {
    processHalsteadMetric(node, 'operands', currentReport);
}

function processHalsteadMetric (node, metric, currentReport) {
    var syntax = syntaxes[node.type], i, identifier;

    if (check.isArray(syntax[metric])) {
        for (i = 0; i < syntax[metric].length; i += 1) {
            if (check.isFunction(syntax[metric][i].identifier)) {
                identifier = syntax[metric][i].identifier(node);
            } else {
                identifier = syntax[metric][i].identifier;
            }

            if (
                check.isFunction(syntax[metric][i].filter) === false ||
                syntax[metric][i].filter(node) === true
            ) {
                halsteadItemEncountered(currentReport, metric, identifier);
            }
        }
    }
}

function halsteadItemEncountered (currentReport, metric, identifier) {
    if (currentReport) {
        incrementHalsteadItems(currentReport, metric, identifier);
    }

    incrementHalsteadItems(report.aggregate, metric, identifier);
}

function incrementHalsteadItems (baseReport, metric, identifier) {
    incrementDistinctHalsteadItems(baseReport, metric, identifier);
    incrementTotalHalsteadItems(baseReport, metric);
}

function incrementDistinctHalsteadItems (baseReport, metric, identifier) {
    if (Object.prototype.hasOwnProperty(identifier)) {
        // Avoid clashes with built-in property names.
        incrementDistinctHalsteadItems(baseReport, metric, '_' + identifier);
    } else if (isHalsteadMetricDistinct(baseReport, metric, identifier)) {
        recordDistinctHalsteadMetric(baseReport, metric, identifier);
        incrementHalsteadMetric(baseReport, metric, 'distinct');
    }
}

function isHalsteadMetricDistinct (baseReport, metric, identifier) {
    return baseReport.complexity.halstead[metric].identifiers.indexOf(identifier) === -1;
}

function recordDistinctHalsteadMetric (baseReport, metric, identifier) {
    baseReport.complexity.halstead[metric].identifiers.push(identifier);
}

function incrementHalsteadMetric (baseReport, metric, type) {
    if (baseReport) {
        baseReport.complexity.halstead[metric][type] += 1;
    }
}

function incrementTotalHalsteadItems (baseReport, metric) {
    incrementHalsteadMetric(baseReport, metric, 'total');
}

function processChildrenInNewScope (node, assignedName) {
    var newReport = createFunctionReport(safeName(node.id, assignedName), node.loc);

    report.functions.push(newReport);

    processChildren(node, newReport);
}

function processChildren (node, currentReport) {
    var syntax = syntaxes[node.type], i;

    if (check.isArray(syntax.children)) {
        for (i = 0; i < syntax.children.length; i += 1) {
            processChild(
                node[syntax.children[i]],
                check.isFunction(syntax.assignableName) ? syntax.assignableName(node) : '',
                currentReport
            );
        }
    }
}

function processChild (child, assignedName, currentReport) {
    var fn = check.isArray(child) ? processTree : processNode;
    fn(child, assignedName, currentReport);
}

function calculateMetrics () {
    var i, data, averages,

    sums = [ 0, 0, 0 ],

    indices = {
        loc: 0,
        complexity: 1,
        effort: 2
    };

    for (i = 0; i < report.functions.length; i += 1) {
        data = report.functions[i].complexity;

        calculateHalsteadMetrics(data.halstead);
        sumMaintainabilityMetrics(sums, indices, data);
    }

    calculateHalsteadMetrics(report.aggregate.complexity.halstead);
    if (i === 0) {
        // Sane handling of modules that contain no functions.
        sumMaintainabilityMetrics(sums, indices, report.aggregate.complexity);
        i = 1;
    }

    averages = sums.map(function (sum) { return sum / i; });

    calculateMaintainabilityIndex(
        averages[indices.effort],
        averages[indices.complexity],
        averages[indices.loc]
    );
}

function calculateHalsteadMetrics (data) {
    data.length = data.operators.total + data.operands.total;
    if (data.length === 0) {
        nilHalsteadMetrics(data);
    } else {
        data.vocabulary = data.operators.distinct + data.operands.distinct;
        data.difficulty =
            (data.operators.distinct / 2) *
            (data.operands.distinct === 0 ? 1 : data.operands.total / data.operands.distinct);
        data.volume = data.length * (Math.log(data.vocabulary) / Math.log(2));
        data.effort = data.difficulty * data.volume;
        data.bugs = data.volume / 3000;
        data.time = data.effort / 18;
    }
}

function nilHalsteadMetrics (data) {
    data.vocabulary =
        data.difficulty =
        data.volume =
        data.effort =
        data.bugs =
        data.time =
            0;
}

function sumMaintainabilityMetrics (sums, indices, data) {
    sums[indices.loc] += data.sloc.logical;
    sums[indices.complexity] += data.cyclomatic;
    sums[indices.effort] += data.halstead.effort;
}

function calculateMaintainabilityIndex (averageEffort, averageComplexity, averageLoc) {
    if (averageComplexity === 0) {
        throw new Error('Encountered function with cyclomatic complexity zero!');
    }

    if (averageEffort === 0 || averageLoc === 0) {
        report.maintainability = 171;
    } else {
        report.maintainability =
            171 -
            (3.42 * Math.log(averageEffort)) -
            (0.23 * Math.log(averageComplexity)) -
            (16.2 * Math.log(averageLoc));
    }
}

