/** A TokenStream represents a stream of tokens
 * @constructor
 * @param {Parser.Lexer}  lexer   The lexer to source the tokens from
 */
Parser.TokenStream = function(lexer) {
    var lookaheadTokens = [];

    /** Ensure that the lookahead array is filled sufficienty
     * @member Parser.TokenStream
     * @private
     * @param {number}  count   The minimum number of tokens that should be in the lookahead array
     */
    function ensureLookaheadAvailable(count) {
        while (lookaheadTokens.length < count) {
            lookaheadTokens.push(lexer.next());
        }
    }

    /** Consume the given number of tokens
     * @member Parser.TokenStream
     * @private
     * @param {number} count   The number of tokens to consume (optional, default: 1)
     */
    function consumeTokens(count) {
        count = count || 1;
        ensureLookaheadAvailable(count);
        lookaheadTokens.splice(0, count);
    }

    /** Take a look at the current token without consuming it
     * @param {number}   offset  The offset from the next token to the token to lookahead (optional, default: 0=next token)
     * @returns {Parser.Token}   The lookahead token
     */
    this.lookahead = function(offset) {
        offset = offset || 0
        ensureLookaheadAvailable(offset+1);
        return lookaheadTokens[offset];
    }

    /** Check if the next token has a specific type
     * @param {string}   type     The token type to check for
     * @param {number}   offset   The offset from the next token to the token to lookahead (optional, default: 0=next token)
     * @returns {boolean} <code>true</code> if and only if the next token has the specified type.
     */
    this.checkNext = function(type, offset) {
        let token = this.lookahead(offset);
        return (token.type == type);
    }

    /** Check the current token for the given token type, raising an error on mismatch, otherwise fetching the next token
     * @param {string}  type   The type to check for in the current token
     * @returns {Parser.Token}   The (new) current token
     * @throws {Parser.ParseError}  The current token must match the given token type
     */
    this.consume = function(type) {
        let token = this.lookahead();
        if (type && token.type != type) {
            throw new Parser.UnexpectedTokenError(token, type);
        }
        consumeTokens();
        return token;
    }

    /** Throw an {@link Parser.ParseError} if there is text remaining.
     * This is to be used to ensure complete parsing of an input.
     * @throws {Parser.ParseError} The end of the input must have been reached
     */
    this.enforceCompletion = function() {
        if (!this.checkNext(Parser.TokenType.EndOfString)) {
            throw new Parser.ParseError('Trailing text remaining');
        }
    }
}

/** Create a token stream from an input string
 * @param {string} input   The string to scan
 * @returns {Parser.TokenStream}  The token stream providing the tokens from the input string
 */
Parser.tokenStreamFromString = function(input) {
    let lexer = new Parser.Lexer(input);
    return new Parser.TokenStream(lexer);
}
