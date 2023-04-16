let Parser;
Parser = Parser || {};

Parser.Error = function(name, message) {
    this.name = name;
    this.message = message;
}

Parser.LexerError = function(message, text, start, end) {
    Parser.Error.call(this, 'LexerError', message);
    this.text = text;
    this.start = start;
    this.end = end;
}
Parser.LexerError.prototype = Object.create( Parser.Error.prototype );

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
