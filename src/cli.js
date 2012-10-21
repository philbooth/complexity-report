/*globals require, process */

(function () {
    'use strict';

    var reports = {},

    cli = require('commander'),
    fs = require('fs'),
    cr = require('./complexityReport'),
    check = require('check-types'),
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
                'Specify an output file for the report'
            ).
            option(
                '-f, --format <format>',
                'Specify the output format of the report'
            ).
            //option(
            //    '-lo, --logicalor',
            //    'Disable complexity reporting of operator ||'
            //).
            //option(
            //    '-t, --ternary',
            //    'Disable complexity reporting of operator ?:'
            //).
            //option(
            //    '-sc, --switchcase',
            //    'Disable complexity reporting of switch statements'
            //).
            //option(
            //    '-fi, --forin',
            //    'Enable complexity reporting of for...in statements'
            //).
            //option(
            //    '-tc, --trycatch',
            //    'Enable complexity reporting of catch clauses'
            //).
            option(
                '-th, --threshold <complexity>',
                'Set a per-function complexity threshold beyond which the process will fail on exit'
            );

        if (check.isUnemptyString(cli.format) === false) {
            cli.format = 'plain';
        }

        formatter = require('./formats/' + cli.format);
    }

    function readSourceFiles () {
        var path;

        for (path in cli.files) {
            if (cli.files.hasOwnProperty(path)) {
                state.unread += 1;
                readSourceFile(path);
            }
        }

        state.reading = false;
    }

    function readSourceFile (path) {
        fs.readFile(sourcePath, 'utf8', function (error, source) {
            if (error) {
                console.log('Fatal error: ' + error.message);
                process.exit(1);
            }

            finish();
        });
    }

    function finish () {
        state.unread -= 1;

        if (state.reading === false && state.unread === 0) {
            writeReport();
        }
    }

    function writeReport () {
        var formatted = formatter.format(reports);

        if (cli.output) {
            fs.writeFile(cli.output, formatted, 'utf8', function (error) {
                if (error) {
                    console.log('Fatal error: ' + error.message);
                    process.exit(1);
                }

                exit();
            });
        }
    }

    function exit () {
        // TODO: Refactor all the exity stuff
        // TODO: Refactor all the loggy stuff
        // TODO: Use Q

        if (state.tooComplex) {
            console.log('Complexity threshold breached');
            process.exit(1);
        }

        console.log('Done');
    }
}());

