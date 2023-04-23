/** Token object
 * @constructor
 * @param {string}  type   The type of token
 * @param           value  The value of the token
 * @param {number}  begin  The start index of the input region represented by the token
 * @param {number}  end    The index of the character one past the end of the input region represented by the token
 * @param {string}  text   The text of the token
 */
Parser.Token = function(type, value, begin, end, text) {
    this.type = type;
    this.value = value;
    this.begin = begin;
    this.end = end;
    this.text = text;
}
Parser.Token.prototype.toString = function() {
    return this.type + ' \''+this.text+'\'';
}

/** Dictionary of token types */
Parser.TokenType = {
    Identifier: 'Identifier',
    Register: 'Register',
    Number: 'Number',
    Multiplication: 'Multiplication',
    Division: 'Division',
    Remainder: 'Remainder',
    Addition: 'Addition',
    Subtraction: 'Subtraction',
    LogicalShiftLeft: 'LogicalShiftLeft',
    LogicalShiftRight: 'LogicalShiftRight',
    ArithmeticShiftRight: 'ArithmeticShiftRight',
    LessThan: 'LessThan',
    LessEqual: 'LessEqual',
    GreaterThan: 'GreaterThan',
    GreaterEqual: 'GreaterEqual',
    Assignment: 'Assignment',
    Equals: 'Equals',
    NotEquals: 'NotEquals',
    BitwiseAND: 'BitwiseAND',
    BitwiseXOR: 'BitwiseXOR',
    BitwiseOR: 'BitwiseOR',
    LogicalAND: 'LogicalAND',
    LogicalOR: 'LogicalOR',

    LogicalNOT: 'LogicalNOT',
    BitwiseNOT: 'BitwiseNOT',
    LParen: 'LParen',
    RParen: 'RParen',
    Comma: 'Comma',
    Colon: 'Colon',
    QuestionMark: 'QuestionMark',
    EndOfString: 'EndOfString',
};

/** Dictionary associating single-character atoms to their token types */
Parser.AtomTypes = {
    '+': Parser.TokenType.Addition,
    '-': Parser.TokenType.Subtraction,
    '*': Parser.TokenType.Multiplication,
    '/': Parser.TokenType.Division,
    '%': Parser.TokenType.Remainder,
    '^': Parser.TokenType.BitwiseXOR,
    '~': Parser.TokenType.BitwiseNOT,
    '(': Parser.TokenType.LParen,
    ')': Parser.TokenType.RParen,
    ',': Parser.TokenType.Comma,
    ':': Parser.TokenType.Colon,
    '?': Parser.TokenType.QuestionMark,
};

/** Determine whether the given character is whitespace
 * @param {string} ch   The character to check
 * @return {boolean} <code>true</code> if and only if the character is whitespace
 */
Parser.isWhitespace = function(ch) {
    return (ch=='\t' || ch==' ' || ch=='\n' || ch=='\r');
}

Parser.DigitsUpperCase = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
Parser.DigitsLowerCase = "0123456789abcdefghijklmnopqrstuvwxyz";

/** Determine whether the given character is a digit for the given base
 * 
 * Ignores case, i.e. 'a' and 'A' are considered the same character.
 * 
 * @param {string}  ch   The character to check
 * @param {number}  base The base to check against (e.g., 10 for decimal numbers, 16 for hexadecimal, etc.)
 * @return {boolean} <code>true</code> if and only if the character is a digit for the given base
 */
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

/** Determine whether the given character is a decimal digit
 * @param {string}  ch   The character to check
 * @return {boolean} <code>true</code> if and only if the character is a decimal digit
 */
Parser.isDigit = function(ch) {
    return (ch >= '0' && ch <= '9');
}

/** Determine whether the given character is an octal digit
 * @param {string}  ch   The character to check
 * @return {boolean} <code>true</code> if and only if the character is an octal digit
 */
Parser.isOctalDigit = function(ch) {
    return (ch >= '0' && ch <= '7');
}

