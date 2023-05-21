Parser.BitsPerImmediate = 16;
Parser.BitsPerShamt = 5;

Parser.parseRdRsRt = function (operandParser) {
    let rd = operandParser.parseWritableRegister();
    operandParser.tokenStream.consume(Parser.TokenType.Comma);
    let rs = operandParser.parseRegister();
    operandParser.tokenStream.consume(Parser.TokenType.Comma);
    let rt = operandParser.parseRegister();

    return {
        '$rd': rd,
        '$rs': rs,
        '$rt': rt
    };
};

Parser.parseRdRs = function (operandParser) {
    let rd = operandParser.parseWritableRegister();
    operandParser.tokenStream.consume(Parser.TokenType.Comma);
    let rs = operandParser.parseRegister();

    return {
        '$rd': rd,
        '$rs': rs
    };
};

Parser.parseRtRsImmSigned = function (operandParser) {
    let rt = operandParser.parseWritableRegister();
    operandParser.tokenStream.consume(Parser.TokenType.Comma);
    let rs = operandParser.parseRegister();
    operandParser.tokenStream.consume(Parser.TokenType.Comma);
    let imm = operandParser.parseSignedConstant(Parser.BitsPerImmediate);

    return {
        '$rt': rt,
        '$rs': rs,
        'imm': imm
    };
};

Parser.parseRtRsImmUnsigned = function (operandParser) {
    let rt = operandParser.parseWritableRegister();
    operandParser.tokenStream.consume(Parser.TokenType.Comma);
    let rs = operandParser.parseRegister();
    operandParser.tokenStream.consume(Parser.TokenType.Comma);
    let imm = operandParser.parseUnsignedConstant(Parser.BitsPerImmediate);

    return {
        '$rt': rt,
        '$rs': rs,
        'imm': imm
    };
};

Parser.parseRdRtShamt = function(operandParser) {
    let rd = operandParser.parseWritableRegister();
    operandParser.tokenStream.consume(Parser.TokenType.Comma);
    let rt = operandParser.parseRegister();
    operandParser.tokenStream.consume(Parser.TokenType.Comma);
    let shamt = operandParser.parseUnsignedConstant(Parser.BitsPerShamt);

    return {
        '$rd': rd,
        '$rt': rt,
        'shamt': shamt
    };
};

Parser.parseLabel = function(operandParser) {
    let label = operandParser.parseLabel();

    return {
        'label': label
    };
};

Parser.parseRs = function(operandParser) {
    let rs = operandParser.parseRegister();

    return {
        '$rs': rs
    };
};

Parser.parseRd = function(operandParser) {
    let rd = operandParser.parseRegister();

    return {
        '$rd': rd
    };
};

Parser.parseRsRt = function (operandParser) {
    let rs = operandParser.parseRegister();
    operandParser.tokenStream.consume(Parser.TokenType.Comma);
    let rt = operandParser.parseRegister();

    return {
        '$rs': rs,
        '$rt': rt
    };
};

Parser.parseRsRtLabel = function (operandParser) {
    let rs = operandParser.parseRegister();
    operandParser.tokenStream.consume(Parser.TokenType.Comma);
    let rt = operandParser.parseRegister();
    operandParser.tokenStream.consume(Parser.TokenType.Comma);
    let label = operandParser.parseLabel();

    return {
        '$rs': rs,
        '$rt': rt,
        'label': label
    };
};

Parser.parseRsLabel = function (operandParser) {
    let rs = operandParser.parseRegister();
    operandParser.tokenStream.consume(Parser.TokenType.Comma);
    let label = operandParser.parseLabel();

    return {
        '$rs': rs,
        'label': label
    };
};

Parser.parseRdAddr = function (operandParser) {
    let rd = operandParser.parseWritableRegister();
    operandParser.tokenStream.consume(Parser.TokenType.Comma);
    let addr = operandParser.parseLoadStoreAddress(Parser.BitsPerImmediate);
    return {
        '$rd': rd,
        'imm': addr.imm,
        '$rs': addr.$rs
    };
};

Parser.parseRtAddr = function (operandParser) {
    let rt = operandParser.parseRegister();
    operandParser.tokenStream.consume(Parser.TokenType.Comma);
    let addr = operandParser.parseLoadStoreAddress(Parser.BitsPerImmediate);
    return {
        '$rt': rt,
        'imm': addr.imm,
        '$rs': addr.$rs
    };
};

