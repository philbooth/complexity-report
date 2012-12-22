/*globals require, exports */

'use strict';

var traits = require('./traits');

exports.get = get;

function get () {
    return traits.actualise(
        1,
        function (node) {
            return node.test ? 1 : 0;
        },
        'while', undefined, [ 'test', 'body' ]
    );
}

