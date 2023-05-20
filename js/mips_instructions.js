function mipsInstructionExecutor(ME) {
	var instructions = {
        /////////////////////////////////////////////
        // Mips Arithmetic Instructions
        /////////////////////////////////////////////
        'ADD': {
            runMethod: function(namedArgs) {
            	ME.setRegisterVal(namedArgs.$rd, signedAddition(ME.getRegisterVal(namedArgs.$rs), ME.getRegisterVal(namedArgs.$rt)));
            }
        },
        'ADDI': {
            runMethod: function(namedArgs) {
            	ME.setRegisterVal(namedArgs.$rt, signedAddition(ME.getRegisterVal(namedArgs.$rs), namedArgs.imm));
            }
        },
        'ADDU': {
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rd, unsignedAddition(ME.getRegisterUnsignedVal(namedArgs.$rs), ME.getRegisterUnsignedVal(namedArgs.$rt)));
            }
        },
        'ADDIU': {
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rt, unsignedAddition(ME.getRegisterUnsignedVal(namedArgs.$rs), namedArgs.imm));
            }
        },
        'SUB': {
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rd, signedAddition(ME.getRegisterVal(namedArgs.$rs), -ME.getRegisterVal(namedArgs.$rt)));
            }
        },
        'SUBU': {
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rd, unsignedAddition(ME.getRegisterUnsignedVal(namedArgs.$rs), -ME.getRegisterUnsignedVal(namedArgs.$rt)));
            }
        },
        'MULT': {
            runMethod: function(namedArgs) {
                let multResult = multiplication(
                    ME.getRegisterVal(namedArgs.$rs),
                    ME.getRegisterVal(namedArgs.$rt)
                );
                ME.setRegisterVal('hi', multResult.hi);
                ME.setRegisterVal('lo', multResult.lo);
            }
        },
        'MULTU': {
            runMethod: function(namedArgs) {
                let multResult = multiplication(
                    ME.getRegisterUnsignedVal(namedArgs.$rs),
                    ME.getRegisterUnsignedVal(namedArgs.$rt)
                );
                ME.setRegisterVal('hi', multResult.hi);
                ME.setRegisterVal('lo', multResult.lo);
            }
        },
        'DIV': {
            runMethod: function(namedArgs) {
                let dividend = ME.getRegisterVal(namedArgs.$rs);
                let divisor = ME.getRegisterVal(namedArgs.$rt);
                var quotient = Math.trunc(dividend / divisor);
                let remainder = dividend - divisor * quotient;
                ME.setRegisterVal('lo', quotient);
                ME.setRegisterVal('hi', remainder);
            }
        },
        'DIVU': {
            runMethod: function(namedArgs) {
                let dividend = ME.getRegisterUnsignedVal(namedArgs.$rs);
                let divisor = ME.getRegisterUnsignedVal(namedArgs.$rt);
                let quotient = Math.trunc(dividend / divisor);
                let remainder = dividend - divisor * quotient;
                ME.setRegisterVal('lo', quotient);
                ME.setRegisterVal('hi', remainder);
            }
        },
        'LUI': {
            runMethod: function(namedArgs){
                ME.setRegisterVal(namedArgs.$rd, (namedArgs.imm << 16));
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
            }
        },
        'ANDI': {
            runMethod: function(namedArgs){
                ME.setRegisterVal(namedArgs.$rt,
                    ME.getRegisterVal(namedArgs.$rs) & namedArgs.imm
                );
            }
        },
        'NOR': {
            runMethod: function(namedArgs){
                ME.setRegisterVal(namedArgs.$rd,
                    ~(ME.getRegisterVal(namedArgs.$rs) | ME.getRegisterVal(namedArgs.$rt))
                );
            }
        },
        'OR': {
            runMethod: function(namedArgs){
                ME.setRegisterVal(namedArgs.$rd,
                    (ME.getRegisterVal(namedArgs.$rs) | ME.getRegisterVal(namedArgs.$rt))
                );
            }
        },
        'ORI': {
            runMethod: function(namedArgs){
                ME.setRegisterVal(namedArgs.$rt,
                    (ME.getRegisterVal(namedArgs.$rs) | namedArgs.imm)
                );
            }
        },
        'XOR': {
            runMethod: function(namedArgs){
                ME.setRegisterVal(namedArgs.$rd,
                    (ME.getRegisterVal(namedArgs.$rs) ^ ME.getRegisterVal(namedArgs.$rt))
                );
            }
        },
        'XORI': {
            runMethod: function(namedArgs){
                ME.setRegisterVal(namedArgs.$rt,
                    (ME.getRegisterVal(namedArgs.$rs) ^ namedArgs.imm)
                );
            }
        },
        'SLL': {
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rd, ME.getRegisterVal(namedArgs.$rt) << namedArgs.shamt);
            }
        },
        'SLLV': {
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rd, ME.getRegisterVal(namedArgs.$rs) << (ME.getRegisterVal(namedArgs.$rt) & 31));
            }
        },
        'SRL': {
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rd, ME.getRegisterVal(namedArgs.$rt) >>> namedArgs.shamt);
            }
        },
        'SRLV': {
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rd, ME.getRegisterVal(namedArgs.$rs) >>> (ME.getRegisterVal(namedArgs.$rt) & 31));
            }
        },
        'SRA': {
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rd, ME.getRegisterVal(namedArgs.$rt) >> namedArgs.shamt);
            }
        },
        'SRAV': {
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rd, ME.getRegisterVal(namedArgs.$rs) >> (ME.getRegisterUnsignedVal(namedArgs.$rt) & 31));
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
            }
        },
        'BNE': {
            runMethod: function(namedArgs) {
                if (ME.getRegisterVal(namedArgs.$rs) !== ME.getRegisterVal(namedArgs.$rt))
                    ME.goToLabel(namedArgs.label);
            }
        },
        'BGT': {
            runMethod: function(namedArgs) {
                if (ME.getRegisterVal(namedArgs.$rs) > ME.getRegisterVal(namedArgs.$rt))
                    ME.goToLabel(namedArgs.label);
            },
            pseudoInstruction: true
        },
        'BGTU': {
            runMethod: function(namedArgs) {
                if (ME.getRegisterUnsignedVal(namedArgs.$rs) > ME.getRegisterUnsignedVal(namedArgs.$rt))
                    ME.goToLabel(namedArgs.label);
            },
            pseudoInstruction: true
        },
        'BGE': {
            runMethod: function(namedArgs) {
                if (ME.getRegisterVal(namedArgs.$rs) >= ME.getRegisterVal(namedArgs.$rt))
                    ME.goToLabel(namedArgs.label);
            },
            pseudoInstruction: true
        },
        'BGEU': {
            runMethod: function(namedArgs) {
                if (ME.getRegisterUnsignedVal(namedArgs.$rs) >= ME.getRegisterUnsignedVal(namedArgs.$rt))
                    ME.goToLabel(namedArgs.label);
            },
            pseudoInstruction: true
        },
        'BLT': {
            runMethod: function(namedArgs) {
                if (ME.getRegisterVal(namedArgs.$rs) < ME.getRegisterVal(namedArgs.$rt))
                    ME.goToLabel(namedArgs.label);
            },
            pseudoInstruction: true
        },
        'BLTU': {
            runMethod: function(namedArgs) {
                if (ME.getRegisterUnsignedVal(namedArgs.$rs) < ME.getRegisterUnsignedVal(namedArgs.$rt))
                    ME.goToLabel(namedArgs.label);
            },
            pseudoInstruction: true
        },
        'BLE': {
            runMethod: function(namedArgs) {
                if (ME.getRegisterVal(namedArgs.$rs) <= ME.getRegisterVal(namedArgs.$rt))
                    ME.goToLabel(namedArgs.label);
            },
            pseudoInstruction: true
        },
        'BLEU': {
            runMethod: function(namedArgs) {
                if (ME.getRegisterUnsignedVal(namedArgs.$rs) <= ME.getRegisterUnsignedVal(namedArgs.$rt))
                    ME.goToLabel(namedArgs.label);
            },
            pseudoInstruction: true
        },
        'BEQZ': {
            runMethod: function(namedArgs) {
                if (ME.getRegisterVal(namedArgs.$rs) === 0)
                    ME.goToLabel(namedArgs.label);
            },
            pseudoInstruction: true
        },
        'BNEZ': {
            runMethod: function(namedArgs) {
                if (ME.getRegisterVal(namedArgs.$rs) !== 0)
                    ME.goToLabel(namedArgs.label);
            },
            pseudoInstruction: true
        },
        'BGTZ': {
            runMethod: function(namedArgs) {
                if (ME.getRegisterVal(namedArgs.$rs) > 0)
                    ME.goToLabel(namedArgs.label);
            }
        },
        'BGEZ': {
            runMethod: function(namedArgs) {
                if (ME.getRegisterVal(namedArgs.$rs) >= 0)
                    ME.goToLabel(namedArgs.label);
            }
        },
        'BGEZAL': {
            runMethod: function(namedArgs) {
                if (ME.getRegisterVal(namedArgs.$rs) >= 0) {
                    ME.linkReturnAddress('$ra');
                    ME.goToLabel(namedArgs.label);
                }
            }
        },
        'BLTZ': {
            runMethod: function(namedArgs) {
                if (ME.getRegisterVal(namedArgs.$rs) < 0)
                    ME.goToLabel(namedArgs.label);
            }
        },
        'BLTZAL': {
            runMethod: function(namedArgs) {
                if (ME.getRegisterVal(namedArgs.$rs) < 0) {
                    ME.linkReturnAddress('$ra');
                    ME.goToLabel(namedArgs.label);
                }
            }
        },
        'BLEZ': {
            runMethod: function(namedArgs) {
                if (ME.getRegisterVal(namedArgs.$rs) <= 0)
                    ME.goToLabel(namedArgs.label);
            }
        },
        'J': {
            runMethod: function(namedArgs) {
                ME.goToLabel(namedArgs.label);
            }
        },
        'JAL': {
            runMethod: function(namedArgs) {
                ME.linkReturnAddress('$ra');
                ME.goToLabel(namedArgs.label);
            }
        },
        'JALR': {
            runMethod: function(namedArgs) {
                ME.linkReturnAddress(namedArgs.$rd);
                var lineNumber = ME.getRegisterUnsignedVal(namedArgs.$rs);
                ME.goToLine(lineNumber);
            }
        },
        'JR': {
            runMethod: function(namedArgs) {
                var lineNumber = ME.getRegisterUnsignedVal(namedArgs.$rs);
                ME.goToLine(lineNumber);
            }
        },
        /////////////////////////////////////////////
        // Mips Register Transfer Instructions
        /////////////////////////////////////////////
        'MTHI': {
            runMethod: function(namedArgs) {
                ME.setRegisterVal('hi', ME.getRegisterVal(namedArgs.$rs));
            }
        },
        'MTLO': {
            runMethod: function(namedArgs) {
                ME.setRegisterVal('lo', ME.getRegisterVal(namedArgs.$rs));
            }
        },
        'MFHI': {
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rd, ME.getRegisterVal('hi'));
            }
        },
        'MFLO': {
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rd, ME.getRegisterVal('lo'));
            }
        },
        /////////////////////////////////////////////
        // Mips Memory Access Instructions
        /////////////////////////////////////////////
        'LW': {
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rd, ME.memory.getWord(ME.getRegisterUnsignedVal(namedArgs.$rs) + namedArgs.imm));
            }
        },
        'LWL': {
            runMethod: function(namedArgs) {
                var addr = ME.getRegisterUnsignedVal(namedArgs.$rs) + namedArgs.imm;
                var offset = addr & 3;
                var value = ME.memory.getDataAtAddress(addr, 4 - offset);
                var bitOffset = offset*8;
                var lowerMask = Math.pow(2,bitOffset)-1;
                var upperMask = ~lowerMask;
                ME.setRegisterVal(namedArgs.$rd, ((value << bitOffset) & upperMask) | (ME.getRegisterVal(namedArgs.$rd) & lowerMask));
            }
        },
        'LWR': {
            runMethod: function(namedArgs) {
                var addr = ME.getRegisterUnsignedVal(namedArgs.$rs) + namedArgs.imm;
                var offset = addr & 3;
                var value = ME.memory.getDataAtAddress(addr & ~3, offset+1);
                var bitOffset = (offset+1)*8;
                var lowerMask = Math.pow(2,bitOffset)-1;
                var upperMask = ~lowerMask;
                ME.setRegisterVal(namedArgs.$rd, (ME.getRegisterVal(namedArgs.$rd) & upperMask) | (value & lowerMask));
            }
        },
        'SWL': {
            runMethod: function(namedArgs) {
                var addr = ME.getRegisterUnsignedVal(namedArgs.$rs) + namedArgs.imm;
                var offset = addr & 3;
                var bitOffset = offset*8;
                var value = ME.getRegisterVal(namedArgs.$rt) >>> bitOffset;
                ME.memory.setDataAtAddress(addr, 4-offset, value);
            }
        },
        'SWR': {
            runMethod: function(namedArgs) {
                var addr = ME.getRegisterUnsignedVal(namedArgs.$rs) + namedArgs.imm;
                var offset = addr & 3;
                var bitOffset = (offset+1)*8;
                var lowerMask = Math.pow(2, bitOffset)-1;
                var value = ME.getRegisterVal(namedArgs.$rt) & lowerMask;
                ME.memory.setDataAtAddress(addr & ~3, offset+1, value);
            }
        },
        'SW': {
            runMethod: function(namedArgs) {
                ME.memory.setWord(ME.getRegisterUnsignedVal(namedArgs.$rs) + namedArgs.imm, ME.getRegisterVal(namedArgs.$rt));
            }
        },
        'LH': {
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rd, ME.memory.getHalfword(ME.getRegisterUnsignedVal(namedArgs.$rs) + namedArgs.imm));
            }
        },
        'LHU': {
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rd, ME.memory.getUnsignedHalfword(ME.getRegisterUnsignedVal(namedArgs.$rs) + namedArgs.imm));
            }
        },
        'SH': {
            runMethod: function(namedArgs) {
                ME.memory.setHalfword(ME.getRegisterUnsignedVal(namedArgs.$rs) + namedArgs.imm, ME.getRegisterVal(namedArgs.$rt) & 65535);
            }
        },
        'LB': {
            runMethod: function(namedArgs) {
            	ME.setRegisterVal(namedArgs.$rd, ME.memory.getByte(ME.getRegisterUnsignedVal(namedArgs.$rs) + namedArgs.imm));
            }
        },
        'LBU': {
            runMethod: function(namedArgs) {
            	ME.setRegisterVal(namedArgs.$rd, ME.memory.getUnsignedByte(ME.getRegisterUnsignedVal(namedArgs.$rs) + namedArgs.imm));
            }
        },
        'SB': {
            runMethod: function(namedArgs) {
                // TODO: should these be using unsignedAdd so that the appropriate flags are set?
            	ME.memory.setByte(ME.getRegisterUnsignedVal(namedArgs.$rs) + namedArgs.imm, ME.getRegisterVal(namedArgs.$rt) & 255);
            }
        },
        /////////////////////////////////////////////
        // Mips Comparison Instructions
        /////////////////////////////////////////////
        'SLT': {
            runMethod: function(namedArgs) {
                var value = ME.getRegisterVal(namedArgs.$rs) < ME.getRegisterVal(namedArgs.$rt);
                ME.setRegisterVal(namedArgs.$rd, value ? 1 : 0);
            }
        },
        'SLTI': {
            runMethod: function(namedArgs) {
                var value = ME.getRegisterVal(namedArgs.$rs) < namedArgs.imm;
                ME.setRegisterVal(namedArgs.$rt, value ? 1 : 0);
            }
        },
        'SLTU': {
            runMethod: function(namedArgs) {
                var value = ME.getRegisterUnsignedVal(namedArgs.$rs) < ME.getRegisterUnsignedVal(namedArgs.$rt);
                ME.setRegisterVal(namedArgs.$rd, value ? 1 : 0);
            }
        },
        'SLTIU': {
            runMethod: function(namedArgs) {
                var value = ME.getRegisterUnsignedVal(namedArgs.$rs) < namedArgs.imm;
                ME.setRegisterVal(namedArgs.$rt, value ? 1 : 0);
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
    function multiplication(value1, value2) {
        var result = BigInt(value1)*BigInt(value2);
        return {
            hi: Number(result>>BigInt(32)),
            lo: Number(result & BigInt(0xFFFFFFFF))
        };
    }

    return instructions;
}