Parser.parseRdImm = function (operandParser) {
    let rd = operandParser.parseWritableRegister();
    operandParser.tokenStream.consume(Parser.TokenType.Comma);
    let imm = operandParser.parseConstant(Parser.BitsPerImmediate);
    return {
        '$rd': rd,
        'imm': imm
    };
};

Parser.parseNoArgs = function (operandParser) {
    return undefined;
}

Parser.InstructionParsers = {
    /* Integer Arithmetic Instructions */
    'ADD': Parser.parseRdRsRt,
    'ADDU': Parser.parseRdRsRt,
    'ADDI': Parser.parseRtRsImmSigned,
    'ADDIU': Parser.parseRtRsImmUnsigned,
    'SUB': Parser.parseRdRsRt,
    'SUBU': Parser.parseRdRsRt,
    'MULT': Parser.parseRsRt,
    'MULTU': Parser.parseRsRt,
    'DIV': Parser.parseRsRt,
    'DIVU': Parser.parseRsRt,
    /* Integer Comparison Instructions */
    'SLT': Parser.parseRdRsRt,
    'SLTU': Parser.parseRdRsRt,
    'SLTI': Parser.parseRtRsImmSigned,
    'SLTIU': Parser.parseRtRsImmUnsigned,
    /* Logical Instructions */
    'AND': Parser.parseRdRsRt,
    'ANDI': Parser.parseRtRsImmUnsigned,
    'OR': Parser.parseRdRsRt,
    'ORI': Parser.parseRtRsImmUnsigned,
    'XOR': Parser.parseRdRsRt,
    'XORI': Parser.parseRtRsImmUnsigned,
    'NOR': Parser.parseRdRsRt,
    /* Shift Instructions */
    'SLL': Parser.parseRdRtShamt,
    'SLLV': Parser.parseRdRsRt,
    'SRL': Parser.parseRdRtShamt,
    'SRLV': Parser.parseRdRsRt,
    'SRA': Parser.parseRdRtShamt,
    'SRAV': Parser.parseRdRsRt,
    /* Jump Instructions */
    'B': Parser.parseLabel,
    'J': Parser.parseLabel,
    'JR': Parser.parseRs,
    'JAL': Parser.parseLabel,
    'JALR': Parser.parseRdRs,
    /* Branch Instructions */
    'BEQ': Parser.parseRsRtLabel,
    'BNE': Parser.parseRsRtLabel,
    'BGT': Parser.parseRsRtLabel,
    'BGTU': Parser.parseRsRtLabel,
    'BGE': Parser.parseRsRtLabel,
    'BGEU': Parser.parseRsRtLabel,
    'BLT': Parser.parseRsRtLabel,
    'BLTU': Parser.parseRsRtLabel,
    'BLE': Parser.parseRsRtLabel,
    'BLEU': Parser.parseRsRtLabel,
    /* Branch Instructions after comparison with zero */
    'BEQZ': Parser.parseRsLabel,
    'BNEZ': Parser.parseRsLabel,
    'BGTZ': Parser.parseRsLabel,
    'BGEZ': Parser.parseRsLabel,
    'BGEZAL': Parser.parseRsLabel,
    'BLTZ': Parser.parseRsLabel,
    'BLTZAL': Parser.parseRsLabel,
    'BLEZ': Parser.parseRsLabel,
    /* Register transfer instructions */
    'MFHI': Parser.parseRd,
    'MFLO': Parser.parseRd,
    'MTHI': Parser.parseRs,
    'MTLO': Parser.parseRs,
    /* Load Instructions */
    'LB': Parser.parseRdAddr,
    'LBU': Parser.parseRdAddr,
    'LH': Parser.parseRdAddr,
    'LHU': Parser.parseRdAddr,
    'LW': Parser.parseRdAddr,
    'LWU': Parser.parseRdAddr,
    'LWL': Parser.parseRdAddr,
    'LWR': Parser.parseRdAddr,
    'LUI': Parser.parseRdImm,
    /* Store Instructions */
    'SB': Parser.parseRtAddr,
    'SH': Parser.parseRtAddr,
    'SW': Parser.parseRtAddr,
    'SWL': Parser.parseRtAddr,
    'SWR': Parser.parseRtAddr,
    /* Other Instructions */
    'SYSCALL': Parser.parseNoArgs
};

