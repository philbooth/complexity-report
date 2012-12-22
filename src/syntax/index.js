/*globals require, exports */

'use strict';

var fs = require('fs'),
    fsDirectory = './src/syntax',
    requireDirectory = '.';

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
    return fs.readdirSync(fsDirectory);
}

function splitFileName (fileName) {
    return fileName.split('.');
}

function isSyntaxDefinition (fileName, components) {
    if (fs.statSync(pathify(fsDirectory, fileName)).isFile()) {
        return components.length === 2 && components[0] !== 'index' && components[1] === 'js';
    }

    return false;
}

function pathify (path, fileName) {
    return path + '/' + fileName;
}

function setSyntax (syntax, name, settings) {
    syntax[name] = require(pathify(requireDirectory, name)).get(settings);
}

