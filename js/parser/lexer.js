Parser.Tokens = {
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

Parser.AtomTypes = {
    '+': Parser.Tokens.Addition,
    '-': Parser.Tokens.Subtraction,
    '*': Parser.Tokens.Multiplication,
    '/': Parser.Tokens.Division,
    '%': Parser.Tokens.Remainder,
    '|': Parser.Tokens.BitwiseOR,
    '&': Parser.Tokens.BitwiseAND,
    '^': Parser.Tokens.BitwiseXOR,
    '~': Parser.Tokens.BitwiseNOT,
    '(': Parser.Tokens.LParen,
    ')': Parser.Tokens.RParen,
    ',': Parser.Tokens.Comma,
}

Parser.isWhitespace = function(ch) {
    return (ch=='\t' || ch==' ');
}

Parser.DigitsUpperCase = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
Parser.DigitsLowerCase = "0123456789abcdefghijklmnopqrstuvwxyz";

Parser.isBaseDigit = function(ch, base) {
    assert(base <= 36);
    if (ch >= '0' && ch <= '9') {
        return (base >= 10 || Parser.DigitsUpperCase.charAt(base));
    } else if (ch >= 'A' && ch <= 'Z') {
        return (ch <= Parser.DigitsUpperCase.charAt(base));
    } else if (ch >= 'a' && ch <= 'z') {
        return (ch <= Parser.DigitsLowerCase.charAt(base));
    } else {
        return false;
    }
}

Parser.isDigit = function(ch) {
    return (ch >= '0' && ch <= '9');
}

Parser.isOctalDigit = function(ch) {
    return (ch >= '0' && ch <= '7');
}

Parser.isLetter = function(ch) {
    return ((ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z'));
}

Parser.isIdentifierStart = function(ch) {
    return Parser.isLetter(ch) || ch=='_';
}

Parser.isIdentifierPart = function(ch) {
    return Parser.isIdentifierStart(ch) || Parser.isDigit(ch);
}

Parser.Lexer = function(input) {
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
        throw new Parser.LexerError(message, this.input.substring(this.marker, this.index), this.marker, this.index);
    }

    this.skipSpaces = function() {
        let ch;
        while (!this.endOfString()) {
            ch = this.peekNextChar();
            if (!Parser.isWhitespace(ch)) {
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
        while (Parser.isBaseDigit(ch, base)) {
            this.skipChar();
            str = str + ch;
            ch = this.peekNextChar();
        }
        return this.createToken(Parser.Tokens.Number, parseInt(str, base));
    }

    this.parseRegister = function() {
        this.skipChar();
        let ch = this.peekNextChar();
        let id = '';
        while (Parser.isIdentifierPart(ch)) {
            id = id + ch;
            this.skipChar();
            ch = this.peekNextChar();
        }
        return this.createToken(Parser.Tokens.Register, '$'+id);
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
                if (Parser.isOctalDigit(ch)) {
                    return this.parseAnyNumber(8);
                } else {
                    return this.createToken(Parser.Tokens.Number, 0);
                }
            }
        } else {
            return this.parseAnyNumber(10);
        }
    }

    this.parseIdentifier = function() {
        let id = this.nextChar();
        let ch = this.peekNextChar();
        while (Parser.isIdentifierPart(ch)) {
            id = id + ch;
            this.skipChar();
            ch = this.peekNextChar();
        }
        return this.createToken(Parser.Tokens.Identifier, id);
    }

    this.parseAtom = function() {
        let ch = this.peekNextChar();
        if (ch == '<') {
            this.skipChar();
            ch = this.peekNextChar();
            if (ch == '<') {
                this.skipChar();
                return this.createToken(Parser.Tokens.LogicalShiftLeft);
            } else {
                this.error('Unknown token');
            }
        } else if (ch == '>') {
            this.skipChar();
            ch = this.peekNextChar();
            if (ch == '>') {
                this.skipChar();
                ch = this.peekNextChar();
                if (ch == '>') {
                    this.skipChar();
                    return this.createToken(Parser.Tokens.LogicalShiftRight);
                } else {
                    return this.createToken(Parser.Tokens.ArithmeticShiftRight);
                }
            } else {
                this.error('Unknown token');
            }
        } else if (ch in Parser.AtomTypes) {
            this.skipChar();
            return this.createToken(Parser.AtomTypes[ch]);
        }
        this.error('Unknown token');
    }

    this.next = function() {
        this.skipSpaces();

        this.startToken();
        if (this.endOfString()) {
            return this.createToken(Parser.Tokens.EndOfString);
        }

        let ch = this.peekNextChar();
        if (ch == '$') {
            return this.parseRegister();
        } else if (Parser.isDigit(ch)) {
            return this.parseNumber();
        } else if (Parser.isIdentifierStart(ch)) {
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
