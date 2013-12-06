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
            parseMethod: parse_$RT_$rs_immSignExt,
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
            } // TODO: make some tests
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
                ME.setRegisterVal(namedArgs.$rt, (namedArgs.imm << 16));
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
            } // TODO: make some tests
        },
        'OR': {
            parseMethod: parse_$RD_$rs_$rt,
            runMethod: function(namedArgs){
                ME.setRegisterVal(namedArgs.$rd,
                    (ME.getRegisterVal(namedArgs.$rs) | ME.getRegisterVal(namedArgs.$rt))
                );
                ME.incerementPC();
            } // TODO: make some tests
        },
        'ORI': {
            parseMethod: parse_$RT_$rs_immZeroExt,
            runMethod: function(namedArgs){
                ME.setRegisterVal(namedArgs.$rt,
                    (ME.getRegisterVal(namedArgs.$rs) | namedArgs.imm)
                );
                ME.incerementPC();
            } // TODO: make some tests
        },
        'SLL': {
            parseMethod: parse_$RD_$rt_shamt,
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rd, ME.getRegisterVal(namedArgs.$rt) << namedArgs.shamt);
                ME.incerementPC();
            }
        },
        'SRL': {
            parseMethod: parse_$RD_$rt_shamt,
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rd, ME.getRegisterVal(namedArgs.$rt) >> namedArgs.shamt);
                ME.incerementPC();
            } // TODO: make some tests
        },
        /////////////////////////////////////////////
        // Mips Branch and Jump Instructions
        /////////////////////////////////////////////
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
            } // TODO: make some tests
        },
        'JR': {
            parseMethod: parse_$rs,
            runMethod: function(namedArgs) {
                // TODO: the line numbers should be random and not start at 0
                // Also, blank lines should probably have a line number associated with them
                var lineNumber = ME.getRegisterUnsignedVal(namedArgs.$rs);
                ME.setLine(lineNumber);
            } // TODO: make some tests
        },
        /////////////////////////////////////////////
        // Mips Memory Access Instructions
        /////////////////////////////////////////////
        'LW': {
            parseMethod: parse_$RT_imm_$rs,
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rt, ME.stack.getWord(ME.getRegisterUnsignedVal(namedArgs.$rs) + namedArgs.imm));
                ME.incerementPC();
            } // TODO: make some tests
        },
        'SW': {
            parseMethod: parse_$rt_imm_$rs,
            runMethod: function(namedArgs) {
                ME.stack.setWord(ME.getRegisterUnsignedVal(namedArgs.$rs) + namedArgs.imm, ME.getRegisterVal(namedArgs.$rt));
                ME.incerementPC();
            } // TODO: make some tests
        },
        'LH': {
            parseMethod: parse_$RT_imm_$rs,
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rt, ME.stack.getHalfword(ME.getRegisterUnsignedVal(namedArgs.$rs) + namedArgs.imm));
                ME.incerementPC();
            } // TODO: make some tests
        },
        'LHU': {
            parseMethod: parse_$RT_imm_$rs,
            runMethod: function(namedArgs) {
                ME.setRegisterVal(namedArgs.$rt, ME.stack.getUnsignedHalfword(ME.getRegisterUnsignedVal(namedArgs.$rs) + namedArgs.imm));
                ME.incerementPC();
            } // TODO: make some tests
        },
        'SH': {
            parseMethod: parse_$rt_imm_$rs,
            runMethod: function(namedArgs) {
                ME.stack.setHalfword(ME.getRegisterUnsignedVal(namedArgs.$rs) + namedArgs.imm, ME.getRegisterVal(namedArgs.$rt));
                ME.incerementPC();
            } // TODO: make some tests
        },
        'LB': {
            parseMethod: parse_$RT_imm_$rs,
            runMethod: function(namedArgs) {
            	ME.setRegisterVal(namedArgs.$rt, ME.stack.getByte(ME.getRegisterUnsignedVal(namedArgs.$rs) + namedArgs.imm));
            	ME.incerementPC();
            }
        },
        'LBU': {
            parseMethod: parse_$RT_imm_$rs,
            runMethod: function(namedArgs) {
            	ME.setRegisterVal(namedArgs.$rt, ME.stack.getUnsignedByte(ME.getRegisterUnsignedVal(namedArgs.$rs) + namedArgs.imm));
            	ME.incerementPC();
            }
        },
        'SB': {
            parseMethod: parse_$rt_imm_$rs,
            runMethod: function(namedArgs) {
                // TODO: should these be using unsignedAdd so that the appropriate flags are set?
            	ME.stack.setByte(ME.getRegisterUnsignedVal(namedArgs.$rs) + namedArgs.imm, ME.getRegisterVal(namedArgs.$rt));
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
            } // TODO: make some tests
        },
        'SLTI': {
            parseMethod: parse_$RT_$rs_immSignExt,
            runMethod: function(namedArgs) {
                var value = ME.getRegisterVal(namedArgs.$rs) < namedArgs.imm;
                ME.setRegisterVal(namedArgs.$rd, value ? 1 : 0);
                ME.incerementPC();
            } // TODO: make some tests
        },
        'SLTU': {
            parseMethod: parse_$RD_$rs_$rt,
            runMethod: function(namedArgs) {
                var value = ME.getRegisterUnsignedVal(namedArgs.$rs) < ME.getRegisterUnsignedVal(namedArgs.$rt);
                ME.setRegisterVal(namedArgs.$rd, value ? 1 : 0);
                ME.incerementPC();
            } // TODO: make some tests
        },
        'SLTIU': {
            parseMethod: parse_$RT_$rs_immSignExt,
            runMethod: function(namedArgs) {
                var value = ME.getRegisterUnsignedVal(namedArgs.$rs) < namedArgs.imm;
                ME.setRegisterVal(namedArgs.$rd, value ? 1 : 0);
                ME.incerementPC();
            } // TODO: make some tests
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
    	var match = /^((?:[-+]\s*)?\d+)\(\s*(\$\w+)\s*\)$/.exec(string);
    	return {
    		'imm': match[1],
    		'$rs': match[2]
    	};
    }
    function parseRegister(reg) {
    	if (ME.isValidRegister(reg))
    		return reg;
    	else
    		return null;
    }
    function parseLabel(label) {
    	if (/^[a-zA-Z]\w*$/.test(label))
    		return label;
    	else
    		return null;
    }
    function parseWritableRegister(reg) {
    	if (ME.isValidWritableRegister(reg))
    		return reg;
    	else
    		return null;
    }

    function _parseImmediate(arg, bits, extensionRule) {
        bits = bits || BITS_PER_IMMEDIATE;

        var isNumber = /^([-+]\s*)?\d+$/.test(arg);

        if (!isNumber) {
            return null;
        }

        var number = parseInt(arg, 10);

        var minValue;
        var maxValue;
        switch (extensionRule) {
            case 'signExtend':
                // when we sign extend, we keep the same value, but this means that we are dealing with signed numbers
                // e.g. -3 is 1101, when we sign extend, we get 111111101, which is still -3.
                minValue = MIPS.minSignedValue(bits);
                maxValue = MIPS.maxSignedValue(bits);
                break;
            case 'zeroExtend':
                // when we zero fill, this means we are dealing with unsigned values.
                // for example, -3 would be 1101, when we zero fill it, we get something like 0000001101, which is no longer the value -3
                minValue = MIPS.minUnsignedValue(bits);
                maxValue = MIPS.maxUnsignedValue(bits);
                break;
            case '16bit':
                // since only 16 bits are taken, it doesn't matter what we use, thus give the most amount of freedom here
                minValue = MIPS.minSignedValue(bits);
                maxValue = MIPS.maxUnsignedValue(bits);
                break;
            default:
                assert(false, 'Unhandled case.');
        }

        if (number < minValue || maxValue < number) {
            return null; // TODO: return that it was out of range?
        }

        return number;
    }
    function parseImmediateAndSignExtend(arg, bits) {
        return _parseImmediate(arg, bits, 'signExtend');
    }
    function parseImmediateAndZeroExtend(arg, bits) {
        return _parseImmediate(arg, bits, 'zeroExtend');
    }
    function parseImmediate16Bit(arg, bits) {
        return _parseImmediate(arg, bits, '16bit');
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

    var result = {
    	parseInstruction: function(instructionName, args, outArgs, outError) {
    		var instruction = instructions[instructionName];
	        if (!instruction) {
	            if (outError) outError.message = "Unknown instruction: " + instructionName;
	            return false;
	        }

	        var parseMethod = instruction.parseMethod;
	        assert(parseMethod, "If this is a valid instruction, then it must have a parseMethod.");

	        // ensure that each of the keys (e.g. $rd, $rs, $rt) contain a non-null value in order to determine if we were successful or not
        	var validArgs = true;
        	var namedArgs = parseMethod(args); // e.g. namedArgs has $rd, $rs, imm, etc.
        	if (namedArgs['expectedArgCount'] !== args.length) {
                var invalid = true;
                if (namedArgs['expectedArgCount'] === 0 && args.length === 1) {
                    if (args[0] === '') {
                        // 0 expected args should consider [''] to be valid as well.
                        invalid = false;
                    }
                }

                if (invalid) {
    	            if (outError) outError.message = "Incorrect number of arguments {0}, should be {1}.".format(args.length, namedArgs['expectedArgCount']);
    	            return false;
                }
        	}
			for (var key in namedArgs) {
				// important check that this is objects own property not from prototype prop inherited
				if (!namedArgs.hasOwnProperty(key)) continue;

				if (namedArgs[key] === null) {
					validArgs = false;
					break;
				}

				if (outArgs) outArgs[key] = namedArgs[key];
			}

			if (!validArgs) {
				if (outError) outError.message = "Invalid arguments: " + args;
				return false;
			}

	        return true;
	    },
	    runInstruction: function(instructionName, args) {
	    	var namedArgs = {};
	    	var parsed = this.parseInstruction(instructionName, args, namedArgs, null);
	    	assert(parsed, "Instruction did not parse correctly");

	    	var runMethod = instructions[instructionName].runMethod;
	    	assert(runMethod);
	    	runMethod(namedArgs);
    	}
    };

    return result;
}