/** A parser for MIPS operands
 * @constructor
 * @param {Parser.TokenStream}  tokenStream The stream of tokens to parse
 * @param {array} symbols An array of pre-defined symbols
 */
Parser.OperandParser = function(tokenStream, symbols) {
    this.tokenStream = tokenStream;
    this.exprParser = new Parser.ExprParser(tokenStream, symbols);
    this.mipsEmulator = new MipsEmulator();

    /** Parse a register operand
     * @returns {string}  The name of the register
     * @throws {Parser.ParseError} The input must start with a register
     */
    this.parseRegister = function() {
        let token = this.tokenStream.consume(Parser.TokenType.Register);
        if (this.mipsEmulator.isValidRegister(token.value)) {
            return token.value;
        } else {
            throw new Parser.ParseError('Not a valid register', token);
        }
    }

    /** Parse a writable register operand
     * 
     * Like {@link Parser.OperandParser.parseRegister}, but the register must be writable.
     * 
     * @returns {string}  The name of the register
     * @throws {Parser.ParseError} The input must start with a writable register
     */
    this.parseWritableRegister = function() {
        let token = this.tokenStream.consume(Parser.TokenType.Register);
        if (this.mipsEmulator.isValidWritableRegister(token.value)) {
            return token.value;
        } else {
            throw new Parser.ParseError('Not a writable register', token);
        }
    }

    /** Parse a label
     * 
     * A label is a simple identifier.
     * 
     * @returns {string}  The name of the label
     * @throws {Parser.ParseError} The input must start with a label
     */
    this.parseLabel = function() {
        let token = this.tokenStream.consume(Parser.TokenType.Identifier);
        return token.value;
    }

    /** Parse a signed constant expression
     * Parses a constant expression and checks whether its value is representable as a
     * two's-complement integer with the given number of bits.
     * 
     * @param {number} bits  The number of bits available (including sign bit) for the number
     * @returns {number}  The value of the constant
     * @throws {Parser.ParseError} The value must be representable as a two's-complement integer with the given number of bits
     */
    this.parseSignedConstant = function(bits) {
        let value = this.exprParser.parseExpression();
        let minValue = MIPS.minSignedValue(bits);
        let maxValue = MIPS.maxSignedValue(bits);
        if (minValue <= value && value <= maxValue) {
            return value;
        } else {
            throw new Parser.ParseError(value+' cannot be expressed as '+bits+'-bit signed value');
        }
    }

    /** Parse an unsigned constant expression
     * Parses a constant expression and checks whether its value is representable as an
     * unsigned integer with the given number of bits.
     * 
     * @param {number} bits  The number of bits available for the number
     * @returns {number}  The value of the constant
     * @throws {Parser.ParseError} The value must be representable as an unsigned integer with the given number of bits
     */
    this.parseUnsignedConstant = function(bits) {
        let value = this.exprParser.parseExpression();
        let minValue = MIPS.minUnsignedValue(bits);
        let maxValue = MIPS.maxUnsignedValue(bits);
        if (minValue <= value && value <= maxValue) {
            return value;
        } else {
            throw new Parser.ParseError(value+' cannot be expressed as '+bits+'-bit unsigned value');
        }
    }

    /** Parse a constant expression
     * Parses a constant expression and checks whether its value is representable as either an
     * unsigned or a two's complement integer with the given number of bits.
     * 
     * @param {number} bits  The number of bits available for the number
     * @returns {number}  The value of the constant
     * @throws {Parser.ParseError} The value must be representable as an unsigned or two's complement integer with the given number of bits
     */
    this.parseConstant = function(bits) {
        let value = this.exprParser.parseExpression();
        let minValue = MIPS.minSignedValue(bits);
        let maxValue = MIPS.maxUnsignedValue(bits);
        if (minValue <= value && value <= maxValue) {
            return value;
        } else {
            throw new Parser.ParseError(value+' cannot be expressed as '+bits+'-bit value');
        }
    }

    /** Parse an address for loading or storing.
     * A load/store-address consists of an (optional) signed offset and a register in parentheses (`imm($rs)`).
     * 
     * @param {number} bits  The number of bits allowed for the offset
     * @return {Object} A dictionary containing the offset in key `imm` and the register name in key  `$rs`.
     */
    this.parseLoadStoreAddress = function(bits) {
        let that = this;
        let imm = this.tokenStream.tryParsing(
            function() { return that.parseSignedConstant(bits); },
            0
        );
        let reg = this.tokenStream.tryParsing(
            function() {
                that.tokenStream.consume(Parser.TokenType.LParen);
                let reg = that.parseRegister();
                that.tokenStream.consume(Parser.TokenType.RParen);
                return reg;
            },
            '$zero'
        );
        return {
            'imm': imm,
            '$rs': reg
        };
}
}

/** Create an {@link Parser.OperandParser} from a string
 * @param {string}  input The string to parse
 * @returns {Parser.OperandParser} The operand parser for parsing the string
 */
Parser.operandParserFromString = function(text) {
    let tokenStream = Parser.tokenStreamFromString(text);
    return new Parser.OperandParser(tokenStream);
}
