/*globals exports, JSON */

'use strict';

exports.format = format;

function format (result) {
    return JSON.stringify(result, undefined, 4);
}

