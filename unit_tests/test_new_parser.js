module('New Parser');

test("Lexer", function() {
    let parseSingleToken = function(text) {
        let lexer = new Parser.Lexer(text);
        return lexer.next();
    };
    
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

test('Expression Parser', function() {
    let parseExpression = function(text) {
        let parser = Parser.exprParserFromString(text);
        return parser.parseExpression();
    };
    
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

test('Operand Parser', function() {
    let parseOperand = function(text, method, ...args) {
        let parser = Parser.operandParserFromString(text);
        return parser[method](args);
    };
    equal(parseOperand('$t0', 'parseRegister'), '$t0');
    throws(function() { parseOperand('$xy', 'parseRegister'); }, Parser.ParseError, '$xy is not a valid register');
    throws(function() { parseOperand('$zero', 'parseWritableRegister'); }, Parser.ParseError, '$zero is not a writable register');
    equal(parseOperand('label', 'parseLabel'), 'label');
    equal(parseOperand('123', 'parseSignedConstant', 16), 123);
    equal(parseOperand('-32768', 'parseSignedConstant', 16), -32768);
    throws(function() { parseOperand('32768', 'parseSignedConstant', 16); }, Parser.ParseError, '32768 is not a signed 16-bit value');
    equal(parseOperand('32768', 'parseUnsignedConstant', 16), 32768);
    throws(function() { parseOperand('65536', 'parseUnsignedConstant', 16); }, Parser.ParseError, '65536 is not an unsigned 16-bit value');
    throws(function() { parseOperand('-32768', 'parseUnsignedConstant', 16); }, Parser.ParseError, '-32768 is not an unsigned 16-bit value');
    equal(parseOperand('32768', 'parseConstant', 16), 32768);
    equal(parseOperand('-32768', 'parseConstant', 16), -32768);
    throws(function() { parseOperand('65536', 'parseConstant', 16); }, Parser.ParseError, '65536 is not a 16-bit value');
    deepEqual(parseOperand('(4+2*5)($t0)', 'parseLoadStoreAddress'),
        {imm: '14', '$rs': '$t0'});
});