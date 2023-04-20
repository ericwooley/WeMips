function mipsInstructionExecutor(ME) {
	var instructions = {
        /////////////////////////////////////////////
        // Mips Arithmetic Instructions
        /////////////////////////////////////////////
        'ADD': {
            runMethod: function(namedArgs) {
            	ME.setRegisterVal(namedArgs.$rd, signedAddition(ME.getRegisterVal(namedArgs.$rs), ME.getRegisterVal(namedArgs.$rt)));
            	ME.incerementPC();
            }
        },
        'ADDI': {
            runMethod: function(namedArgs) {
            	ME.setRegisterVal(namedArgs.$rt, signedAddition(ME.getRegisterVal(namedArgs.$rs), namedArgs.imm));
            	ME.incerementPC();
            }
        },
        'ADDU': {
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rd, unsignedAddition(ME.getRegisterUnsignedVal(namedArgs.$rs), ME.getRegisterUnsignedVal(namedArgs.$rt)));
                ME.incerementPC();
            }
        },
        'ADDIU': {
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rt, unsignedAddition(ME.getRegisterUnsignedVal(namedArgs.$rs), namedArgs.imm));
                ME.incerementPC();
            }
        },
        'SUB': {
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rd, signedAddition(ME.getRegisterVal(namedArgs.$rs), -ME.getRegisterVal(namedArgs.$rt)));
                ME.incerementPC();
            }
        },
        'SUBU': {
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rd, unsignedAddition(ME.getRegisterUnsignedVal(namedArgs.$rs), -ME.getRegisterUnsignedVal(namedArgs.$rt)));
                ME.incerementPC();
            }
        },
        'LUI': {
            runMethod: function(namedArgs){
                ME.setRegisterVal(namedArgs.$rd, (namedArgs.imm << 16));
                ME.incerementPC();
            }
        },
        /////////////////////////////////////////////
        // Mips Logical Instructions
        /////////////////////////////////////////////
        'AND': {
            runMethod: function(namedArgs){
                ME.setRegisterVal(namedArgs.$rd,
                    ME.getRegisterVal(namedArgs.$rs) & ME.getRegisterVal(namedArgs.$rt)
                );
                ME.incerementPC();
            }
        },
        'ANDI': {
            runMethod: function(namedArgs){
                ME.setRegisterVal(namedArgs.$rt,
                    ME.getRegisterVal(namedArgs.$rs) & namedArgs.imm
                );
                ME.incerementPC();
            }
        },
        'NOR': {
            runMethod: function(namedArgs){
                ME.setRegisterVal(namedArgs.$rd,
                    ~(ME.getRegisterVal(namedArgs.$rs) | ME.getRegisterVal(namedArgs.$rt))
                );
                ME.incerementPC();
            }
        },
        'OR': {
            runMethod: function(namedArgs){
                ME.setRegisterVal(namedArgs.$rd,
                    (ME.getRegisterVal(namedArgs.$rs) | ME.getRegisterVal(namedArgs.$rt))
                );
                ME.incerementPC();
            }
        },
        'ORI': {
            runMethod: function(namedArgs){
                ME.setRegisterVal(namedArgs.$rt,
                    (ME.getRegisterVal(namedArgs.$rs) | namedArgs.imm)
                );
                ME.incerementPC();
            }
        },
        'XOR': {
            runMethod: function(namedArgs){
                ME.setRegisterVal(namedArgs.$rd,
                    (ME.getRegisterVal(namedArgs.$rs) ^ ME.getRegisterVal(namedArgs.$rt))
                );
                ME.incerementPC();
            }
        },
        'XORI': {
            runMethod: function(namedArgs){
                ME.setRegisterVal(namedArgs.$rt,
                    (ME.getRegisterVal(namedArgs.$rs) ^ namedArgs.imm)
                );
                ME.incerementPC();
            }
        },
        'SLL': {
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rd, ME.getRegisterVal(namedArgs.$rt) << namedArgs.shamt);
                ME.incerementPC();
            }
        },
        'SLLV': {
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rd, ME.getRegisterVal(namedArgs.$rs) << (ME.getRegisterVal(namedArgs.$rt) & 31));
                ME.incerementPC();
            }
        },
        'SRL': {
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rd, ME.getRegisterVal(namedArgs.$rt) >>> namedArgs.shamt);
                ME.incerementPC();
            }
        },
        'SRLV': {
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rd, ME.getRegisterVal(namedArgs.$rs) >>> (ME.getRegisterVal(namedArgs.$rt) & 31));
                ME.incerementPC();
            }
        },
        'SRA': {
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rd, ME.getRegisterVal(namedArgs.$rt) >> namedArgs.shamt);
                ME.incerementPC();
            }
        },
        'SRAV': {
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rd, ME.getRegisterVal(namedArgs.$rs) >> (ME.getRegisterUnsignedVal(namedArgs.$rt) & 31));
                ME.incerementPC();
            }
        },
        /////////////////////////////////////////////
        // Mips Branch and Jump Instructions
        /////////////////////////////////////////////
        'B': {
            runMethod: function(namedArgs) {
                ME.goToLabel(namedArgs.label);
            },
            pseudoInstruction: true
        },
        'BEQ': {
            runMethod: function(namedArgs) {
                if (ME.getRegisterVal(namedArgs.$rs) === ME.getRegisterVal(namedArgs.$rt))
                    ME.goToLabel(namedArgs.label);
                else
                    ME.incerementPC();
            }
        },
        'BNE': {
            runMethod: function(namedArgs) {
                if (ME.getRegisterVal(namedArgs.$rs) !== ME.getRegisterVal(namedArgs.$rt))
                    ME.goToLabel(namedArgs.label);
                else
                    ME.incerementPC();
            }
        },
        'BGT': {
            runMethod: function(namedArgs) {
                if (ME.getRegisterVal(namedArgs.$rs) > ME.getRegisterVal(namedArgs.$rt))
                    ME.goToLabel(namedArgs.label);
                else
                    ME.incerementPC();
            },
            pseudoInstruction: true
        },
        'BGTU': {
            runMethod: function(namedArgs) {
                if (ME.getRegisterUnsignedVal(namedArgs.$rs) > ME.getRegisterUnsignedVal(namedArgs.$rt))
                    ME.goToLabel(namedArgs.label);
                else
                    ME.incerementPC();
            },
            pseudoInstruction: true
        },
        'BGE': {
            runMethod: function(namedArgs) {
                if (ME.getRegisterVal(namedArgs.$rs) >= ME.getRegisterVal(namedArgs.$rt))
                    ME.goToLabel(namedArgs.label);
                else
                    ME.incerementPC();
            },
            pseudoInstruction: true
        },
        'BGEU': {
            runMethod: function(namedArgs) {
                if (ME.getRegisterUnsignedVal(namedArgs.$rs) >= ME.getRegisterUnsignedVal(namedArgs.$rt))
                    ME.goToLabel(namedArgs.label);
                else
                    ME.incerementPC();
            },
            pseudoInstruction: true
        },
        'BLT': {
            runMethod: function(namedArgs) {
                if (ME.getRegisterVal(namedArgs.$rs) < ME.getRegisterVal(namedArgs.$rt))
                    ME.goToLabel(namedArgs.label);
                else
                    ME.incerementPC();
            },
            pseudoInstruction: true
        },
        'BLTU': {
            runMethod: function(namedArgs) {
                if (ME.getRegisterUnsignedVal(namedArgs.$rs) < ME.getRegisterUnsignedVal(namedArgs.$rt))
                    ME.goToLabel(namedArgs.label);
                else
                    ME.incerementPC();
            },
            pseudoInstruction: true
        },
        'BLE': {
            runMethod: function(namedArgs) {
                if (ME.getRegisterVal(namedArgs.$rs) <= ME.getRegisterVal(namedArgs.$rt))
                    ME.goToLabel(namedArgs.label);
                else
                    ME.incerementPC();
            },
            pseudoInstruction: true
        },
        'BLEU': {
            runMethod: function(namedArgs) {
                if (ME.getRegisterUnsignedVal(namedArgs.$rs) <= ME.getRegisterUnsignedVal(namedArgs.$rt))
                    ME.goToLabel(namedArgs.label);
                else
                    ME.incerementPC();
            },
            pseudoInstruction: true
        },
        'BEQZ': {
            runMethod: function(namedArgs) {
                if (ME.getRegisterVal(namedArgs.$rs) === 0)
                    ME.goToLabel(namedArgs.label);
                else
                    ME.incerementPC();
            },
            pseudoInstruction: true
        },
        'BNEZ': {
            runMethod: function(namedArgs) {
                if (ME.getRegisterVal(namedArgs.$rs) !== 0)
                    ME.goToLabel(namedArgs.label);
                else
                    ME.incerementPC();
            },
            pseudoInstruction: true
        },
        'BGTZ': {
            runMethod: function(namedArgs) {
                if (ME.getRegisterVal(namedArgs.$rs) > 0)
                    ME.goToLabel(namedArgs.label);
                else
                    ME.incerementPC();
            }
        },
        'BGEZ': {
            runMethod: function(namedArgs) {
                if (ME.getRegisterVal(namedArgs.$rs) >= 0)
                    ME.goToLabel(namedArgs.label);
                else
                    ME.incerementPC();
            }
        },
        'BGEZAL': {
            runMethod: function(namedArgs) {
                if (ME.getRegisterVal(namedArgs.$rs) >= 0) {
                    ME.setRegisterVal('$ra', ME.getLineNumber() + 1);
                    ME.goToLabel(namedArgs.label);
                } else
                    ME.incerementPC();
            }
        },
        'BLTZ': {
            runMethod: function(namedArgs) {
                if (ME.getRegisterVal(namedArgs.$rs) < 0)
                    ME.goToLabel(namedArgs.label);
                else
                    ME.incerementPC();
            }
        },
        'BLTZAL': {
            runMethod: function(namedArgs) {
                if (ME.getRegisterVal(namedArgs.$rs) < 0) {
                    ME.setRegisterVal('$ra', ME.getLineNumber() + 1);
                    ME.goToLabel(namedArgs.label);
                } else
                ME.incerementPC();
            }
        },
        'BLEZ': {
            runMethod: function(namedArgs) {
                if (ME.getRegisterVal(namedArgs.$rs) <= 0)
                    ME.goToLabel(namedArgs.label);
                else
                    ME.incerementPC();
            }
        },
        'J': {
            runMethod: function(namedArgs) {
                ME.goToLabel(namedArgs.label);
            }
        },
        'JAL': {
            runMethod: function(namedArgs) {
                ME.setRegisterVal('$ra', ME.getLineNumber() + 1);
                ME.goToLabel(namedArgs.label);
            }
        },
        'JALR': {
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rd, ME.getLineNumber() + 1);
                // TODO: the line numbers should be random and not start at 0
                // Also, blank lines should probably have a line number associated with them
                var lineNumber = ME.getRegisterUnsignedVal(namedArgs.$rs);
                ME.setLine(lineNumber);
            }
        },
        'JR': {
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
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rd, ME.stack.getWord(ME.getRegisterUnsignedVal(namedArgs.$rs) + namedArgs.imm));
                ME.incerementPC();
            }
        },
        'LWL': {
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
            runMethod: function(namedArgs) {
                ME.stack.setWord(ME.getRegisterUnsignedVal(namedArgs.$rs) + namedArgs.imm, ME.getRegisterVal(namedArgs.$rt));
                ME.incerementPC();
            }
        },
        'LH': {
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rd, ME.stack.getHalfword(ME.getRegisterUnsignedVal(namedArgs.$rs) + namedArgs.imm));
                ME.incerementPC();
            }
        },
        'LHU': {
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rd, ME.stack.getUnsignedHalfword(ME.getRegisterUnsignedVal(namedArgs.$rs) + namedArgs.imm));
                ME.incerementPC();
            }
        },
        'SH': {
            runMethod: function(namedArgs) {
                ME.stack.setHalfword(ME.getRegisterUnsignedVal(namedArgs.$rs) + namedArgs.imm, ME.getRegisterVal(namedArgs.$rt) & 65535);
                ME.incerementPC();
            }
        },
        'LB': {
            runMethod: function(namedArgs) {
            	ME.setRegisterVal(namedArgs.$rd, ME.stack.getByte(ME.getRegisterUnsignedVal(namedArgs.$rs) + namedArgs.imm));
            	ME.incerementPC();
            }
        },
        'LBU': {
            runMethod: function(namedArgs) {
            	ME.setRegisterVal(namedArgs.$rd, ME.stack.getUnsignedByte(ME.getRegisterUnsignedVal(namedArgs.$rs) + namedArgs.imm));
            	ME.incerementPC();
            }
        },
        'SB': {
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
            runMethod: function(namedArgs) {
                var value = ME.getRegisterVal(namedArgs.$rs) < ME.getRegisterVal(namedArgs.$rt);
                ME.setRegisterVal(namedArgs.$rd, value ? 1 : 0);
                ME.incerementPC();
            }
        },
        'SLTI': {
            runMethod: function(namedArgs) {
                var value = ME.getRegisterVal(namedArgs.$rs) < namedArgs.imm;
                ME.setRegisterVal(namedArgs.$rt, value ? 1 : 0);
                ME.incerementPC();
            }
        },
        'SLTU': {
            runMethod: function(namedArgs) {
                var value = ME.getRegisterUnsignedVal(namedArgs.$rs) < ME.getRegisterUnsignedVal(namedArgs.$rt);
                ME.setRegisterVal(namedArgs.$rd, value ? 1 : 0);
                ME.incerementPC();
            }
        },
        'SLTIU': {
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