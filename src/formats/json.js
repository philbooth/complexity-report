/*globals exports, JSON */

'use strict';

exports.format = format;

function format (reports) {
    return JSON.stringify(reports, undefined, 2);
}

