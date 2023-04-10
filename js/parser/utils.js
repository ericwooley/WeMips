let Parser;
Parser = Parser || {};

Parser.LexerError = function(message, text, start, end) {
    this.name = 'LexerError';
    this.message = message;
    this.text = text;
    this.start = start;
    this.end = end;
}

Parser.ParseError = function(message, token) {
    this.name = 'ParseError';
    this.message = message;
    this.token = token;
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message) || new Error("Assertion failed");
    }
}
