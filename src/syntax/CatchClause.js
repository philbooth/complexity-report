/*globals require, exports */

'use strict';

var traits = require('./traits');

exports.get = get;

function get (settings) {
    return traits.actualise(
        1,
        function (node) {
            return settings.trycatch ? 1 : 0;
        },
        'catch', undefined, [ 'param', 'body' ]
    );
}

