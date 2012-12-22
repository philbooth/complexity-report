/*globals require, exports */

'use strict';

var traits = require('./traits');

exports.get = get;

function get (settings) {
    return traits.actualise(
        0,
        function (node) {
            return settings.logicalor && node.operator === '||' ? 1 : 0;
        },
        function (node) {
            return node.operator;
        },
        undefined, [ 'left', 'right' ]
    );
}

