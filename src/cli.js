/*globals require, process */

(function () {
    'use strict';

    var reports = [],

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
                'specify an output file for the report'
            ).
            option(
                '-f, --format <format>',
                'specify the output format of the report'
            ).
            //option(
            //    '-lo, --logicalor',
            //    'disable complexity reporting of operator ||'
            //).
            //option(
            //    '-t, --ternary',
            //    'disable complexity reporting of operator ?:'
            //).
            //option(
            //    '-sc, --switchcase',
            //    'disable complexity reporting of switch statements'
            //).
            //option(
            //    '-fi, --forin',
            //    'enable complexity reporting of for...in statements'
            //).
            //option(
            //    '-tc, --trycatch',
            //    'enable complexity reporting of catch clauses'
            //).
            option(
                '-th, --threshold <complexity>',
                'specifify the per-function complexity threshold'
            );

        cli.parse(process.argv);

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
        fs.readFile(path, 'utf8', function (error, source) {
            if (error) {
                console.log('Fatal error: ' + error.message);
                process.exit(1);
            }

            getReport(path, source);

            finish();
        });
    }

    function getReport (path, source) {
        var report = cr.run(source);

        report.module = path;

        reports.push(report);
    }

    function finish () {
        state.unread -= 1;

        if (state.reading === false && state.unread === 0) {
            writeReport();
        }
    }

    function writeReport () {
        var formatted = formatter.format(reports);

        if (check.isUnemptyString(cli.output)) {
            fs.writeFile(cli.output, formatted, 'utf8', function (error) {
                if (error) {
                    console.log('Fatal error: ' + error.message);
                    process.exit(1);
                }

                exit();
            });
        } else {
            console.log(formatted);
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

