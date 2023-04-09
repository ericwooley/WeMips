let ExprParser;
ExprParser = ExprParser || {};

ExprParser.LexerError = function(message, text, start, end) {
    this.name = 'LexerError';
    this.message = message;
    this.text = text;
    this.start = start;
    this.end = end;
}

ExprParser.ParseError = function(message, token) {
    this.name = 'ParseError';
    this.message = message;
    this.token = token;
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message) || new Error("Assertion failed");
    }
}

ExprParser.Tokens = {
    Identifier: 'Identifier',
    Register: 'Register',
    Number: 'Number',
    Addition: 'Addition',
    Subtraction: 'Subtraction',
    Multiplication: 'Multiplication',
    Division: 'Division',
    Remainder: 'Remainder',
    BitwiseOR: 'BitwiseOR',
    BitwiseAND: 'BitwiseAND',
    BitwiseXOR: 'BitwiseXOR',
    BitwiseNOT: 'BitwiseNOT',
    LogicalShiftLeft: 'LogicalShiftLeft',
    LogicalShiftRight: 'LogicalShiftRight',
    ArithmeticShiftRight: 'ArithmeticShiftRight',
    LParen: 'LParen',
    RParen: 'RParen',
    Comma: 'Comma',
    EndOfString: 'EndOfString',
}

ExprParser.AtomTypes = {
    '+': ExprParser.Tokens.Addition,
    '-': ExprParser.Tokens.Subtraction,
    '*': ExprParser.Tokens.Multiplication,
    '/': ExprParser.Tokens.Division,
    '%': ExprParser.Tokens.Remainder,
    '|': ExprParser.Tokens.BitwiseOR,
    '&': ExprParser.Tokens.BitwiseAND,
    '^': ExprParser.Tokens.BitwiseXOR,
    '~': ExprParser.Tokens.BitwiseNOT,
    '(': ExprParser.Tokens.LParen,
    ')': ExprParser.Tokens.RParen,
    ',': ExprParser.Tokens.Comma,
}

ExprParser.isWhitespace = function(ch) {
    return (ch=='\t' || ch==' ');
}

ExprParser.DigitsUpperCase = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
ExprParser.DigitsLowerCase = "0123456789abcdefghijklmnopqrstuvwxyz";

ExprParser.isBaseDigit = function(ch, base) {
    assert(base <= 36);
    if (ch >= '0' && ch <= '9') {
        return (base >= 10 || ExprParser.DigitsUpperCase.charAt(base));
    } else if (ch >= 'A' && ch <= 'Z') {
        return (ch <= ExprParser.DigitsUpperCase.charAt(base));
    } else if (ch >= 'a' && ch <= 'z') {
        return (ch <= ExprParser.DigitsLowerCase.charAt(base));
    } else {
        return false;
    }
}

ExprParser.isDigit = function(ch) {
    return (ch >= '0' && ch <= '9');
}

ExprParser.isOctalDigit = function(ch) {
    return (ch >= '0' && ch <= '7');
}

