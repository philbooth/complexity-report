/*globals require, exports */

'use strict';

var traits = require('./traits');

exports.get = get;

function get () {
    return traits.actualise(0, 1, ':?', undefined, [ 'test', 'consequent', 'alternate' ]);
}

