/*globals exports, require */

'use strict';

var path, check, moduleAnalyser;

exports.analyse = analyse;

path = require('path');
check = require('check-types');
moduleAnalyser = require('./module');

function analyse (modules, options) {
    // TODO: Asynchronize.

    var reports;

    check.verifyArray(modules, 'Invalid modules');

    reports = modules.map(function (m) {
        var report;

        check.verifyUnemptyString(m.source, 'Invalid source');
        check.verifyUnemptyString(m.path, 'Invalid source');

        report = moduleAnalyser.analyse(m.source, options);
        report.path = m.path;

        return report;
    }, []);

    return {
        reports: reports,
        matrices: [ createAdjacencyMatrix(reports) ]
    };
}

// TODO: Move this dependency stuff into a separate module
function createAdjacencyMatrix (reports) {
    var matrix = new Array(reports.length);

    reports.sort(function (lhs, rhs) {
        return comparePaths(lhs.path, rhs.path);
    }).forEach(function (ignore, x) {
        matrix[x] = new Array(reports.length);
        reports.forEach(function (ignore, y) {
            matrix[x][y] = getAdjacencyMatrixValue(reports, x, y);
        });
    });

    //console.log(matrix);

    return matrix;
}

function comparePaths (lhs, rhs) {
    var lsplit = lhs.split(path.sep), rsplit = rhs.split(path.sep);

    if (lsplit.length < rsplit.length || (lsplit.length === rsplit.length && lhs < rhs)) {
        return -1;
    }

    if (lsplit.length > rsplit.length || (lsplit.length === rsplit.length && lhs > rhs)) {
        return 1;
    }

    return 0;
}

function getAdjacencyMatrixValue (reports, x, y) {
    if (x === y) {
        return null;
    }

    if (doesDependencyExist(reports[x], reports[y])) {
        return 1;
    }

    return 0;
}

function doesDependencyExist (from, to) {
    return from.dependencies.reduce(function (result, dependency) {
        if (result === false) {
            return checkDependency(from.path, dependency, to.path);
        }

        return true;
    }, false);
}

function checkDependency (from, dependency, to) {
    if (isCommonJSDependency(dependency)) {
        if (isInternalCommonJSDependency(dependency)) {
            return isDependency(from, dependency, to);
        }

        return false;
    }

    return isDependency(from, dependency, to);
}

function isCommonJSDependency (dependency) {
    return dependency.type === 'CommonJS';
}

function isInternalCommonJSDependency (dependency) {
    return dependency.path[0] === '.' &&
           (
               dependency.path[1] === path.sep ||
               (
                   dependency.path[1] === '.' &&
                   dependency.path[2] === path.sep
               )
           );
}

function isDependency (from, dependency, to) {
    var dependencyPath = dependency.path;

    if (path.extname(dependencyPath) === '') {
        dependencyPath += path.extname(to);
    }

    return path.resolve(path.dirname(from), dependencyPath) === to;
}

