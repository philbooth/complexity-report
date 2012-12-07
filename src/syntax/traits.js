/*globals require, exports */

var operatorTraits = require('operators'),
    operandTraits = require('operands');

module.exports = {
    actualise: actualiseTraits,
    actualiseOperand: actualiseOperand
};

function actualiseTraits (lloc, complexity, operators, operands, children, assignableName) {
    return {
        lloc: lloc,
        complexity: complexity,
        operators: operatorTraits.actualise(operators),
        operands: operandTraits.actualise(operands),
        children: children,
        assignableName: assignableName
    };
}

function actualiseOperand (operand) {
    return actualiseTraits(undefined, undefined, undefined, [ operand ]);
}

function actualiseChild (operand) {
    return actualiseTraits(undefined, undefined, undefined, undefined, [ child ]);
}

