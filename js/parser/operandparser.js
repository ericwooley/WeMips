Parser.operandParserFromString = function(text) {
    let tokenStream = Parser.tokenStreamFromString(text);
    return new Parser.OperandParser(tokenStream);
}

Parser.OperandParser = function(tokenStream) {
    this.tokenStream = tokenStream;
    this.exprParser = new Parser.ExprParser(tokenStream);
    this.mipsEmulator = new MipsEmulator();

    this.parseRegister = function() {
        let token = this.tokenStream.consume(Parser.Tokens.Register);
        if (this.mipsEmulator.isValidRegister(token.value)) {
            return token.value;
        } else {
            throw new Parser.ParseError('Not a valid register', token);
        }
    }

    this.parseWritableRegister = function() {
        let token = this.tokenStream.consume(Parser.Tokens.Register);
        if (this.mipsEmulator.isValidWritableRegister(token.value)) {
            return token.value;
        } else {
            throw new Parser.ParseError('Not a writable register', token);
        }
    }

    this.parseLabel = function() {
        let token = this.tokenStream.consume(Parser.Tokens.Identifier);
        return token.value;
    }

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

    this.parseLoadStoreAddress = function() {
        let imm;
        try {
            imm = this.exprParser.parseExpression();
        } catch (e) {
            if (e instanceof Parser.ParseError) {
                imm = 0;
            } else {
                throw e;
            }
        }
        this.tokenStream.consume(Parser.Tokens.LParen);
        let reg = this.parseRegister();
        this.tokenStream.consume(Parser.Tokens.RParen);
        return {
            'imm': imm.toString(),
            '$rs': reg
        };
    }
}