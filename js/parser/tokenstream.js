/** A TokenStream represents a stream of tokens
 * @constructor
 * @param {Parser.Lexer}  lexer   The lexer to source the tokens from
 */
Parser.TokenStream = function(lexer) {
    this.lexer = lexer;
    this.lookaheadTokens = [];
    this.token = undefined;

    /** Take a look at the current token without consuming it
     * @param {number}   index   The number of tokens to look ahead (optional, missing or 0=next token)
     * @returns {Parser.Token}   The lookahead token
     */
    this.lookahead = function(index) {
        index = index || 0
        this.ensureLookaheadAvailable(index+1);
        return this.lookaheadTokens[index];
    }

    /** Check if the next token has a specific type
     * @param {string}  type   The token type to check for
     * @param {number}   index   The number of tokens to look ahead (optional, missing or 0=next token)
     * @returns {boolean} <code>true</code> if and only if the next token has the specified type.
     */
    this.checkNext = function(type, index) {
        let token = this.lookahead(index);
        return (token.type == type);
    }

    /** Get the next token, consuming the current token in the process, if any
     * @returns {Parser.Token}   The (new) current token
     */
    this.nextToken = function() {
        this.ensureLookaheadAvailable(1);
        this.lookaheadTokens.shift();
        return this.lookahead();
    }

    /** Ensure that the lookahead array is filled sufficienty
     * @param {number}  count   The minimum number of tokens that should be in the lookahead array
     */
    this.ensureLookaheadAvailable = function (count) {
        while (this.lookaheadTokens.length < count) {
            this.lookaheadTokens.push(this.lexer.next());
        }
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
        this.nextToken();
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
