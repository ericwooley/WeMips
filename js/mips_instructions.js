function mipsInstructionExecutor(ME) {
    var BITS_PER_SHAMT = 5;
    var BITS_PER_IMMEDIATE = 16;
	var instructions = {
        /////////////////////////////////////////////
        // Mips Arithmetic Instructions
        /////////////////////////////////////////////
        'ADD': {
            parseMethod: parse_$RD_$rs_$rt,
            runMethod: function(namedArgs) {
            	ME.setRegisterVal(namedArgs.$rd, signedAddition(ME.getRegisterVal(namedArgs.$rs), ME.getRegisterVal(namedArgs.$rt)));
            	ME.incerementPC();
            }
        },
        'ADDI': {
            parseMethod: parse_$RT_$rs_immSignExt,
            runMethod: function(namedArgs) {
            	ME.setRegisterVal(namedArgs.$rt, signedAddition(ME.getRegisterVal(namedArgs.$rs), namedArgs.imm));
            	ME.incerementPC();
            }
        },
        'ADDU': {
            parseMethod: parse_$RD_$rs_$rt,
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rd, unsignedAddition(ME.getRegisterUnsignedVal(namedArgs.$rs), ME.getRegisterUnsignedVal(namedArgs.$rt)));
                ME.incerementPC();
            }
        },
        'ADDIU': {
            parseMethod: parse_$RT_$rs_immZeroExt,
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rt, unsignedAddition(ME.getRegisterUnsignedVal(namedArgs.$rs), namedArgs.imm));
                ME.incerementPC();
            }
        },
        'SUB': {
            parseMethod: parse_$RD_$rs_$rt,
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rd, signedAddition(ME.getRegisterVal(namedArgs.$rs), -ME.getRegisterVal(namedArgs.$rt)));
                ME.incerementPC();
            }
        },
        'SUBU': {
            parseMethod: parse_$RD_$rs_$rt,
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rd, unsignedAddition(ME.getRegisterUnsignedVal(namedArgs.$rs), -ME.getRegisterUnsignedVal(namedArgs.$rt)));
                ME.incerementPC();
            }
        },
        'LUI': {
            parseMethod: parse_$RT_imm,
            runMethod: function(namedArgs){
                ME.setRegisterVal(namedArgs.$rd, (namedArgs.imm << 16));
                ME.incerementPC();
            }
        },
        /////////////////////////////////////////////
        // Mips Logical Instructions
        /////////////////////////////////////////////
        'AND': {
            parseMethod: parse_$RD_$rs_$rt,
            runMethod: function(namedArgs){
                ME.setRegisterVal(namedArgs.$rd,
                    ME.getRegisterVal(namedArgs.$rs) & ME.getRegisterVal(namedArgs.$rt)
                );
                ME.incerementPC();
            }
        },
        'ANDI': {
            parseMethod: parse_$RT_$rs_immZeroExt,
            runMethod: function(namedArgs){
                ME.setRegisterVal(namedArgs.$rt,
                    ME.getRegisterVal(namedArgs.$rs) & namedArgs.imm
                );
                ME.incerementPC();
            }
        },
        'NOR': {
            parseMethod: parse_$RD_$rs_$rt,
            runMethod: function(namedArgs){
                ME.setRegisterVal(namedArgs.$rd,
                    ~(ME.getRegisterVal(namedArgs.$rs) | ME.getRegisterVal(namedArgs.$rt))
                );
                ME.incerementPC();
            }
        },
        'OR': {
            parseMethod: parse_$RD_$rs_$rt,
            runMethod: function(namedArgs){
                ME.setRegisterVal(namedArgs.$rd,
                    (ME.getRegisterVal(namedArgs.$rs) | ME.getRegisterVal(namedArgs.$rt))
                );
                ME.incerementPC();
            }
        },
        'ORI': {
            parseMethod: parse_$RT_$rs_immZeroExt,
            runMethod: function(namedArgs){
                ME.setRegisterVal(namedArgs.$rt,
                    (ME.getRegisterVal(namedArgs.$rs) | namedArgs.imm)
                );
                ME.incerementPC();
            }
        },
        'XOR': {
            parseMethod: parse_$RD_$rs_$rt,
            runMethod: function(namedArgs){
                ME.setRegisterVal(namedArgs.$rd,
                    (ME.getRegisterVal(namedArgs.$rs) ^ ME.getRegisterVal(namedArgs.$rt))
                );
                ME.incerementPC();
            }
        },
        'XORI': {
            parseMethod: parse_$RT_$rs_immZeroExt,
            runMethod: function(namedArgs){
                ME.setRegisterVal(namedArgs.$rt,
                    (ME.getRegisterVal(namedArgs.$rs) ^ namedArgs.imm)
                );
                ME.incerementPC();
            }
        },
        'SLL': {
            parseMethod: parse_$RD_$rt_shamt,
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rd, ME.getRegisterVal(namedArgs.$rt) << namedArgs.shamt);
                ME.incerementPC();
            }
        },
        'SLLV': {
            parseMethod: parse_$RD_$rs_$rt,
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rd, ME.getRegisterVal(namedArgs.$rs) << (ME.getRegisterVal(namedArgs.$rt) & 31));
                ME.incerementPC();
            }
        },
        'SRL': {
            parseMethod: parse_$RD_$rt_shamt,
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rd, ME.getRegisterVal(namedArgs.$rt) >>> namedArgs.shamt);
                ME.incerementPC();
            }
        },
        'SRLV': {
            parseMethod: parse_$RD_$rs_$rt,
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rd, ME.getRegisterVal(namedArgs.$rs) >>> (ME.getRegisterVal(namedArgs.$rt) & 31));
                ME.incerementPC();
            }
        },
        'SRA': {
            parseMethod: parse_$RD_$rt_shamt,
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rd, ME.getRegisterVal(namedArgs.$rt) >> namedArgs.shamt);
                ME.incerementPC();
            }
        },
        'SRAV': {
            parseMethod: parse_$RD_$rs_$rt,
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rd, ME.getRegisterVal(namedArgs.$rs) >> (ME.getRegisterUnsignedVal(namedArgs.$rt) & 31));
                ME.incerementPC();
            }
        },
        /////////////////////////////////////////////
        // Mips Branch and Jump Instructions
        /////////////////////////////////////////////
        'B': {
            parseMethod: parse_label,
            runMethod: function(namedArgs) {
                ME.goToLabel(namedArgs.label);
            },
            pseudoInstruction: true
        },
        'BEQ': {
            parseMethod: parse_$rs_$rt_label,
            runMethod: function(namedArgs) {
                if (ME.getRegisterVal(namedArgs.$rs) === ME.getRegisterVal(namedArgs.$rt))
                    ME.goToLabel(namedArgs.label);
                else
                    ME.incerementPC();
            }
        },
        'BNE': {
            parseMethod: parse_$rs_$rt_label,
            runMethod: function(namedArgs) {
                if (ME.getRegisterVal(namedArgs.$rs) !== ME.getRegisterVal(namedArgs.$rt))
                    ME.goToLabel(namedArgs.label);
                else
                    ME.incerementPC();
            }
        },
        'BGT': {
            parseMethod: parse_$rs_$rt_label,
            runMethod: function(namedArgs) {
                if (ME.getRegisterVal(namedArgs.$rs) > ME.getRegisterVal(namedArgs.$rt))
                    ME.goToLabel(namedArgs.label);
                else
                    ME.incerementPC();
            },
            pseudoInstruction: true
        },
        'BGE': {
            parseMethod: parse_$rs_$rt_label,
            runMethod: function(namedArgs) {
                if (ME.getRegisterVal(namedArgs.$rs) >= ME.getRegisterVal(namedArgs.$rt))
                    ME.goToLabel(namedArgs.label);
                else
                    ME.incerementPC();
            },
            pseudoInstruction: true
        },
        'BLT': {
            parseMethod: parse_$rs_$rt_label,
            runMethod: function(namedArgs) {
                if (ME.getRegisterVal(namedArgs.$rs) < ME.getRegisterVal(namedArgs.$rt))
                    ME.goToLabel(namedArgs.label);
                else
                    ME.incerementPC();
            },
            pseudoInstruction: true
        },
        'BLE': {
            parseMethod: parse_$rs_$rt_label,
            runMethod: function(namedArgs) {
                if (ME.getRegisterVal(namedArgs.$rs) <= ME.getRegisterVal(namedArgs.$rt))
                    ME.goToLabel(namedArgs.label);
                else
                    ME.incerementPC();
            }
        },
        'BEQZ': {
            parseMethod: parse_$rs_label,
            runMethod: function(namedArgs) {
                if (ME.getRegisterVal(namedArgs.$rs) === 0)
                    ME.goToLabel(namedArgs.label);
                else
                    ME.incerementPC();
            },
            pseudoInstruction: true
        },
        'BNEZ': {
            parseMethod: parse_$rs_label,
            runMethod: function(namedArgs) {
                if (ME.getRegisterVal(namedArgs.$rs) !== 0)
                    ME.goToLabel(namedArgs.label);
                else
                    ME.incerementPC();
            },
            pseudoInstruction: true
        },
        'BGTZ': {
            parseMethod: parse_$rs_label,
            runMethod: function(namedArgs) {
                if (ME.getRegisterVal(namedArgs.$rs) > 0)
                    ME.goToLabel(namedArgs.label);
                else
                    ME.incerementPC();
            }
        },
        'BGEZ': {
            parseMethod: parse_$rs_label,
            runMethod: function(namedArgs) {
                if (ME.getRegisterVal(namedArgs.$rs) >= 0)
                    ME.goToLabel(namedArgs.label);
                else
                    ME.incerementPC();
            }
        },
        'BGEZAL': {
            parseMethod: parse_$rs_label,
            runMethod: function(namedArgs) {
                if (ME.getRegisterVal(namedArgs.$rs) >= 0) {
                    ME.setRegisterVal('$ra', ME.getLineNumber() + 1);
                    ME.goToLabel(namedArgs.label);
                } else
                    ME.incerementPC();
            }
        },
        'BLTZ': {
            parseMethod: parse_$rs_label,
            runMethod: function(namedArgs) {
                if (ME.getRegisterVal(namedArgs.$rs) < 0)
                    ME.goToLabel(namedArgs.label);
                else
                    ME.incerementPC();
            }
        },
        'BLTZAL': {
            parseMethod: parse_$rs_label,
            runMethod: function(namedArgs) {
                if (ME.getRegisterVal(namedArgs.$rs) < 0) {
                    ME.setRegisterVal('$ra', ME.getLineNumber() + 1);
                    ME.goToLabel(namedArgs.label);
                } else
                ME.incerementPC();
            }
        },
        'BLEZ': {
            parseMethod: parse_$rs_label,
            runMethod: function(namedArgs) {
                if (ME.getRegisterVal(namedArgs.$rs) <= 0)
                    ME.goToLabel(namedArgs.label);
                else
                    ME.incerementPC();
            }
        },
        'J': {
            parseMethod: parse_label,
            runMethod: function(namedArgs) {
                ME.goToLabel(namedArgs.label);
            }
        },
        'JAL': {
            parseMethod: parse_label,
            runMethod: function(namedArgs) {
                ME.setRegisterVal('$ra', ME.getLineNumber() + 1);
                ME.goToLabel(namedArgs.label);
            }
        },
        'JALR': {
            parseMethod: parse_$rs,
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rd, ME.getLineNumber() + 1);
                // TODO: the line numbers should be random and not start at 0
                // Also, blank lines should probably have a line number associated with them
                var lineNumber = ME.getRegisterUnsignedVal(namedArgs.$rs);
                ME.setLine(lineNumber);
            }
        },
        'JR': {
            parseMethod: parse_$rs,
            runMethod: function(namedArgs) {
                // TODO: the line numbers should be random and not start at 0
                // Also, blank lines should probably have a line number associated with them
                var lineNumber = ME.getRegisterUnsignedVal(namedArgs.$rs);
                ME.setLine(lineNumber);
            }
        },
        /////////////////////////////////////////////
        // Mips Memory Access Instructions
        /////////////////////////////////////////////
        'LW': {
            parseMethod: parse_$RT_imm_$rs,
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rd, ME.stack.getWord(ME.getRegisterUnsignedVal(namedArgs.$rs) + namedArgs.imm));
                ME.incerementPC();
            }
        },
        'LWL': {
            parseMethod: parse_$RT_imm_$rs,
            runMethod: function(namedArgs) {
                var addr = ME.getRegisterUnsignedVal(namedArgs.$rs) + namedArgs.imm;
                var offset = addr & 3;
                var value = ME.stack.getDataAtAddress(addr, 4 - offset);
                var bitOffset = offset*8;
                var lowerMask = Math.pow(2,bitOffset)-1;
                var upperMask = ~lowerMask;
                ME.setRegisterVal(namedArgs.$rd, ((value << bitOffset) & upperMask) | (ME.getRegisterVal(namedArgs.$rd) & lowerMask));
                ME.incerementPC();
            }
        },
        'LWR': {
            parseMethod: parse_$RT_imm_$rs,
            runMethod: function(namedArgs) {
                var addr = ME.getRegisterUnsignedVal(namedArgs.$rs) + namedArgs.imm;
                var offset = addr & 3;
                var value = ME.stack.getDataAtAddress(addr & ~3, offset+1);
                var bitOffset = (offset+1)*8;
                var lowerMask = Math.pow(2,bitOffset)-1;
                var upperMask = ~lowerMask;
                ME.setRegisterVal(namedArgs.$rd, (ME.getRegisterVal(namedArgs.$rd) & upperMask) | (value & lowerMask));
                ME.incerementPC();
            }
        },
        'SWL': {
            parseMethod: parse_$RT_imm_$rs,
            runMethod: function(namedArgs) {
                var addr = ME.getRegisterUnsignedVal(namedArgs.$rs) + namedArgs.imm;
                var offset = addr & 3;
                var bitOffset = offset*8;
                var value = ME.getRegisterVal(namedArgs.$rt) >>> bitOffset;
                ME.stack.setDataAtAddress(addr, 4-offset, value);
                ME.incerementPC();
            }
        },
        'SWR': {
            parseMethod: parse_$RT_imm_$rs,
            runMethod: function(namedArgs) {
                var addr = ME.getRegisterUnsignedVal(namedArgs.$rs) + namedArgs.imm;
                var offset = addr & 3;
                var bitOffset = (offset+1)*8;
                var lowerMask = Math.pow(2, bitOffset)-1;
                var value = ME.getRegisterVal(namedArgs.$rt) & lowerMask;
                ME.stack.setDataAtAddress(addr & ~3, offset+1, value);
                ME.incerementPC();
            }
        },
        'SW': {
            parseMethod: parse_$rt_imm_$rs,
            runMethod: function(namedArgs) {
                ME.stack.setWord(ME.getRegisterUnsignedVal(namedArgs.$rs) + namedArgs.imm, ME.getRegisterVal(namedArgs.$rt));
                ME.incerementPC();
            }
        },
        'LH': {
            parseMethod: parse_$RT_imm_$rs,
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rd, ME.stack.getHalfword(ME.getRegisterUnsignedVal(namedArgs.$rs) + namedArgs.imm));
                ME.incerementPC();
            }
        },
        'LHU': {
            parseMethod: parse_$RT_imm_$rs,
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rd, ME.stack.getUnsignedHalfword(ME.getRegisterUnsignedVal(namedArgs.$rs) + namedArgs.imm));
                ME.incerementPC();
            }
        },
        'SH': {
            parseMethod: parse_$rt_imm_$rs,
            runMethod: function(namedArgs) {
                ME.stack.setHalfword(ME.getRegisterUnsignedVal(namedArgs.$rs) + namedArgs.imm, ME.getRegisterVal(namedArgs.$rt) & 65535);
                ME.incerementPC();
            }
        },
        'LB': {
            parseMethod: parse_$RT_imm_$rs,
            runMethod: function(namedArgs) {
            	ME.setRegisterVal(namedArgs.$rd, ME.stack.getByte(ME.getRegisterUnsignedVal(namedArgs.$rs) + namedArgs.imm));
            	ME.incerementPC();
            }
        },
        'LBU': {
            parseMethod: parse_$RT_imm_$rs,
            runMethod: function(namedArgs) {
            	ME.setRegisterVal(namedArgs.$rd, ME.stack.getUnsignedByte(ME.getRegisterUnsignedVal(namedArgs.$rs) + namedArgs.imm));
            	ME.incerementPC();
            }
        },
        'SB': {
            parseMethod: parse_$rt_imm_$rs,
            runMethod: function(namedArgs) {
                // TODO: should these be using unsignedAdd so that the appropriate flags are set?
            	ME.stack.setByte(ME.getRegisterUnsignedVal(namedArgs.$rs) + namedArgs.imm, ME.getRegisterVal(namedArgs.$rt) & 255);
            	ME.incerementPC();
            }
        },
        /////////////////////////////////////////////
        // Mips Comparison Instructions
        /////////////////////////////////////////////
        'SLT': {
            parseMethod: parse_$RD_$rs_$rt,
            runMethod: function(namedArgs) {
                var value = ME.getRegisterVal(namedArgs.$rs) < ME.getRegisterVal(namedArgs.$rt);
                ME.setRegisterVal(namedArgs.$rd, value ? 1 : 0);
                ME.incerementPC();
            }
        },
        'SLTI': {
            parseMethod: parse_$RT_$rs_immSignExt,
            runMethod: function(namedArgs) {
                var value = ME.getRegisterVal(namedArgs.$rs) < namedArgs.imm;
                ME.setRegisterVal(namedArgs.$rt, value ? 1 : 0);
                ME.incerementPC();
            }
        },
        'SLTU': {
            parseMethod: parse_$RD_$rs_$rt,
            runMethod: function(namedArgs) {
                var value = ME.getRegisterUnsignedVal(namedArgs.$rs) < ME.getRegisterUnsignedVal(namedArgs.$rt);
                ME.setRegisterVal(namedArgs.$rd, value ? 1 : 0);
                ME.incerementPC();
            }
        },
        'SLTIU': {
            parseMethod: parse_$RT_$rs_immZeroExt,
            runMethod: function(namedArgs) {
                var value = ME.getRegisterUnsignedVal(namedArgs.$rs) < namedArgs.imm;
                ME.setRegisterVal(namedArgs.$rt, value ? 1 : 0);
                ME.incerementPC();
            }
        },
        /////////////////////////////////////////////
        // Other
        /////////////////////////////////////////////
        'SYSCALL': {
            parseMethod: parse_noargs,
            runMethod: function(namedArgs){
                var syscalls = mipsSyscalls(ME);
                syscalls.execute();
                // don't garbage up the registers, since some of the functions return values in the registers (e.g. $v0)
                //ME.setUnpreservedRegsToGarbage();
                ME.incerementPC();
            }
        }
    };


    ////////////////////////////////////////////////
    // Private Methods
    ////////////////////////////////////////////////
    // these parse methods simply convert the 1-3 arguments of the instruction into an object that makes them more meaningful (i.e. $rd, $rs, $rt)
    // these methods are snake_case on purpose, for clarity
    // uppercase means the register is writable
    function parse_$RD_$rs_$rt(args) {
    	return {
    		'expectedArgCount': 3,
    		'$rd': parseWritableRegister(args[0]),
    		'$rs': parseRegister(args[1]),
    		'$rt': parseRegister(args[2])
    	};
    }
    function parse_$RT_$rs_immSignExt(args) {
        return {
            'expectedArgCount': 3,
            '$rt': parseWritableRegister(args[0]),
            '$rs': parseRegister(args[1]),
            'imm': parseImmediateAndSignExtend(args[2])
        };
    }
    function parse_$RT_$rs_immZeroExt(args) {
        return {
            'expectedArgCount': 3,
            '$rt': parseWritableRegister(args[0]),
            '$rs': parseRegister(args[1]),
            'imm': parseImmediateAndZeroExtend(args[2])
        };
    }
    function parse_$RT_imm(args){
    	return {
    		'expectedArgCount': 2,
    		'$rt': parseWritableRegister(args[0]),
    		'imm': parseImmediate16Bit(args[1])
    	};
    };
    function parse_$RD_$rt_shamt(args){
    	return {
    		'expectedArgCount': 3,
    		'$rd': parseWritableRegister(args[0]),
    		'$rt': parseRegister(args[1]),
    		'shamt': parseImmediateAndZeroExtend(args[2], BITS_PER_SHAMT)
    	};
    };
    function parse_$rs_$rt_label(args){
    	return {
    		'expectedArgCount': 3,
    		'$rs': parseRegister(args[0]),
    		'$rt': parseRegister(args[1]),
    		'label': parseLabel(args[2])
    	};
    };
    function parse_$rs_label(args){
    	return {
    		'expectedArgCount': 2,
    		'$rs': parseRegister(args[0]),
    		'label': parseLabel(args[1])
    	};
    };
    function parse_label(args){
    	return {
    		'expectedArgCount': 1,
    		'label': parseLabel(args[0])
    	};
    };
    function parse_$rs(args){
    	return {
    		'expectedArgCount': 1,
    		'$rs': parseRegister(args[0])
    	};
    };
    function parse_$RT_imm_$rs(args){
    	var immediateAndRegister = parseImmAnd$rs(args[1]);
    	return {
    		'expectedArgCount': 2,
    		'$rt': parseWritableRegister(args[0]),
    		'imm': parseImmediateAndSignExtend(immediateAndRegister.imm),
    		'$rs': parseRegister(immediateAndRegister.$rs)
    	};
    };
    function parse_$rt_imm_$rs(args){
    	var immediateAndRegister = parseImmAnd$rs(args[1]);
    	return {
    		'expectedArgCount': 2,
    		'$rt': parseRegister(args[0]),
    		'imm': parseImmediateAndSignExtend(immediateAndRegister.imm),
    		'$rs': parseRegister(immediateAndRegister.$rs)
    	};
    };
    function parse_noargs(args) {
        return {
            'expectedArgCount': 0
        };
    }

    function parseImmAnd$rs(string) {
        try {
            let parser = Parser.operandParserFromString(string);
            let loadStoreAddr = parser.parseLoadStoreAddress(BITS_PER_IMMEDIATE);
            parser.tokenStream.enforceCompletion();
            return loadStoreAddr;
        } catch (e) {
            if (e instanceof Parser.Error) {
                return null; // TODO: return that it was not a valid expression?
            } else {
                throw e;
            }
        }
    }
    function parseRegister(reg) {
        try {
            let parser = Parser.operandParserFromString(reg);
            return parser.parseRegister();
        } catch (e) {
            if (e instanceof Parser.Error) {
                return null;
            } else {
                throw e;
            }
        }
    }
    function parseLabel(label) {
        try {
            let parser = Parser.operandParserFromString(label);
            return parser.parseLabel();
        } catch (e) {
            if (e instanceof Parser.Error) {
                return null;
            } else {
                throw e;
            }
        }
    }
    function parseWritableRegister(reg) {
        try {
            let parser = Parser.operandParserFromString(reg);
            return parser.parseWritableRegister();
        } catch (e) {
            if (e instanceof Parser.Error) {
                return null;
            } else {
                throw e;
            }
        }
    }
    function parseImmediateAndSignExtend(arg, bits) {
        bits = bits || BITS_PER_IMMEDIATE;

        let number;
        try {
            let parser = Parser.operandParserFromString(arg);
            number = parser.parseSignedConstant(bits);
            parser.tokenStream.enforceCompletion();
            return number;
        } catch (e) {
            if (e instanceof Parser.Error) {
                return null;
            } else {
                throw e;
            }
        }
    }
    function parseImmediateAndZeroExtend(arg, bits) {
        bits = bits || BITS_PER_IMMEDIATE;

        let number;
        try {
            let parser = Parser.operandParserFromString(arg);
            number = parser.parseUnsignedConstant(bits);
            parser.tokenStream.enforceCompletion();
            return number;
        } catch (e) {
            if (e instanceof Parser.Error) {
                return null;
            } else {
                throw e;
            }
        }
    }
    function parseImmediate16Bit(arg, bits) {
        bits = bits || BITS_PER_IMMEDIATE;

        let number;
        try {
            let parser = Parser.operandParserFromString(arg);
            number = parser.parseConstant(bits);
            parser.tokenStream.enforceCompletion();
            return number;
        } catch (e) {
            if (e instanceof Parser.Error) {
                return null;
            } else {
                throw e;
            }
        }
    }

    function signedAddition(value1, value2) {
        var result = MIPS.signedAddition(value1, value2, ME.BITS_PER_REGISTER);
        if (result.overflowFlag)
            ME.onSetOverflowFlag();
        return result.result;
    }
    function unsignedAddition(value1, value2) {
        var result = MIPS.unsignedAddition(value1, value2, ME.BITS_PER_REGISTER);
        if (result.carryFlag)
            ME.onSetCarryFlag();
        return result.result;
    }

    return instructions;
}