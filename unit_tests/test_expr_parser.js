module('Expression Parser');

parseSingleToken = function(text) {
    let lexer = new Parser.Lexer(text);
    return lexer.next();
}

test("Lexer", function() {
    let token;

    token = parseSingleToken('$t0');
    equal(token.type, Parser.Tokens.Register);
    equal(token.value, '$t0');

    token = parseSingleToken(' 102');
    equal(token.type, Parser.Tokens.Number);
    equal(token.value, 102);

    token = parseSingleToken('0b1011');
    equal(token.type, Parser.Tokens.Number);
    equal(token.value, 11);

    token = parseSingleToken('0770');
    equal(token.type, Parser.Tokens.Number);
    equal(token.value, 0770);

    token = parseSingleToken('0xab12');
    equal(token.type, Parser.Tokens.Number);
    equal(token.value, 0xab12);

    token = parseSingleToken('abc');
    equal(token.type, Parser.Tokens.Identifier);
    equal(token.value, 'abc');

    token = parseSingleToken('+');
    equal(token.type, Parser.Tokens.Addition);

    token = parseSingleToken('<<');
    equal(token.type, Parser.Tokens.LogicalShiftLeft);

    token = parseSingleToken('>>>');
    equal(token.type, Parser.Tokens.LogicalShiftRight);
});

parseExpression = function(text) {
    let parser = new Parser.ExprParser(text);
    return parser.parseExpression();
}

test('Expression Parser', function() {
    equal(parseExpression('5|9'), 13);
    equal(parseExpression('5&9'), 1);
    equal(parseExpression('5^9'), 12);
    equal(parseExpression('1+2'), 3);
    equal(parseExpression('1-2'), -1);
    equal(parseExpression('2*3'), 6);
    equal(parseExpression('5/2'), 2);
    equal(parseExpression('5%2'), 1);
    equal(parseExpression('+2'), 2);
    equal(parseExpression('-2'), -2);
    equal(parseExpression('~2'), ~2);
    equal(parseExpression('1+2*3'), 7);
    equal(parseExpression('(1+2)*3'), 9);
    equal(parseExpression('lo16(0x12345678)'), 0x5678);
    equal(parseExpression('hi16(0x12345678)'), 0x1234);
});

parseRegister = function(text) {
    let parser = new Parser.ExprParser(text);
    return parser.parseRegister();
}

test('Operand Parser', function() {
    equal(parseRegister('$t0'), '$t0');
});