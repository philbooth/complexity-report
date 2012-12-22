/*globals require, exports */

'use strict';

var traits = require('./traits');

exports.get = get;

function get () {
    return traits.actualise(
        0, 0,
        function (node) {
            return node.operator + ' (' + (node.prefix ? 'pre' : 'post') + 'fix)';
        },
        undefined, [ 'argument' ]
    );
}

