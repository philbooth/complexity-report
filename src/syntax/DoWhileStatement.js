/*globals require, exports */

'use strict';

var traits = require('./traits');

exports.get = get;

function get () {
    return traits.actualise(
        2,
        function (node) {
            return node.test ? 1 : 0;
        },
        'dowhile', undefined, [ 'test', 'body' ]
    );
}

