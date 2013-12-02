function mipsInstructionExecutor(ME) {
	var instructions = {
        /////////////////////////////////////////////
        // Mips Arithmetic Instructions
        /////////////////////////////////////////////
        'ADD': {
            parseMethod: parse_$RD_$rs_$rt,
            runMethod: function(namedArgs) {
            	ME.setRegisterVal(namedArgs.$rd, ME.getRegisterVal(namedArgs.$rs) + ME.getRegisterVal(namedArgs.$rt));
            	ME.incerementPC();
            }
        },
        'ADDI': {
            parseMethod: parse_$RT_$rs_imm,
            runMethod: function(namedArgs) {
            	ME.setRegisterVal(namedArgs.$rt, ME.getRegisterVal(namedArgs.$rs) + namedArgs.imm);
            	ME.incerementPC();
            }
        },
        'ADDU': {
            parseMethod: parse_$RD_$rs_$rt,
            runMethod: null
        },
        'ADDIU': {
            parseMethod: parse_$RT_$rs_imm,
            runMethod: null
        },
        'SUB': {
            parseMethod: parse_$RD_$rs_$rt,
            runMethod: null
        },
        'SUBU': {
            parseMethod: parse_$RD_$rs_$rt,
            runMethod: null
        },
        'LUI': {
            parseMethod: parse_$RT_imm,
            runMethod: null
        },
        /////////////////////////////////////////////
        // Mips Logical Instructions
        /////////////////////////////////////////////
        'AND': {
            parseMethod: parse_$RD_$rs_$rt,
            runMethod: null
        },
        'ANDI': {
            parseMethod: parse_$RT_$rs_imm,
            runMethod: null
        },
        'NOR': {
            parseMethod: parse_$RD_$rs_$rt,
            runMethod: null
        },
        'OR': {
            parseMethod: parse_$RD_$rs_$rt,
            runMethod: null
        },
        'ORI': {
            parseMethod: parse_$RT_$rs_imm,
            runMethod: null
        },
        'SLL': {
            parseMethod: parse_$RD_$rt_shamt,
            runMethod: null
        },
        'SRL': {
            parseMethod: parse_$RD_$rt_shamt,
            runMethod: null
        },
        /////////////////////////////////////////////
        // Mips Branch and Jump Instructions
        /////////////////////////////////////////////
        'BEQ': {
            parseMethod: parse_$rs_$rt_label,
            runMethod: null
        },
        'BNE': {
            parseMethod: parse_$rs_$rt_label,
            runMethod: null
        },
        'J': {
            parseMethod: parse_label,
            runMethod: function(namedArgs){
                ME.goToLabel(namedArgs.label);
            }
        },
        'JAL': {
            parseMethod: parse_label,
            runMethod: null
        },
        'JR': {
            parseMethod: parse_$rs,
            runMethod: null
        },
        /////////////////////////////////////////////
        // Mips Memory Access Instructions
        /////////////////////////////////////////////
        'LW': {
            parseMethod: parse_$RT_imm_$rs,
            runMethod: null
        },
        'SW': {
            parseMethod: parse_$rt_imm_$rs,
            runMethod: null
        },
        'LH': {
            parseMethod: parse_$RT_imm_$rs,
            runMethod: null
        },
        'LHU': {
            parseMethod: parse_$RT_imm_$rs,
            runMethod: null
        },
        'SH': {
            parseMethod: parse_$rt_imm_$rs,
            runMethod: null
        },
        'LB': {
            parseMethod: parse_$RT_imm_$rs,
            runMethod: function(namedArgs) {
            	ME.setRegisterVal(namedArgs.$rt, ME.stack.getByte(ME.getRegisterVal(namedArgs.$rs) + namedArgs.imm));
            	ME.incerementPC();
            }
        },
        'LBU': {
            parseMethod: parse_$RT_imm_$rs,
            runMethod: function(namedArgs) {
            	ME.setRegisterVal(namedArgs.$rt, ME.stack.getUnsignedByte(ME.getRegisterVal(namedArgs.$rs) + namedArgs.imm));
            	ME.incerementPC();
            }
        },
        'SB': {
            parseMethod: parse_$rt_imm_$rs,
            runMethod: function(namedArgs) {
            	ME.stack.setByte(ME.getRegisterVal(namedArgs.$rs) + namedArgs.imm, ME.getRegisterVal(namedArgs.$rt));
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
    function parse_$RT_$rs_imm(args) {
    	return {
    		'expectedArgCount': 3,
    		'$rt': parseWritableRegister(args[0]),
    		'$rs': parseRegister(args[1]),
    		'imm': parseImmediate(args[2])
    	};
    }
    function parse_$RT_imm(args){
    	return {
    		'expectedArgCount': 2,
    		'$rt': parseWritableRegister(args[0]),
    		'imm': parseImmediate(args[1])
    	};
    };
    function parse_$RD_$rt_shamt(args){
    	return {
    		'expectedArgCount': 3,
    		'$rd': parseWritableRegister(args[0]),
    		'$rt': parseRegister(args[1]),
    		'shamt': parseImmediate(args[2])
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
    		'imm': parseImmediate(immediateAndRegister.imm),
    		'$rs': parseRegister(immediateAndRegister.$rs)
    	};
    };
    function parse_$rt_imm_$rs(args){
    	var immediateAndRegister = parseImmAnd$rs(args[1]);
    	return {
    		'expectedArgCount': 2,
    		'$rt': parseRegister(args[0]),
    		'imm': parseImmediate(immediateAndRegister.imm),
    		'$rs': parseRegister(immediateAndRegister.$rs)
    	};
    };

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
    /**
     * check if argument is an immediate, parse, and return the results.
     * @member mips_emulator
     * @private
     * @param  {String} arg
     * @return {Number}
     */
    function parseImmediate(arg) {
        if (isImmediate(arg)) {
            return parseInt(arg, 10);
        }
        return null;
    };
    /**
     * Checks if a string matches as a number
     * @member mips_emulator
     * @private
     * @param  {String}  arg
     * @return {Boolean}
     */
    function isImmediate(arg) {
        return /^([-+]\s*)?\d+$/.test(arg);
    };


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
	            if (outError) outError.message = "Incorrect number of arguments {0}, should be {1}.".format(args.length, namedArgs['expectedArgCount']);
	            return false;
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