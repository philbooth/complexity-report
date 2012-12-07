/*globals require, exports */

'use strict';

var literal = require('./syntax/literal'),
    identifier = require('./syntax/identifier'),
    blockStatement = require('./syntax/blockStatement');

exports.get = getSyntax;

function getSyntax (settings) {
    // TODO: Call exported get methods from ./syntax/*
    return {
        Literal: literal.get(),
        Identifier: identifier.get(),
        BlockStatement: blockStatement.get(),
        ObjectExpression: ,
        Property: ,
        ThisExpression: ,
        ArrayExpression: ,
        MemberExpression: ,
        CallExpression: ,
        NewExppression: ,
        ExpressionStatement: ,
        VariableDeclaration: ,
        VariableDeclarator: ,
        AssignmentExpression: ,
        UnaryExpression: ,
        UpdateExpression: ,
        BinaryExpression: ,
        LogicalExression: ,
        SequenceExpression: ,
        IfStatement: ,
        ConditionalExpression: ,
        SwitchStatement: ,
        SwitchCase: ,
        BreakStatement: ,
        ContinueStatement: ,
        ForStatement: ,
        ForInStatement: ,
        WhileStatement: ,
        DoWhileStatement: ,
        FunctionDeclaration: ,
        FunctionExpression: ,
        ReturnStatement: ,
        TryStatement: ,
        CatchClause: ,
        ThrowStatement: ,
        WithStatement:
    };
}

