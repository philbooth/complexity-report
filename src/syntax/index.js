/*jshint nomen:false */
/*globals require, __dirname, exports */

'use strict';

var fs = require('fs'),
    path = require('path');

exports.get = getSyntax;

function getSyntax (settings) {
    var syntax = {}, fileNames, i, fileName, components;

    fileNames = getSyntaxFileNames();

    for (i = 0; i < fileNames.length; i += 1) {
        fileName = fileNames[i];
        components = splitFileName(fileName);

        if (isSyntaxDefinition(fileName, components)) {
            setSyntax(syntax, components[0], settings);
        }
    }

    return syntax;
}

function getSyntaxFileNames () {
    return fs.readdirSync(__dirname);
}

function splitFileName (fileName) {
    return fileName.split('.');
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

function setSyntax (syntax, name, settings) {
    syntax[name] = require(pathify('.', name)).get(settings);
}

