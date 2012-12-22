#!/usr/bin/env node

/*globals require, process, console */

'use strict';

var reports = [],

cli = require('commander'),
fs = require('fs'),
cr = require('./complexityReport'),
check = require('check-types'),
options,
formatter,

state = {
    reading: true,
    unread: 0,
    tooComplex: false
};

parseCommandLine();
readSourceFiles();

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
            '-t, --threshold <complexity>',
            'specifify the per-function complexity threshold',
            function (value) {
                return parseInt(value, 10);
            }
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
            '-c, --trycatch',
            'treat catch clauses as source of cyclomatic complexity'
        );

    cli.parse(process.argv);

    options = {
        logicalor: !cli.logicalor,
        switchcase: !cli.switchcase,
        forin: cli.forin || false,
        trycatch: cli.trycatch || false
    };

    if (check.isUnemptyString(cli.format) === false) {
        cli.format = 'plain';
    }
    formatter = require('./formats/' + cli.format);
}

function readSourceFiles () {
    var i;

    for (i = 0; i < cli.args.length; i += 1) {
        state.unread += 1;
        readSourceFile(cli.args[i]);
    }

    state.reading = false;
}

function readSourceFile (path) {
    fs.readFile(path, 'utf8', function (err, source) {
        if (err) {
            error('readSourceFile', err);
        }

        if (beginsWithShebang(source)) {
            source = commentFirstLine(source);
        }

        getReport(path, source);

        finish();
    });
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

function getReport (path, source) {
    var report = cr.run(source, options);

    if (
        state.tooComplex === false &&
        check.isNumber(cli.threshold) &&
        isTooComplex(report)
    ) {
        state.tooComplex = true;
    }

    report.module = path;

    reports.push(report);
}

function isTooComplex (report) {
    var i;

    for (i = 0; i < report.functions.length; i += 1) {
        if (report.functions[i].complexity.cyclomatic > cli.threshold) {
            return true;
        }
    }

    return false;
}

function finish () {
    state.unread -= 1;

    if (state.reading === false && state.unread === 0) {
        if (!cli.silent) {
            writeReport();
        }

        if (state.tooComplex) {
            fail('Warning: Complexity threshold breached!');
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

