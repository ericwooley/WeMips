/** Token object
 * @constructor
 * @param {string}  type   The type of token
 * @param           value  The value of the token
 * @param {number}  begin  The start index of the input region represented by the token
 * @param {number}  end    The index of the character one past the end of the input region represented by the token
 * @param {string}  text   The text of the token
 */
Parser.Token = function(type, value, begin, end, lineno, text) {
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
    EndOfLine: 'EndOfLine',
    EndOfString: 'EndOfString',
};

/** General lexer
 * Transforms an input string into a stream of tokens
 * @constructor
 * @param {string} input         The string to transform
 * @param {Number} firstLineNo   Start value for the line number counter
 */
Parser.Lexer = function(input, firstLineNo=1) {
    let that = this;
    /**
     * Index of the next character to be processed
     * @member Parser.Lexer
     * @private
     * @type {Number}
     */
    let index = 0;
    /**
     * Start indices for each line
     * 
     * The index for line n is n-firstLineNo
     */
    let lineStartOffsets = [0];
    /**
     * Start index of the current token
     * @member Parser.Lexer
     * @private
     * @type {Number}
     */
    let marker = 0;

    /** Determine whether we have reached the end of the input string
     * @member Parser.Lexer
     * @returns {boolean} <code>true</code> if and only if there are no more characters left
     */
    this.endOfString = function() {
        return index >= input.length;
    }

    /** Start the next token
     * @member Parser.Lexer
     * @private
     */
    function startToken() {
        marker = index;
    }

    /** Determine the next character without advancing the input position
     * @member Parser.Lexer
     * @private
     * @returns {(string|undefined)} The next character of undefined if there are no more characters left.
     */
    function peekNextChar() {
        return (!that.endOfString() ? input.charAt(index) : undefined);
    }

    /** Skip the next character, if any 
     * @member Parser.Lexer
     * @private
     */
    function skipChar() {
        if (!that.endOfString()) {
            index++;
        }
    }

    /** Throw a {@link Parser.LexerError}, specifying the current input token
     * @member Parser.Lexer
     * @private
     * @param {string} message A human-readable message explaining the kind of exception
     * @throws {Parser.LexerError}
     */
    function error(message) {
        throw new Parser.LexerError(message, input.substring(marker, index), marker, index);
    }

    /** Skip a comment until the end of the line
     * @member Parser.Lexer
     * @private
     */
    function skipComment() {
        skipChar();
        let ch = peekNextChar();
        while (!that.endOfString() && ch != '\n') {
            skipChar();
            ch = peekNextChar();
        }
    }

    /** Determine whether the given character is whitespace
     * @member Parser.Lexer
     * @private
     * @param {string} ch   The character to check
     * @return {boolean} <code>true</code> if and only if the character is whitespace
     */
    function isWhitespace(ch) {
        return (ch=='\t' || ch==' ' || ch=='\r');
    }

    let digitsUpperCase = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let digitsLowerCase = "0123456789abcdefghijklmnopqrstuvwxyz";
    
    /** Determine whether the given character is a digit for the given base
     * 
     * Ignores case, i.e. 'a' and 'A' are considered the same character.
     * @member Parser.Lexer
     * @private
     * @param {string}  ch   The character to check
     * @param {number}  base The base to check against (e.g., 10 for decimal numbers, 16 for hexadecimal, etc.)
     * @return {boolean} <code>true</code> if and only if the character is a digit for the given base
     */
    function isBaseDigit(ch, base) {
        assert(base <= 36);
        if (ch >= '0' && ch <= '9') {
            return (base >= 10 || digitsUpperCase.charAt(base));
        } else if (ch >= 'A' && ch <= 'Z') {
            return (ch <= digitsUpperCase.charAt(base));
        } else if (ch >= 'a' && ch <= 'z') {
            return (ch <= digitsLowerCase.charAt(base));
        } else {
            return false;
        }
    }
    
    /** Determine whether the given character is a decimal digit
     * @member Parser.Lexer
     * @private
     * @param {string}  ch   The character to check
     * @return {boolean} <code>true</code> if and only if the character is a decimal digit
     */
    function isDigit(ch) {
        return (ch >= '0' && ch <= '9');
    }
    
    /** Determine whether the given character is an octal digit
     * @member Parser.Lexer
     * @private
     * @param {string}  ch   The character to check
     * @return {boolean} <code>true</code> if and only if the character is an octal digit
     */
    function isOctalDigit(ch) {
        return (ch >= '0' && ch <= '7');
    }
    
    /** Determine whether the given character is a letter
     * @member Parser.Lexer
     * @private
     * @param {string}  ch   The character to check
     * @return {boolean} <code>true</code> if and only if the character is a letter
     */
    function isLetter(ch) {
        return ((ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z'));
    }
    
    /** Determine whether the given character can be the start of an identifier
     * @member Parser.Lexer
     * @private
     * @param {string}  ch   The character to check
     * @return {boolean} <code>true</code> if and only if the character can be the start of an identifier
     */
    function isIdentifierStart(ch) {
        return isLetter(ch) || ch=='_';
    }
    
    /** Determine whether the given character can be part of an identifier
     * @member Parser.Lexer
     * @private
     * @param {string}  ch   The character to check
     * @return {boolean} <code>true</code> if and only if the character can be part of an identifier
     */
    function isIdentifierPart(ch) {
        return isIdentifierStart(ch) || isDigit(ch);
    }
    
    /** Skip spaces until the first non-whitespace character
     * @member Parser.Lexer
     * @private
     */
    function skipSpaces() {
        let ch;
        while (!that.endOfString()) {
            ch = peekNextChar();
            if (ch == '#') {
                skipComment();
            } else if (!isWhitespace(ch)) {
                break;
            } else {
                skipChar();
            }
        }
    }

    /** Create a token from the currently parsed input
     * @member Parser.Lexer
     * @private
     * @param {string}   type   The type of the token to create
     * @param            value  The value of the token
     * @returns {Parser.Token}  The newly created token
     */
    function createToken(type, value) {
        return new Parser.Token(type, value, marker, index, input.substring(marker, index));
    }

    /**
     * Find the line and column number for the given index.
     * 
     * Note that columns are counted starting with 0.
     * 
     * @member Parser.Lexer
     * @param {Number} index   The index of the character
     * @returns {Array} An array containing a 'lineno' and 'column' field
     *                  with the obvious meanings.
     */
    this.getLineInfoForIndex = function(index) {
        if (index > lineStartOffsets[lineStartOffsets.length-1]) {
            lineIdx = lineStartOffsets.length-1;
        } else {
            lineIdx = lineStartOffsets.findLastIndex(
                (element) => (element <= index)
            );
        }
        return {
            lineno: lineIdx+firstLineNo,
            column: index-lineStartOffsets[lineIdx]
        };
    }

    /** Parse a number of the given base
     * @member Parser.Lexer
     * @private
     * @param {number}   base    The base of the number to parse
     * @returns {Parser.Token}  The token representing the parsed number
     */
    function parseAnyNumber(base) {
        let str = '';
        let ch = peekNextChar()
        while (isBaseDigit(ch, base)) {
            skipChar();
            str = str + ch;
            ch = peekNextChar();
        }
        return createToken(Parser.TokenType.Number, parseInt(str, base));
    }

    /** Parse a register name
     * A register name is composed of a dollar sign followed by an identifier or number
     * @member Parser.Lexer
     * @private
     * @returns {Parser.Token} The token representing the register
     */
    function parseRegister() {
        let id = peekNextChar();
        skipChar();
        let ch = peekNextChar();
        while (isIdentifierPart(ch)) {
            id = id + ch;
            skipChar();
            ch = peekNextChar();
        }
        return createToken(Parser.TokenType.Register, id);
    }

    /** Parse a number
     * A number can be binary, octal, decimal or hexadecimal.
     * 
     * @member Parser.Lexer
     * @private
     * @returns {Parser.Token}  The token representing the parsed number
     */
    function parseNumber() {
        let ch = peekNextChar();
        if (ch == '0') {
            skipChar();
            ch = peekNextChar();
            switch (ch) {
            case 'b': case 'B':
                skipChar();
                return parseAnyNumber(2);
            case 'x': case 'X':
                skipChar();
                return parseAnyNumber(16);
            default:
                if (isOctalDigit(ch)) {
                    return parseAnyNumber(8);
                } else {
                    return createToken(Parser.TokenType.Number, 0);
                }
            }
        } else {
            return parseAnyNumber(10);
        }
    }

    /** Parse an identifier
     * @member Parser.Lexer
     * @private
     * @returns {Parser.Token}  A token representing the identifier
     */
    function parseIdentifier() {
        let id = peekNextChar();
        skipChar();
        let ch = peekNextChar();
        while (isIdentifierPart(ch)) {
            id = id + ch;
            skipChar();
            ch = peekNextChar();
        }
        return createToken(Parser.TokenType.Identifier, id);
    }

    let atomTypes = {
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

    /** Parse an atom
     * Atoms are operators such as `>>>` or `+`
     * @member Parser.Lexer
     * @private
     * @returns {Parser.Token}  A token representing the atom
     */
    function parseAtom() {
        let ch = peekNextChar();
        if (ch == '<') {
            skipChar();
            ch = peekNextChar();
            if (ch == '<') {
                skipChar();
                return createToken(Parser.TokenType.LogicalShiftLeft);
            } else if (ch == '=') {
                skipChar();
                return createToken(Parser.TokenType.LessEqual);
            } else {
                return createToken(Parser.TokenType.LessThan);
            }
        } else if (ch == '>') {
            skipChar();
            ch = peekNextChar();
            if (ch == '>') {
                skipChar();
                ch = peekNextChar();
                if (ch == '>') {
                    skipChar();
                    return createToken(Parser.TokenType.LogicalShiftRight);
                } else {
                    return createToken(Parser.TokenType.ArithmeticShiftRight);
                }
            } else if (ch == '=') {
                skipChar();
                return createToken(Parser.TokenType.GreaterEqual);
            } else {
                return createToken(Parser.TokenType.GreaterThan);
            }
        } else if (ch == '|') {
            skipChar();
            ch = peekNextChar();
            if (ch == '|') {
                skipChar();
                return createToken(Parser.TokenType.LogicalOR);
            } else {
                return createToken(Parser.TokenType.BitwiseOR);
            }
        } else if (ch == '&') {
            skipChar();
            ch = peekNextChar();
            if (ch == '&') {
                skipChar();
                return createToken(Parser.TokenType.LogicalAND);
            } else {
                return createToken(Parser.TokenType.BitwiseAND);
            }
        } else if (ch == '=') {
            skipChar();
            ch = peekNextChar();
            if (ch == '=') {
                skipChar();
                return createToken(Parser.TokenType.Equals);
            } else {
                return createToken(Parser.TokenType.Assignment);
            }
        } else if (ch == '!') {
            skipChar();
            ch = peekNextChar();
            if (ch == '=') {
                skipChar();
                return createToken(Parser.TokenType.NotEquals);
            } else {
                return createToken(Parser.TokenType.LogicalNOT);
            }
        } else if (ch in atomTypes) {
            skipChar();
            return createToken(atomTypes[ch]);
        }
        error('Unknown token');
    }

    /** Get the next token and advance the input position
     * @returns {Parser.Token} the next token from the input stream,
     *          or an end-of-string token if the end of the string has been reached
     */
    this.next = function() {
        skipSpaces();

        startToken();
        if (this.endOfString()) {
            return createToken(Parser.TokenType.EndOfString);
        }

        let ch = peekNextChar();
        if (ch=='\n') {
            skipChar();
            /* New line starts here */
            lineStartOffsets.push(index);
            return createToken(Parser.TokenType.EndOfLine);
        } else if (ch == '$') {
            return parseRegister();
        } else if (isDigit(ch)) {
            return parseNumber();
        } else if (isIdentifierStart(ch)) {
            return parseIdentifier();
        } else {
            return parseAtom();
        }
    }
}
