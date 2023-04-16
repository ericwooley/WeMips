let Parser;
Parser = Parser || {};

/** Base class for all parser exceptions
 * @constructor
 * @param {string} name The kind of exception
 * @param {string} message A human-readable message explaining the kind of exception
 */
Parser.Error = function(name, message) {
    this.name = name;
    this.message = message;
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
    Parser.Error.call(this, 'LexerError', message);
    this.text = text;
    this.start = start;
    this.end = end;
}
Parser.LexerError.prototype = Object.create( Parser.Error.prototype );

/** Exception for parsing errors
 * Thrown when the parser cannot associate a token with a grammar rule.
 * @constructor
 * @param {string} message       A human-readable message explaining the kind of exception
 * @param {Parser.Token} token   The relevant token that led to the exception
 */
Parser.ParseError = function(message, token) {
    Parser.Error.call(this, 'ParseError', message);
    this.token = token;
}
Parser.ParseError.prototype = Object.create( Parser.Error.prototype );

function assert(condition, message) {
    if (!condition) {
        throw new Error(message) || new Error("Assertion failed");
    }
}
