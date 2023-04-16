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

Parser.parseRsRtLabel = function (operandParser) {
    let rs = operandParser.parseRegister();
    operandParser.tokenStream.consume(Parser.TokenType.Comma);
    let rt = operandParser.parseWritableRegister();
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
    let rt = operandParser.parseWritableRegister();
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
    'BGE': Parser.parseRsRtLabel,
    'BLT': Parser.parseRsRtLabel,
    'BLE': Parser.parseRsRtLabel,
    /* Branch Instructions after comparison with zero */
    'BEQZ': Parser.parseRsLabel,
    'BNEZ': Parser.parseRsLabel,
    'BGTZ': Parser.parseRsLabel,
    'BGEZ': Parser.parseRsLabel,
    'BGEZAL': Parser.parseRsLabel,
    'BLTZ': Parser.parseRsLabel,
    'BLTZAL': Parser.parseRsLabel,
    'BLEZ': Parser.parseRsLabel,
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

Parser.InstructionParser = function (tokenStream) {
    this.tokenStream = tokenStream;
    this.operandParser = new Parser.OperandParser(tokenStream);

    /**
     * Parse an instruction with its arguments.
     * 
     * @throws Parser.ParseException The instruction must be a valid assembler instruction.
     * @returns {Object}  A dictionary with 'mnemonic' and 'args' set
     */
    this.parseInstruction = function() {
        let token = this.tokenStream.consume(Parser.TokenType.Identifier);
        let mnemonic = token.value.toUpperCase();
        let instructionParser = Parser.InstructionParsers[mnemonic];

        if (instructionParser) {
            let args = instructionParser(this.operandParser);
            return {
                mnemonic: mnemonic,
                args: args
            };
        } else {
            throw new Parser.UnknownInstructionError(token);
        }
    }

    /** Parse an optional label.
     * 
     * If the following token sequence is not a label, this will consume no tokens.
     * 
     * @returns {(String|undefined)} The label name or <code>undefined</code> if no label is present.
     */
    this.parseOptionalLabel = function() {
        if (this.tokenStream.checkNext(Parser.TokenType.Identifier, 0) &&
            this.tokenStream.checkNext(Parser.TokenType.Colon, 1)) {
            let labelToken = this.tokenStream.lookahead();
            this.tokenStream.consume();
            this.tokenStream.consume();
            return labelToken.value;
        } else {
            return undefined;
        }
    }

    /** Parse a possibly non-empty sequence of labels
     * 
     * @returns {array(Parser.Token)} The sequence of labels.
     */
    this.parseLabels = function() {
        let labels = [];
        let label = this.parseOptionalLabel();
        while (label !== undefined) {
            labels.push(label);
            label = this.parseOptionalLabel();
        }
        return labels;
    }

    /** Parse a sequence of optional labels and an optional instruction. */
    this.parseLine = function() {
        let labels = this.parseLabels();
        let instr = undefined;
        if (!this.tokenStream.checkNext(Parser.TokenType.EndOfString)) {
            instr = this.parseInstruction();
        }
        return {
            labels: labels,
            instr: instr
        };
    }
}

/** Create an {@link Parser.InstructionParser} from a string
 * @param {string}  input The string to parse
 * @returns {Parser.InstructionParser} The operand parser for parsing the string
 */
Parser.instructionParserFromString = function(text) {
    let tokenStream = Parser.tokenStreamFromString(text);
    return new Parser.InstructionParser(tokenStream);
}