/** A parser for MIPS instructions and labels
 * @constructor
 * @param {array} symbols An array of pre-defined symbols
 * @param {Parser.TokenStream}  tokenStream The stream of tokens to parse
 */
Parser.InstructionParser = function (tokenStream, symbols) {
    let that = this;
    this.symbols = symbols || {};
    this.labels = {};
    this.code = [null];
    this.data = [];
    this.tokenStream = tokenStream;
    this.operandParser = new Parser.OperandParser(tokenStream, this.symbols);

    /**
     * Parse an instruction with its arguments.
     * 
     * @throws Parser.ParseException The instruction must be a valid assembler instruction.
     * @returns {Object}  A dictionary with 'mnemonic' and 'args' set
     */
    function parseInstruction() {
        let token = that.tokenStream.consume(Parser.TokenType.Identifier);
        let mnemonic = token.value.toUpperCase();
        let instructionParser = Parser.InstructionParsers[mnemonic];

        if (instructionParser) {
            let args = instructionParser(that.operandParser);
            return {
                mnemonic: mnemonic,
                args: args
            };
        } else {
            throw new Parser.UnknownInstructionError(token);
        }
    }

    /** Parse a label
     * @returns {String} The label name.
     */
    function parseLabel() {
        let labelToken = that.tokenStream.consume(Parser.TokenType.Identifier);
        that.tokenStream.consume(Parser.TokenType.Colon);
        that.labels[labelToken.value] = that.code.length;
        return labelToken.value;
    }

    /** Parse an optional label
     * @returns {(String|undefined)} The label name or undefined, if no label present.
     */
    function parseOptionalLabel() {
        return that.tokenStream.tryParsing(parseLabel);
    }

    /** Parse a possibly non-empty sequence of labels
     * 
     * @returns {array(Parser.Token)} The sequence of labels.
     */
    function parseLabels() {
        let label = parseOptionalLabel();
        while (label !== undefined) {
            label = parseOptionalLabel();
        }
    }

    function isEndOfLine() {
        return (that.tokenStream.checkNext(Parser.TokenType.EndOfLine) ||
                that.tokenStream.checkNext(Parser.TokenType.EndOfString));
    }

    /** Parse a sequence of optional labels and an optional instruction. */
    function parseInstructionLine() {
        parseLabels();
        if (!isEndOfLine()) {
            return parseInstruction();
        } else {
            return undefined;
        }
    }

    /** Parse an assignment to a global symbol */
    function parseSymbolAssignment() {
        let name = that.tokenStream.consume(Parser.TokenType.Identifier);
        that.tokenStream.consume(Parser.TokenType.Assignment);
        let value = that.operandParser.exprParser.parseExpression();
        that.symbols[name.value] = value;
    }

    function skipToNextLine() {
        while (!isEndOfLine()) {
            that.tokenStream.consume();
        }
        if (that.tokenStream.checkNext(Parser.TokenType.EndOfLine)) {
            that.tokenStream.consume();
        }
    }

    /** Parse a line */
    this.parseLine = function() {
        let result = {
            ignore: true,
            error: null
        };
        try {
            if (this.tokenStream.checkNext(Parser.TokenType.Identifier, 0) &&
                this.tokenStream.checkNext(Parser.TokenType.Assignment, 1)) {
                parseSymbolAssignment();
            } else {
                let line = parseInstructionLine();
                if (line) {
                    result.ignore = false;
                    result.instruction = line.mnemonic;
                    result.args = line.args;
                }
            }
            if (this.tokenStream.checkNext(Parser.TokenType.EndOfLine)) {
                this.tokenStream.consume();
            } else if (!this.tokenStream.checkNext(Parser.TokenType.EndOfString)) {
                throw new Parser.ParseError('Trailing text remaining');
            }
        } catch (e) {
            if (e instanceof Parser.Error) {
                /* Do not ignore erroneous lines! */
                result.ignore = false;
                result.error = e;
                skipToNextLine();
            } else {
                throw e;
            }
        }
        return result;
    }

    let sectionDirectives = ['.text', '.data'];

    function isEndOfSection() {
        let token = that.tokenStream.lookahead();
        if (token.type == Parser.TokenType.EndOfString) {
            return true;
        } else if (token.type == Parser.TokenType.DirectiveName) {
            return sectionDirectives.includes(token.value);
        } else {
            return false;
        }
    }

    function addEmptyLine() {
        that.code.push({
            ignore: true,
            error: null
        });
    }

    function addErrorLine(e) {
        that.code.push({
            ignore: false,
            error: e
        });
    }

    function parseTextSection() {
        while (!isEndOfSection()) {
            let instruction = that.parseLine();
            that.code.push(instruction);
        }
    }

    let BITS_PER_BYTE = 8;
    let MAX_BYTE_VALUE = 255;
    let BYTES_PER_WORD = 4;
    let BITS_PER_WORD = BYTES_PER_WORD * BITS_PER_BYTE;

    function storeData(byteCount, data) {
        assert(typeof data === "number", "Only numbers supported.");
        var bitCount = byteCount * BITS_PER_BYTE;
        assert(0 <= bitCount && bitCount <= 32, "The & operator will only work for up to 32 bits.");
    
        /* We check the range as allowed by the given number of bits in either
            * unsigned or (twos complement) signed representation.
            */
        var minValidValue = MIPS.minSignedValue(bitCount);
        var maxValidValue = MIPS.maxUnsignedValue(bitCount);
        if (data < minValidValue || maxValidValue < data) {
            throw new MemoryError('Unable to store out-of-range value ({0}). Valid values are {1} through {2}.'.format(data, minValidValue, maxValidValue));
        };
    
        /* Ensure that the actual data is unsigned so we can split it up into its bytes.
            * It will then be in the valid range of bitCount bits unsigned integer due to the
            * check above. */
        if (data < 0) {
            // convert negative value to positive one
            try {
                data = MIPS.signedNumberToUnsignedNumber(data, bitCount);
            } catch (e) {
                if (e instanceof MipsError) {
                    throw new MemoryError(e.message);
                } else {
                    throw e;
                }
            }
        }
    
        /* Split it up into the respective bytes */
        let offset = that.data.length;
        for (var i = byteCount - 1; i >= 0; i--) {
            var rightMostByte = data & MAX_BYTE_VALUE;
            that.data[offset+i]=rightMostByte;
            data = data >>> BITS_PER_BYTE;
        };
    }

    function parseDataWordDirective() {
        let value = that.operandParser.parseConstant(BITS_PER_WORD);
        storeData(BYTES_PER_WORD, value);
        while (!isEndOfLine()) {
            that.tokenStream.consume(Parser.TokenType.Comma);
            value = that.operandParser.parseConstant(BITS_PER_WORD);
            storeData(BYTES_PER_WORD, value);
        }
        if (that.tokenStream.checkNext(Parser.TokenType.EndOfLine)) {
            that.tokenStream.consume(Parser.TokenType.EndOfLine);
        }
    }

    let dataDirectives = {
        '.word': parseDataWordDirective
    };

    function parseDataDirective() {
        let token = that.tokenStream.lookahead();
        that.tokenStream.consume(Parser.TokenType.DirectiveName);
        let handler = dataDirectives[token.value];
        if (handler) {
            handler.call();
            addEmptyLine();
        } else {
            throw new Parser.UnknownDirectiveError(token);
        }
    }

    function parseDataSection() {
        while (!isEndOfSection()) {
            try {
                parseDataDirective();
            } catch (e) {
                if (e instanceof Parser.ParseError) {
                    addErrorLine(e);
                    skipToNextLine();
                } else {
                    throw e;
                }
            }
        }
    }

    this.parseCode = function() {
        parseTextSection();
        while (!this.tokenStream.checkNext(Parser.TokenType.EndOfString)) {
            let token = this.tokenStream.lookahead();
            this.tokenStream.consume(Parser.TokenType.DirectiveName);
            this.tokenStream.consume(Parser.TokenType.EndOfLine);
            addEmptyLine();
            if (token.value == '.text') {
                parseTextSection();
            } else if (token.value == '.data') {
                parseDataSection();
            }
        }
    }
}

/** Create an {@link Parser.InstructionParser} from a string
 * @param {string}  input The string to parse
 * @param {array} symbols An array of pre-defined symbols
 * @returns {Parser.InstructionParser} The operand parser for parsing the string
 */
Parser.instructionParserFromString = function(text, symbols) {
    let tokenStream = Parser.tokenStreamFromString(text);
    return new Parser.InstructionParser(tokenStream, symbols);
}
