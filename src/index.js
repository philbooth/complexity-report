#!/usr/bin/env node

/*globals require, process, console, setImmediate */

'use strict';

var options, formatter, state,

cli = require('commander'),
fs = require('fs'),
path = require('path'),
js = require('escomplex-js'),
check = require('check-types');

parseCommandLine();

state = {
    starting: true,
    openFileCount: 0,
    source: [],
    tooComplex: false,
    failingModules: []
};

expectFiles(cli.args, cli.help.bind(cli));
readFiles(cli.args);

function parseCommandLine () {
    var config;

    cli.
        usage('[options] <path>').
        option('-c, --config <path>', 'specify path to configuration JSON file').
        option('-o, --output <path>', 'specify an output file for the report').
        option('-f, --format <format>', 'specify the output format of the report').
        option('-a, --allfiles', 'include hidden files in the report').
        option('-p, --filepattern <pattern>', 'specify the files to process using a regular expression to match against file names').
        option('-P, --dirpattern <pattern>', 'specify the directories to process using a regular expression to match against directory names').
        option('-m, --maxfiles <number>', 'specify the maximum number of files to have open at any point', parseInt).
        option('-F, --maxfod <first-order density>', 'specify the per-project first-order density threshold', parseFloat).
        option('-O, --maxcost <change cost>', 'specify the per-project change cost threshold', parseFloat).
        option('-S, --maxsize <core size>', 'specify the per-project core size threshold', parseFloat).
        option('-M, --minmi <maintainability index>', 'specify the per-module maintainability index threshold', parseFloat).
        option('-C, --maxcyc <cyclomatic complexity>', 'specify the per-function cyclomatic complexity threshold', parseInt).
        option('-Y, --maxcycden <cyclomatic density>', 'specify the per-function cyclomatic complexity density threshold', parseInt).
        option('-D, --maxhd <halstead difficulty>', 'specify the per-function Halstead difficulty threshold', parseFloat).
        option('-V, --maxhv <halstead volume>', 'specify the per-function Halstead volume threshold', parseFloat).
        option('-E, --maxhe <halstead effort>', 'specify the per-function Halstead effort threshold', parseFloat).
        option('-s, --silent', 'don\'t write any output to the console').
        option('-l, --logicalor', 'disregard operator || as source of cyclomatic complexity').
        option('-w, --switchcase', 'disregard switch statements as source of cyclomatic complexity').
        option('-i, --forin', 'treat for...in statements as source of cyclomatic complexity').
        option('-t, --trycatch', 'treat catch clauses as source of cyclomatic complexity').
        option('-n, --newmi', 'use the Microsoft-variant maintainability index (scale of 0 to 100)').
        parse(process.argv);

    config = readConfig(cli.config);

    Object.keys(config).forEach(function (key) {
        if (cli[key] === undefined) {
            cli[key] = config[key];
        }
    });

    options = {
        logicalor: !cli.logicalor,
        switchcase: !cli.switchcase,
        forin: cli.forin || false,
        trycatch: cli.trycatch || false,
        newmi: cli.newmi || false
    };

    if (check.unemptyString(cli.format) === false) {
        cli.format = 'plain';
    }

    if (check.unemptyString(cli.filepattern) === false) {
        cli.filepattern = '\\.js$';
    }
    cli.filepattern = new RegExp(cli.filepattern);

    if (check.unemptyString(cli.dirpattern)) {
        cli.dirpattern = new RegExp(cli.dirpattern);
    }

    if (check.number(cli.maxfiles) === false) {
        cli.maxfiles = 1024;
    }

    try {
        formatter = require('./formats/' + cli.format);
    } catch (err) {
        formatter = require(cli.format);
    }
}

function readConfig (configPath) {
    var configInfo;

    try {
        if (check.not.unemptyString(configPath)) {
            configPath = path.join(process.cwd(), '.complexrc');
        }

        if (fs.existsSync(configPath)) {
            configInfo = fs.statSync(configPath);

            if (configInfo.isFile()) {
                return JSON.parse(fs.readFileSync(configPath), { encoding: 'utf8' });
            }
        }

        return {};
    } catch (err) {
        error('readConfig', err);
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

        setSource(filePath, source);
    });
}

