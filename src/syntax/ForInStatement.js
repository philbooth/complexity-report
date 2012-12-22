/*globals require, exports */

'use strict';

var traits = require('./traits');

exports.get = get;

function get (settings) {
    return traits.actualise(
        1,
        function () {
            return settings.forin ? 1 : 0;
        },
        'forin', undefined, [ 'left', 'right', 'body' ]
    );
}

