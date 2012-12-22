/*globals require, exports */

'use strict';

var check = require('check-types'),
    operatorTraits = require('./operators'),
    operandTraits = require('./operands');

exports.actualise = actualiseTraits;

function actualiseTraits (lloc, complexity, operators, operands, children, assignableName, newScope) {
    return {
        lloc: lloc,
        complexity: complexity,
        operators: operatorTraits.actualise(safeArray(operators)),
        operands: operandTraits.actualise(safeArray(operands)),
        children: safeArray(children),
        assignableName: assignableName,
        newScope: newScope
    };
}

function safeArray (thing) {
    if (typeof thing === 'undefined') {
        return [];
    }

    if (check.isArray(thing)) {
        return thing;
    }

    return [ thing ];
}

