/*globals require, exports */

'use strict';

var traits = require('./traits');

exports.get = getIdentifier;

function getIdentifier () {
    return traits.actualiseOperand(function (node) { return node.name; });
}

