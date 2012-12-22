/*globals require, exports */

'use strict';

var traits = require('./traits'),
    safeName = require('../safeName');

exports.get = get;

function get () {
    return traits.actualise(
        1, 0,
        {
            identifier: '=',
            filter: function (node) {
                return !!node.init;
            }
        },
        undefined, [ 'id', 'init' ],
        function (node) {
            return safeName(node.id);
        }
    );
}