ExprParser.isLetter = function(ch) {
    return ((ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z'));
}

ExprParser.isIdentifierStart = function(ch) {
    return ExprParser.isLetter(ch) || ch=='_';
}

ExprParser.isIdentifierPart = function(ch) {
    return ExprParser.isIdentifierStart(ch) || ExprParser.isDigit(ch);
}

ExprParser.Lexer = function(input) {
    this.input = input;
    this.index = 0;
    this.marker = 0;
    this.length = input.length;

    this.endOfString = function() {
        return this.index >= this.length;
    }

    this.startToken = function() {
        this.marker = this.index;
    }

    this.restartToken = function() {
        this.index = this.marker;
    }

    this.peekNextChar = function() {
        return (!this.endOfString() ? this.input.charAt(this.index) : undefined);
    }

    this.nextChar = function() {
        return (!this.endOfString() ? this.input.charAt(this.index++) : undefined);
    }

    this.skipChar = function() {
        if (!this.endOfString()) {
            this.index++;
        }
    }

    this.error = function(message) {
        throw new ExprParser.LexerError(message, this.input.substring(this.marker, this.index), this.marker, this.index);
    }

    this.skipSpaces = function() {
        let ch;
        while (!this.endOfString()) {
            ch = this.peekNextChar();
            if (!ExprParser.isWhitespace(ch)) {
                break;
            }
            this.skipChar();
        }
    }

    this.createToken = function(type, value) {
        return {
            type: type,
            value: value,
            begin: this.marker,
            end: this.index
        };
    }

    this.parseAnyNumber = function(base) {
        let str = '';
        let ch = this.peekNextChar()
        while (ExprParser.isBaseDigit(ch, base)) {
            this.skipChar();
            str = str + ch;
            ch = this.peekNextChar();
        }
        return this.createToken(ExprParser.Tokens.Number, parseInt(str, base));
    }

    this.parseRegister = function() {
        this.skipChar();
        let ch = this.peekNextChar();
        let id = '';
        while (ExprParser.isIdentifierPart(ch)) {
            id = id + ch;
            this.skipChar();
            ch = this.peekNextChar();
        }
        return this.createToken(ExprParser.Tokens.Register, '$'+id);
    }

    this.parseNumber = function() {
        let ch = this.peekNextChar();
        if (ch == '0') {
            this.skipChar();
            ch = this.peekNextChar();
            switch (ch) {
            case 'b': case 'B':
                this.skipChar();
                return this.parseAnyNumber(2);
            case 'x': case 'X':
                this.skipChar();
                return this.parseAnyNumber(16);
            default:
                if (ExprParser.isOctalDigit(ch)) {
                    return this.parseAnyNumber(8);
                } else {
                    return this.createToken(ExprParser.Tokens.Number, 0);
                }
            }
        } else {
            return this.parseAnyNumber(10);
        }
    }

    this.parseIdentifier = function() {
        let id = this.nextChar();
        let ch = this.peekNextChar();
        while (ExprParser.isIdentifierPart(ch)) {
            id = id + ch;
            this.skipChar();
            ch = this.peekNextChar();
        }
        return this.createToken(ExprParser.Tokens.Identifier, id);
    }

    this.parseAtom = function() {
        let ch = this.peekNextChar();
        if (ch == '<') {
            this.skipChar();
            if (ch == '<') {
                this.skipChar();
                return this.createToken(ExprParser.Tokens.LogicalShiftLeft);
            } else {
                this.error('Unknown token');
            }
        } else if (ch == '>') {
            this.skipChar();
            if (ch == '>') {
                this.skipChar();
                if (ch == '>') {
                    this.skipChar();
                    return this.createToken(ExprParser.Tokens.LogicalShiftRight);
                } else {
                    return this.createToken(ExprParser.Tokens.ArithmeticShiftRight);
                }
            } else {
                this.error('Unknown token');
            }
        } else if (ch in ExprParser.AtomTypes) {
            this.skipChar();
            return this.createToken(ExprParser.AtomTypes[ch]);
        }
        this.error('Unknown token');
    }

    this.next = function() {
        this.skipSpaces();

        this.startToken();
        if (this.endOfString()) {
            return this.createToken(ExprParser.Tokens.EndOfString);
        }

        let ch = this.peekNextChar();
        if (ch == '$') {
            return this.parseRegister();
        } else if (ExprParser.isDigit(ch)) {
            return this.parseNumber();
        } else if (ExprParser.isIdentifierStart(ch)) {
            return this.parseIdentifier();
        } else {
            return this.parseAtom();
        }
    }

    this.peek = function() {
        let token, idx;

        idx = this.index;
        try {
            token = this.next();
        } finally {
            this.index = idx;
        }

        return token;
    }
}

ExprParser.BinaryOperators = {}
ExprParser.BinaryOperators[ExprParser.Tokens.BitwiseOR] = {
    evaluate: function(left, right) { return left | right; },
    precedence: 13
}
ExprParser.BinaryOperators[ExprParser.Tokens.BitwiseXOR] = {
    evaluate: function(left, right) { return left ^ right; },
    precedence: 12
}
ExprParser.BinaryOperators[ExprParser.Tokens.BitwiseAND] = {
    evaluate: function(left, right) { return left & right; },
    precedence: 11
}
ExprParser.BinaryOperators[ExprParser.Tokens.Addition] = {
    evaluate: function(left, right) { return left + right; },
    precedence: 6
}
ExprParser.BinaryOperators[ExprParser.Tokens.Subtraction] = {
    evaluate: function(left, right) { return left - right; },
    precedence: 6
}
ExprParser.BinaryOperators[ExprParser.Tokens.Multiplication] = {
    evaluate: function(left, right) { return left * right; },
    precedence: 5
}
ExprParser.BinaryOperators[ExprParser.Tokens.Division] = {
    evaluate: function(left, right) { return Math.trunc(left / right); },
    precedence: 5
}
ExprParser.BinaryOperators[ExprParser.Tokens.Remainder] = {
    evaluate: function(left, right) { return left % right; },
    precedence: 5
}

ExprParser.UnaryOperators = {}
ExprParser.UnaryOperators[ExprParser.Tokens.Addition] = {
    evaluate: function(op) { return op; }
}
ExprParser.UnaryOperators[ExprParser.Tokens.Subtraction] = {
    evaluate: function(op) { return -op; }
}
ExprParser.UnaryOperators[ExprParser.Tokens.BitwiseNOT] = {
    evaluate: function(op) { return ~op; }
}

ExprParser.Builtins = {
    'lo16': {
        evaluate: function(op) { return op[0] & 65535; }
    },
    'hi16': {
        evaluate: function(op) { return (op[0] >>> 16) & 65535; }
    },
}

ExprParser.Parser = function(input) {
    this.lexer = new ExprParser.Lexer(input);
    this.token = undefined;

    this.peekToken = function() {
        if (this.token == undefined) {
            this.token = this.lexer.next();
        }
        return this.token;
    }

    this.checkNext = function(type) {
        let token = this.peekToken();
        return (token.type == type);
    }

    this.nextToken = function() {
        this.token = this.lexer.next();
        return this.token;
    }

    this.consume = function(type) {
        let token = this.peekToken();
        if (type && token.type != type) {
            throw new ExprParser.ParseError('Expected \''+type+'\', got \''+token.type+'\'', token);
        }
        this.nextToken();
        return token;
    }

    this.parsePrimaryExpression = function() {
        if (this.checkNext(ExprParser.Tokens.LParen)) {
            this.consume();
            let expr = this.parseExpression();
            this.consume(ExprParser.Tokens.RParen);
            return expr;
        } else {
            let number = this.consume(ExprParser.Tokens.Number);
            return number.value;
        }
    }

    this.parsePostfixExpression = function() {
        let token= this.peekToken();
        if (token.type == ExprParser.Tokens.Identifier) {
            if (token.value in ExprParser.Builtins) {
                let builtin = ExprParser.Builtins[token.value];
                this.consume();
                this.consume(ExprParser.Tokens.LParen);
                let params = [this.parseExpression()];
                while (this.checkNext(ExprParser.Tokens.Comma)) {
                    this.consume();
                    params.push(this.parseExpression());
                }
                this.consume(ExprParser.Tokens.RParen);
                return builtin.evaluate(params);
            } else {
                throw new ExprParser.ParseError('Unknown builtin function', token);
            }
        } else {
            return this.parsePrimaryExpression();
        }
    }

    this.parseUnaryOperator = function() {
        let operator = this.peekToken();
        if (operator.type in ExprParser.UnaryOperators) {
            this.consume();
            return ExprParser.UnaryOperators[operator.type];
        } else {
            return undefined;
        }
    }

    this.parseUnaryExpression = function() {
        let operator = this.parseUnaryOperator();
        if (operator) {
            let operand = this.parseUnaryExpression();
            return operator.evaluate(operand);
        } else {
            return this.parsePostfixExpression();
        }
    }

    this.parseBinaryOperator = function() {
        let operator = this.peekToken();
        if (operator.type in ExprParser.BinaryOperators) {
            this.consume();
            return ExprParser.BinaryOperators[operator.type];
        } else {
            return undefined;
        }
    }

    this.parseBinaryExpression = function() {
        let lhs = this.parseUnaryExpression();
        let leftOperator = this.parseBinaryOperator();
        if (leftOperator) {
            let rhs = this.parseUnaryExpression();
            let operands = [];
            let operators = [];
            let rightOperator = this.parseBinaryOperator();

            while (rightOperator) {
                if (rightOperator.precedence < leftOperator.precedence) {
                    /* Must evaluate the right side first => push */
                    operands.push(lhs);
                    operators.push(leftOperator);
                    lhs = rhs;
                } else {
                    /* No right side or left side has higher precedence => evaluate left side */
                    lhs = leftOperator.evaluate(lhs, rhs);
                }
                leftOperator = rightOperator;
                rhs = this.parseUnaryExpression();
                rightOperator = this.parseBinaryOperator();
            }

            /* Perform all the pending operations */
            while (leftOperator) {
                rhs = leftOperator.evaluate(lhs, rhs);
                lhs = operands.pop();
                leftOperator = operators.pop();
            }

            return rhs;
        } else {
            return lhs;
        }
    }

    this.parseExpression = function() {
        return this.parseBinaryExpression();
    }

    this.parseRegister = function() {
        let token = this.consume(ExprParser.Tokens.Register);
        return token.value;
    }
}
