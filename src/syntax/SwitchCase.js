/*globals require, exports */

'use strict';

var traits = require('./traits');

exports.get = get;

function get (settings) {
    return traits.actualise(
        1,
        function (node) {
            return settings.switchcase && node.test ? 1 : 0;
        },
        function (node) {
            return node.test ? 'case' : 'default';
        },
        undefined, [ 'test', 'consequent' ]
    );
}

