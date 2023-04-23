/** A TokenStream represents a stream of tokens
 * @constructor
 * @param {Parser.Lexer}  lexer   The lexer to source the tokens from
 */
Parser.TokenStream = function(lexer) {
    /** Token index of first entry in tokens array
     * @member Parser.TokenStream
     * @private
     * @type {Number}
     */
    var firstTokenIndex = 0;
    /** Array of fetched and still required tokens
     * @member Parser.TokenStream
     * @private
     * @type {Number}
     */
    var retainedTokens = [];
    /** Token index of current token
     * @member Parser.TokenStream
     * @private
     * @type {Number}
     */
    var currentTokenIndex = 0;
    /** Stack of rewind positions
     * @member Parser.TokenStream
     * @private
     * @type {Array}
     */
    var rewindStack = [];

    /** Ensure that the lookahead array is filled sufficienty
     * @member Parser.TokenStream
     * @private
     * @param {number}  tokenIndex   The index of the token that must be available
     */
    function ensureLookaheadAvailable(tokenIndex) {
        while (firstTokenIndex + retainedTokens.length <= tokenIndex) {
            retainedTokens.push(lexer.next());
        }
    }

    /** Consume the given number of tokens
     * @member Parser.TokenStream
     * @private
     * @param {number} count   The number of tokens to consume (optional, default: 1)
     */
    function consumeTokens(count) {
        count = count || 1;
        ensureLookaheadAvailable(currentTokenIndex + count);
        currentTokenIndex += count;
    }

    /** Add a checkpoint for rewinding */
    this.pushCheckpoint = function() {
        rewindStack.push(currentTokenIndex);
    }

    function trimRetainedTokens() {
        /* Determine the first token index that we still have to retain */
        minRequiredTokenIndex = currentTokenIndex;
        for (let checkpoint of rewindStack) {
            if (checkpoint < minRequiredTokenIndex) {
                minRequiredTokenIndex = checkpoint;
            }
        }

        if (minRequiredTokenIndex > firstTokenIndex) {
            /* We can trim the retained tokens array */
            retainedTokens.splice(0, minRequiredTokenIndex - firstTokenIndex);
            firstTokenIndex = minRequiredTokenIndex;
        }
    }

    /** Remove the last rewind checkpoint */
    this.commit = function() {
        rewindStack.pop();
        trimRetainedTokens();
    }

    /** Rewind to the last rewind checkpoint */
    this.rewind = function() {
        currentTokenIndex = rewindStack.pop();
    }

    /** Perform a parsing action speculatively
     * @param {Function}  fn   The function object to call
     * @param             defValue   The default value to return if parsing fails
     * @return The return value of the function or the given default value
    */
    this.tryParsing = function(fn, defValue) {
        try {
            this.pushCheckpoint();
            let ret = fn();
            this.commit();
            return ret;
        } catch (e) {
            if (e instanceof Parser.ParseError) {
                this.rewind();
                return defValue;
            } else {
                throw e;
            }
        }
    }

    /** Take a look at the current token without consuming it
     * @param {number}   offset  The offset from the next token to the token to lookahead (optional, default: 0=next token)
     * @returns {Parser.Token}   The lookahead token
     */
    this.lookahead = function(offset) {
        offset = offset || 0
        let tokenIndex = currentTokenIndex + offset;
        ensureLookaheadAvailable(tokenIndex);
        return retainedTokens[tokenIndex - firstTokenIndex];
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
