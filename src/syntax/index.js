/*jshint nomen:false */
/*globals require, exports, __dirname */

'use strict';

var fs = require('fs'),
    loaded = false,
    syntaxModules = [];

exports.get = getSyntax;

function getSyntax (settings) {
    var syntax = {}, name;

    if (loaded === false) {
        loadSyntaxModules();
        loaded = true;
    }

    for (name in syntaxModules) {
        if (syntaxModules.hasOwnProperty(name)) {
            setSyntax(syntax, name, settings);
        }
    }

    return syntax;
}

function loadSyntaxModules () {
    var fileNames, i, fileName, components;

    fileNames = getSyntaxFileNames();

    for (i = 0; i < fileNames.length; i += 1) {
        fileName = fileNames[i];
        components = fileName.split('.');

        if (isSyntaxDefinition(fileName, components)) {
            loadSyntaxModule(components[0]);
        }
    }
}

function getSyntaxFileNames () {
    return fs.readdirSync(__dirname);
}

function isSyntaxDefinition (fileName, components) {
    if (fs.statSync(pathify(__dirname, fileName)).isFile()) {
        return components.length === 2 && components[0] !== 'index' && components[1] === 'js';
    }

    return false;
}

function pathify (directory, fileName) {
    return directory + '/' + fileName;
}

function loadSyntaxModule (name) {
    syntaxModules[name] = require(pathify('.', name));
}

function setSyntax (syntax, name, settings) {
    syntax[name] = syntaxModules[name].get(settings);
}

