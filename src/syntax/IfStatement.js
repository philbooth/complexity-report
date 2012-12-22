/*globals require, exports */

'use strict';

var traits = require('./traits');

exports.get = get;

function get () {
    return traits.actualise(
        function (node) {
            return node.alternate ? 2 : 1;
        },
        1,
        [
            'if',
            {
                identifier: 'else',
                filter: function (node) {
                    return !!node.alternate;
                }
            }
        ],
        undefined, [ 'test', 'consequent', 'alternate' ]
    );
}

