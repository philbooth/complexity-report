/*globals require, exports */

'use strict';

var traits = require('./traits');

exports.get = getIdentifier;

function getIdentifier () {
    return traits.actualiseChild('body');
}

