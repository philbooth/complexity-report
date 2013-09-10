#!/usr/bin/env node

/*globals require, process, console, setImmediate */

'use strict';

var options, formatter, filePattern, state, reports = [],

cli = require('commander'),
fs = require('fs'),
path = require('path'),
cr = require('./complexityReport'),
check = require('check-types');

parseCommandLine();

state = {
    starting: true,
    openFileCount: 0,
    tooComplex: false,
    failingModules: []
};

expectFiles(cli.args, cli.help.bind(cli));
readFiles(cli.args);

function parseCommandLine () {
    cli.
        usage('[options] <file...>').
        option(
            '-o, --output <file>',
            'specify an output file for the report'
        ).
        option(
            '-f, --format <format>',
            'specify the output format of the report'
        ).
        option(
            '-a, --allfiles',
            'include hidden files in the report'
        ).
        option(
            '-p, --filepattern <pattern>',
            'specify the files to process using a regular expression to match against file names'
        ).
        option(
            '-r, --dirpattern <pattern>',
            'specify the directories to process using a regular expression to match against directory names'
        ).
        option(
            '-x, --maxfiles <number>',
            'specify the maximum number of files to have open at any point',
            parseInt
        ).
        option(
            '-m, --minmi <maintainability>',
            'specify the per-module maintainability index threshold',
            parseFloat
        ).
        option(
            '-c, --maxcc <complexity>',
            'specify the per-function cyclomatic complexity threshold',
            parseInt
        ).
        option(
            '-d, --maxhd <difficulty>',
            'specify the per-function Halstead difficulty threshold',
            parseFloat
        ).
        option(
            '-v, --maxhv <volume>',
            'specify the per-function Halstead volume threshold',
            parseFloat
        ).
        option(
            '-e, --maxhe <effort>',
            'specify the per-function Halstead effort threshold',
            parseFloat
        ).
        option(
            '-s, --silent',
            'don\'t write any output to the console'
        ).
        option(
            '-l, --logicalor',
            'disregard operator || as source of cyclomatic complexity'
        ).
        option(
            '-w, --switchcase',
            'disregard switch statements as source of cyclomatic complexity'
        ).
        option(
            '-i, --forin',
            'treat for...in statements as source of cyclomatic complexity'
        ).
        option(
            '-t, --trycatch',
            'treat catch clauses as source of cyclomatic complexity'
        ).
        option(
            '-n, --newmi',
            'use the Microsoft-variant maintainability index (scale of 0 to 100)'
        );

    cli.parse(process.argv);

    options = {
        logicalor: !cli.logicalor,
        switchcase: !cli.switchcase,
        forin: cli.forin || false,
        trycatch: cli.trycatch || false,
        newmi: cli.newmi || false
    };

    if (check.isUnemptyString(cli.format) === false) {
        cli.format = 'plain';
    }

    if (check.isUnemptyString(cli.filepattern) === false) {
        cli.filepattern = '\\.js$';
    }
    cli.filepattern = new RegExp(cli.filepattern);

    if (check.isUnemptyString(cli.dirpattern)) {
        cli.dirpattern = new RegExp(cli.dirpattern);
    }

    if (check.isNumber(cli.maxfiles) === false) {
        cli.maxfiles = 1024;
    }

    try {
        formatter = require('./formats/' + cli.format);
    } catch (error) {
        formatter = require(cli.format);
    }
}

function expectFiles (paths, noFilesFn) {
    if (paths.length === 0) {
        noFilesFn();
    }
}

function readFiles (paths) {
    paths.forEach(function (p) {
        var stat = fs.statSync(p);

        if (stat.isDirectory()) {
            if (!cli.dirpattern || cli.dirpattern.test(p)) {
                readDirectory(p);
            }
        } else if (cli.filepattern.test(p)) {
            conditionallyReadFile(p);
        }
    });

    state.starting = false;
}

function readDirectory (directoryPath) {
    readFiles(
        fs.readdirSync(directoryPath).filter(function (p) {
            return path.basename(p).charAt(0) !== '.' || cli.allfiles;
        }).map(function (p) {
            return path.resolve(directoryPath, p);
        })
    );
}

function conditionallyReadFile (filePath) {
    if (isOpenFileLimitReached()) {
        setImmediate(function () {
            conditionallyReadFile(filePath);
        });
    } else {
        readFile(filePath);
    }
}

function readFile (filePath) {
    state.openFileCount += 1;

    fs.readFile(filePath, 'utf8', function (err, source) {
        if (err) {
            error('readFile', err);
        }

        state.openFileCount -= 1;

        if (beginsWithShebang(source)) {
            source = commentFirstLine(source);
        }

        getReport(filePath, source);

        finish();
    });
}

function isOpenFileLimitReached () {
    return state.openFileCount >= cli.maxfiles;
}

function error (functionName, err) {
    fail('Fatal error [' + functionName + ']: ' + err.message);
}

function fail (message) {
    console.log(message);
    process.exit(1);
}

function beginsWithShebang (source) {
    return source[0] === '#' && source[1] === '!';
}

function commentFirstLine (source) {
    return '//' + source;
}

function getReport (filePath, source) {
    var report;

    try {
        report = cr.run(source, options);

        if (state.tooComplex === false && isTooComplex(report)) {
            state.tooComplex = true;
            state.failingModules.push(filePath);
        }

        report.module = filePath;

        reports.push(report);
    } catch (error) {
        console.log('Failed to analyse file `' + filePath + '`');
        console.log('Reason: ' + error.message);
    }
}

function isTooComplex (report) {
    if (
        (isModuleComplexityThresholdSet() && isModuleTooComplex(report)) ||
        (isFunctionComplexityThresholdSet() && isFunctionTooComplex(report))
    ) {
        return true;
    }

    return false;
}

function isModuleComplexityThresholdSet () {
    return check.isNumber(cli.minmi);
}

function isModuleTooComplex (report) {
    if (isThresholdBreached(cli.minmi, report.maintainability, true)) {
        return true;
    }
}

function isThresholdBreached (threshold, metric, inverse) {
    if (!inverse) {
        return check.isNumber(threshold) && metric > threshold;
    }

    return check.isNumber(threshold) && metric < threshold;
}

function isFunctionComplexityThresholdSet () {
    return check.isNumber(cli.maxcc) || check.isNumber(cli.maxhd) || check.isNumber(cli.maxhv) || check.isNumber(cli.maxhe);
}

function isFunctionTooComplex (report) {
    var i;

    for (i = 0; i < report.functions.length; i += 1) {
        if (isThresholdBreached(cli.maxcc, report.functions[i].complexity.cyclomatic)) {
            return true;
        }

        if (isThresholdBreached(cli.maxhd, report.functions[i].complexity.halstead.difficulty)) {
            return true;
        }

        if (isThresholdBreached(cli.maxhv, report.functions[i].complexity.halstead.volume)) {
            return true;
        }

        if (isThresholdBreached(cli.maxhe, report.functions[i].complexity.halstead.effort)) {
            return true;
        }
    }

    return false;
}

function finish () {
    if (state.starting === false && state.openFileCount === 0) {
        if (!cli.silent) {
            writeReport();
        }

        if (state.tooComplex) {
            fail('Warning: Complexity threshold breached!\nFailing modules:\n' + state.failingModules.join('\n'));
        }
    }
}

function writeReport () {
    var formatted = formatter.format(reports);

    if (check.isUnemptyString(cli.output)) {
        fs.writeFile(cli.output, formatted, 'utf8', function (err) {
            if (err) {
                error('writeReport', err);
            }
        });
    } else {
        console.log(formatted);
    }
}