/** Determine whether the given character is a letter
 * @param {string}  ch   The character to check
 * @return {boolean} <code>true</code> if and only if the character is a letter
 */
Parser.isLetter = function(ch) {
    return ((ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z'));
}

/** Determine whether the given character can be the start of an identifier
 * @param {string}  ch   The character to check
 * @return {boolean} <code>true</code> if and only if the character can be the start of an identifier
 */
Parser.isIdentifierStart = function(ch) {
    return Parser.isLetter(ch) || ch=='_';
}

/** Determine whether the given character can be part of an identifier
 * @param {string}  ch   The character to check
 * @return {boolean} <code>true</code> if and only if the character can be part of an identifier
 */
Parser.isIdentifierPart = function(ch) {
    return Parser.isIdentifierStart(ch) || Parser.isDigit(ch);
}

/** General lexer
 * Transforms an input string into a stream of tokens
 * @constructor
 * @param {string} input    The string to transform
 */
Parser.Lexer = function(input) {
    this.input = input;
    this.index = 0;
    this.marker = 0;
    this.length = input.length;

    /** Determine whether we have reached the end of the input string
     * @returns {boolean} <code>true</code> if and only if there are no more characters left
     */
    this.endOfString = function() {
        return this.index >= this.length;
    }

    /** Start the next token */
    this.startToken = function() {
        this.marker = this.index;
    }

    /** Determine the next character without advancing the input position
     * @returns {(string|undefined)} The next character of undefined if there are no more characters left.
     */
    this.peekNextChar = function() {
        return (!this.endOfString() ? this.input.charAt(this.index) : undefined);
    }

    /** Determine the next character, advancing the input position
     * @returns {(string|undefined)} The next character of undefined if there are no more characters left.
     */
    this.nextChar = function() {
        return (!this.endOfString() ? this.input.charAt(this.index++) : undefined);
    }

    /** Skip the next character, if any */
    this.skipChar = function() {
        if (!this.endOfString()) {
            this.index++;
        }
    }

    /** Throw a {@link Parser.LexerError}, specifying the current input token
     * @param {string} message A human-readable message explaining the kind of exception
     * @throws {Parser.LexerError}
     */
    this.error = function(message) {
        throw new Parser.LexerError(message, this.input.substring(this.marker, this.index), this.marker, this.index);
    }

    /** Skip a comment until the end of the line */
    this.skipComment = function() {
        this.skipChar();
        let ch = this.peekNextChar();
        while (!this.endOfString() && ch != '\n') {
            this.skipChar();
            ch = this.peekNextChar();
        }
    }

    /** Skip spaces until the first non-whitespace character */
    this.skipSpaces = function() {
        let ch;
        while (!this.endOfString()) {
            ch = this.peekNextChar();
            if (ch == '#') {
                this.skipComment();
            } else if (!Parser.isWhitespace(ch)) {
                break;
            }
            this.skipChar();
        }
    }

    /** Create a token from the currently parsed input
     * @param {string}   type   The type of the token to create
     * @param            value  The value of the token
     * @returns {Parser.Token}  The newly created token
     */
    this.createToken = function(type, value) {
        return new Parser.Token(type, value, this.marker, this.index, this.input.substring(this.marker, this.index));
    }

    /** Parse a number of the given base
     * @param {number}   base    The base of the number to parse
     * @returns {Parser.Token}  The token representing the parsed number
     */
    this.parseAnyNumber = function(base) {
        let str = '';
        let ch = this.peekNextChar()
        while (Parser.isBaseDigit(ch, base)) {
            this.skipChar();
            str = str + ch;
            ch = this.peekNextChar();
        }
        return this.createToken(Parser.TokenType.Number, parseInt(str, base));
    }

    /** Parse a register name
     * A register name is composed of a dollar sign followed by an identifier or number
     * @returns {Parser.Token} The token representing the register
     */
    this.parseRegister = function() {
        let id = this.peekNextChar();
        this.skipChar();
        let ch = this.peekNextChar();
        while (Parser.isIdentifierPart(ch)) {
            id = id + ch;
            this.skipChar();
            ch = this.peekNextChar();
        }
        return this.createToken(Parser.TokenType.Register, id);
    }

    /** Parse a number
     * A number can be binary, octal, decimal or hexadecimal.
     * 
     * @returns {Parser.Token}  The token representing the parsed number
     */
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
                    return this.createToken(Parser.TokenType.Number, 0);
                }
            }
        } else {
            return this.parseAnyNumber(10);
        }
    }

    /** Parse an identifier
     * @returns {Parser.Token}  A token representing the identifier
     */
    this.parseIdentifier = function() {
        let id = this.nextChar();
        let ch = this.peekNextChar();
        while (Parser.isIdentifierPart(ch)) {
            id = id + ch;
            this.skipChar();
            ch = this.peekNextChar();
        }
        return this.createToken(Parser.TokenType.Identifier, id);
    }

    /** Parse an atom
     * Atoms are operators such as `>>>` or `+`
     * 
     * @returns {Parser.Token}  A token representing the atom
     */
    this.parseAtom = function() {
        let ch = this.peekNextChar();
        if (ch == '<') {
            this.skipChar();
            ch = this.peekNextChar();
            if (ch == '<') {
                this.skipChar();
                return this.createToken(Parser.TokenType.LogicalShiftLeft);
            } else if (ch == '=') {
                this.skipChar();
                return this.createToken(Parser.TokenType.LessEqual);
            } else {
                return this.createToken(Parser.TokenType.LessThan);
            }
        } else if (ch == '>') {
            this.skipChar();
            ch = this.peekNextChar();
            if (ch == '>') {
                this.skipChar();
                ch = this.peekNextChar();
                if (ch == '>') {
                    this.skipChar();
                    return this.createToken(Parser.TokenType.LogicalShiftRight);
                } else {
                    return this.createToken(Parser.TokenType.ArithmeticShiftRight);
                }
            } else if (ch == '=') {
                this.skipChar();
                return this.createToken(Parser.TokenType.GreaterEqual);
            } else {
                return this.createToken(Parser.TokenType.GreaterThan);
            }
        } else if (ch == '|') {
            this.skipChar();
            ch = this.peekNextChar();
            if (ch == '|') {
                this.skipChar();
                return this.createToken(Parser.TokenType.LogicalOR);
            } else {
                return this.createToken(Parser.TokenType.BitwiseOR);
            }
        } else if (ch == '&') {
            this.skipChar();
            ch = this.peekNextChar();
            if (ch == '&') {
                this.skipChar();
                return this.createToken(Parser.TokenType.LogicalAND);
            } else {
                return this.createToken(Parser.TokenType.BitwiseAND);
            }
        } else if (ch == '=') {
            this.skipChar();
            ch = this.peekNextChar();
            if (ch == '=') {
                this.skipChar();
                return this.createToken(Parser.TokenType.Equals);
            } else {
                return this.createToken(Parser.TokenType.Assignment);
            }
        } else if (ch == '!') {
            this.skipChar();
            ch = this.peekNextChar();
            if (ch == '=') {
                this.skipChar();
                return this.createToken(Parser.TokenType.NotEquals);
            } else {
                return this.createToken(Parser.TokenType.LogicalNOT);
            }
        } else if (ch in Parser.AtomTypes) {
            this.skipChar();
            return this.createToken(Parser.AtomTypes[ch]);
        }
        this.error('Unknown token');
    }

    /** Get the next token and advance the input position
     * @returns {Parser.Token} the next token from the input stream,
     *          or an end-of-string token if the end of the string has been reached
     */
    this.next = function() {
        this.skipSpaces();

        this.startToken();
        if (this.endOfString()) {
            return this.createToken(Parser.TokenType.EndOfString);
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
}
