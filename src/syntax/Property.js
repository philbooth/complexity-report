/*globals require, exports */

'use strict';

var traits = require('./traits'),
    safeName = require('../safeName');

exports.get = get;

function get () {
    return traits.actualise(
        1, 0, ':', undefined, [ 'key', 'value' ],
        function (node) {
            return safeName(node.key);
        }
    );
}

