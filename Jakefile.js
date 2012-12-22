/*jshint nomen:false */
/*globals require, console, complete, __dirname, process */

(function () {
    'use strict';

    var exec = require('child_process').exec,

    commands = {
        test: './node_modules/.bin/mocha --ui tdd --reporter spec --colors ./test/complexityReport.js',
        lint: './node_modules/.bin/jshint ./src --config config/jshint.json',
        prepare: 'npm install'
    };

    desc('Run the unit tests.');
    task('test', function () {
        runTask(test, 'Testing...');
    }, {
        async: true
    });

    desc('Lint the source code.');
    task('lint', function () {
        runTask(lint, 'Linting...');
    }, {
        async: true
    });

    desc('Install dependencies.');
    task('prepare', function () {
        runTask(prepare, 'Preparing the build environment...');
    }, {
        async: true
    });

    function runTask (operation, message) {
        console.log(message);
        operation();
    }

    function test () {
        runCommand(commands.test);
    }

    function lint () {
        runCommand(commands.lint);
    }

    function prepare () {
        runCommand(commands.prepare);
    }

    function runCommand (command) {
        exec(command, { cwd: __dirname }, function (error, stdout, stderr) {
            console.log(stdout);
            console.log(stderr);
            if (typeof error === 'object' && error !== null) {
                console.log(error.message);
                process.exit(1);
            }
            complete();
        });
    }
}());

