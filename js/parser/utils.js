let Parser;
Parser = Parser || {};

/** Base class for all parser exceptions
 * @constructor
 * @param {string} message A human-readable message explaining the kind of exception
 */
Parser.Error = function(message) {
    this.message = message;
}
Parser.Error.prototype.toString = function() {
    return this.message;
}

/** Exception for lexer errors
 * Thrown when the lexer cannot associate part of the input with a lexeme.
 * @constructor
 * @param {string} message A human-readable message explaining the kind of exception
 * @param {string} text    The text of the relevant token or character as processed so far
 * @param {number} start   The start index of the text within the input string
 * @param {number} end     The index of the next character within the input string plus one
 */
Parser.LexerError = function(message, text, start, end) {
    Parser.Error.call(this, message);
    this.text = text;
    this.start = start;
    this.end = end;
}
Parser.LexerError.prototype = Object.create( Parser.Error.prototype );
Parser.LexerError.prototype.toString = function() {
    return this.message+" ('"+text+"')";
}

/** Exception for parsing errors
 * Thrown when the parser cannot associate a token with a grammar rule.
 * @constructor
 * @param {string} message       A human-readable message explaining the kind of exception
 * @param {Parser.Token} token   The relevant token that led to the exception
 */
Parser.ParseError = function(message, token) {
    Parser.Error.call(this, message);
    this.token = token;

}
Parser.ParseError.prototype = Object.create( Parser.Error.prototype );
Parser.ParseError.prototype.toString = function() {
    return this.message+" ('"+this.token.value+"')";
}

/** Exception for unexpected tokens
 * Thrown when the parser encounters a token that is not expected.
 * @constructor
 * @param {Parser.Token} token   The relevant token that led to the exception
 * @param {string} expectedType  The type of token expected
 */
Parser.UnexpectedTokenError = function(token, expectedType) {
    Parser.ParseError.call(
        this,
        'Unexpected token',
        token);
    this.expectedType = expectedType;
}
Parser.UnexpectedTokenError.prototype = Object.create( Parser.ParseError.prototype );
Parser.UnexpectedTokenError.prototype.toString = function() {
    if (this.token.value === undefined) {
        return 'Expected '+this.expectedType+', but got '+this.token.type;
    } else {
        return 'Expected '+this.expectedType+', but got \''+this.token.value+'\' (a '+this.token.type+')';
    }
}

/** Exception for unknown instructions
 * Thrown when the parser encounters an unknown instruction.
 * @constructor
 * @param {Parser.Token} token   The relevant token that led to the exception
 */
Parser.UnknownInstructionError = function(token) {
    Parser.ParseError.call(
        this,
        'Unknown instruction',
        token);
}
Parser.UnknownInstructionError.prototype = Object.create( Parser.ParseError.prototype );

/** Exception for undefined symbols
 * Thrown when the parser encounters an undefined symbol.
 * @constructor
 * @param {Parser.Token} token   The relevant token that led to the exception
 */
Parser.UnknownSymbolError = function(token) {
    Parser.ParseError.call(
        this,
        'Unknown symbol',
        token);
}
Parser.UnknownSymbolError.prototype = Object.create( Parser.ParseError.prototype );

function assert(condition, message) {
    if (!condition) {
        throw new Error(message) || new Error("Assertion failed");
    }
}