function isOpenFileLimitReached () {
    return state.openFileCount >= cli.maxfiles;
}

function error (functionName, err) {
    fail('Fatal error [' + functionName + ']: ' + err.message);
    process.exit(1);
}

function fail (message) {
    console.log(message);
}

function beginsWithShebang (source) {
    return source[0] === '#' && source[1] === '!';
}

function commentFirstLine (source) {
    return '//' + source;
}

function setSource (modulePath, source) {
    state.source.push({
        path: modulePath,
        code: source
    });

    if (state.starting === false && state.openFileCount === 0) {
        getReports();
    }
}

function getReports () {
    var result, failingModules;

    try {
        result = js.analyse(state.source, options);

        if (!cli.silent) {
            writeReports(result);
        }

        failingModules = getFailingModules(result.reports);
        if (failingModules.length > 0) {
            return fail('Warning: Complexity threshold breached!\nFailing modules:\n' + failingModules.join('\n'));
        }

        if (isProjectComplexityThresholdSet() && isProjectTooComplex(result)) {
            fail('Warning: Project complexity threshold breached!');
        }
    } catch (err) {
        error('getReports', err);
    }
}

function writeReports (result) {
    var formatted = formatter.format(result);

    if (check.unemptyString(cli.output)) {
        fs.writeFile(cli.output, formatted, 'utf8', function (err) {
            if (err) {
                error('writeReport', err);
            }
        });
    } else {
        console.log(formatted);
    }
}

function getFailingModules (reports) {
    return reports.reduce(function (failingModules, report) {
        if (
            (isModuleComplexityThresholdSet() && isModuleTooComplex(report)) ||
            (isFunctionComplexityThresholdSet() && isFunctionTooComplex(report))
        ) {
            return failingModules.concat(report.path);
        }

        return failingModules;
    }, []);
}

function isModuleComplexityThresholdSet () {
    return check.number(cli.minmi);
}

function isModuleTooComplex (report) {
    if (isThresholdBreached(cli.minmi, report.maintainability, true)) {
        return true;
    }
}

function isThresholdBreached (threshold, metric, inverse) {
    if (!inverse) {
        return check.number(threshold) && metric > threshold;
    }

    return check.number(threshold) && metric < threshold;
}

function isFunctionComplexityThresholdSet () {
    return check.number(cli.maxcyc) || check.number(cli.maxcycden) || check.number(cli.maxhd) || check.number(cli.maxhv) || check.number(cli.maxhe);
}

function isFunctionTooComplex (report) {
    var i;

    for (i = 0; i < report.functions.length; i += 1) {
        if (isThresholdBreached(cli.maxcyc, report.functions[i].cyclomatic)) {
            return true;
        }

        if (isThresholdBreached(cli.maxcycden, report.functions[i].cyclomaticDensity)) {
            return true;
        }

        if (isThresholdBreached(cli.maxhd, report.functions[i].halstead.difficulty)) {
            return true;
        }

        if (isThresholdBreached(cli.maxhv, report.functions[i].halstead.volume)) {
            return true;
        }

        if (isThresholdBreached(cli.maxhe, report.functions[i].halstead.effort)) {
            return true;
        }
    }

    return false;
}

function isProjectComplexityThresholdSet () {
    return check.number(cli.maxfod) || check.number(cli.maxcost) || check.number(cli.maxsize);
}

function isProjectTooComplex (result) {
    if (isThresholdBreached(cli.maxfod, result.firstOrderDensity)) {
        return true;
    }

    if (isThresholdBreached(cli.maxcost, result.changeCost)) {
        return true;
    }

    if (isThresholdBreached(cli.maxsize, result.coreSize)) {
        return true;
    }

    return false;
}

