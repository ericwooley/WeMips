module('New Parser');

test("Lexer", function() {
    let parseSingleToken = function(text) {
        let lexer = new Parser.Lexer(text);
        return lexer.next();
    };
    
    let token;

    token = parseSingleToken('$t0');
    equal(token.type, Parser.TokenType.Register);
    equal(token.value, '$t0');

    token = parseSingleToken(' 102');
    equal(token.type, Parser.TokenType.Number);
    equal(token.value, 102);

    token = parseSingleToken('0b1011');
    equal(token.type, Parser.TokenType.Number);
    equal(token.value, 11);

    token = parseSingleToken('0770');
    equal(token.type, Parser.TokenType.Number);
    equal(token.value, 0770);

    token = parseSingleToken('0xab12');
    equal(token.type, Parser.TokenType.Number);
    equal(token.value, 0xab12);

    token = parseSingleToken('abc');
    equal(token.type, Parser.TokenType.Identifier);
    equal(token.value, 'abc');

    token = parseSingleToken('+');
    equal(token.type, Parser.TokenType.Addition);

    token = parseSingleToken('<<');
    equal(token.type, Parser.TokenType.LogicalShiftLeft);

    token = parseSingleToken('>>>');
    equal(token.type, Parser.TokenType.LogicalShiftRight);
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
    equal(parseExpression('1<<2'), 1<<2);
    equal(parseExpression('5>>2'), 5>>2);
    equal(parseExpression('-5>>2'), -5>>2);
    equal(parseExpression('-5>>>2'), -5>>>2);
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
    deepEqual(parseOperand('(4+2*5)($t0)', 'parseLoadStoreAddress', 16),
        {imm: '14', '$rs': '$t0'});
});

test('Instruction Parsing', function() {
    function isValidLine(line) {
        let instructionParser = Parser.instructionParserFromString(line);
        try {
            instructionParser.parseInstruction();
            instructionParser.tokenStream.enforceCompletion()
        } catch (e) {
            if (e instanceof Parser.Error) {
                return false;
            } else {
                throw e;
            }
        }
        return true;
    }
	ok(isValidLine("ADD $t0, $t1, $t2"), "ADD should have 3 registers as arguments.");
	ok(!isValidLine("ADD $t0, $t1, 515"), "ADD should not be able to have an immediate as last argument.");
	ok(!isValidLine("ADDI $t0, $t1, $t2"));
	ok(isValidLine("ADDI $t0, $t1, 515"));
	ok(!isValidLine("ADD $t0, $t1, $t2, $t3"), "Adding extra params should not be allowed.");
	ok(!isValidLine("J label1, label2"), "Adding extra params should not be allowed.");
	ok(isValidLine("ADDI $t0, $t1, -515"), "Immediates can be negative.");
	ok(isValidLine("ADDI $t0, $t1, +515"), "Immediates can have plus sign.");
	ok(!isValidLine("ADDI $t0, $t1, 1.5"), "Immediates must be integers.");
	ok(isValidLine("ADDI $t0, $t1, -  515"), "Spaces are allowed between the minus sign and the number.");
	ok(isValidLine("ADDI $t0, $t1, +  515"), "Spaces are allowed between the plus sign and the number.");
	ok(!isValidLine("ADD $z0, $t1, $t2"), "z0 is not a valid register.");
	ok(isValidLine("adD $t0, $t1, $t2"), "instruction case doesn't matter.");
	ok(!isValidLine("ADD $T0, $t1, $t2"), "register case DOES matter.");
	ok(!isValidLine("FOO $t0, $t1, $t2"), "foo is not a valid instruction.");
	ok(isValidLine("JAL label"));
	ok(isValidLine("J label"));
	ok(isValidLine("LW $s1, 16( $sp )"), "spaces allowed between parens");
	ok(isValidLine("LUI $t0, hi16(0x12345678)"), "hi16 call allowed");
	ok(isValidLine("ADDIU $t0, $t0, lo16(0x12345678)"), "lo16 call allowed");
	ok(!isValidLine("ADDIU $t0, $t0, lo16(0x12345678"), "missing paren leads to error");
	ok(isValidLine("LW $t0, lo16(0x12345678)($t0)"), "proper parsing of parens for register-relative address");
	ok(!isValidLine("foobar"), "single word, invalid command (previous failure)");
	ok(!isValidLine("!=@!="), "random symbols");
	ok(isValidLine("syscall"));
	ok(!isValidLine("syscall foo"), "Syscall takes no params");
	ok(!isValidLine("ADD t0, $t1, $t2"), "Must not omit the $ symbols.");
});