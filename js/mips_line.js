var parseMethods = {
	'ADD': function(line) {
		line.rd = getRegister(line.args[0]);
		line.rs = getRegister(line.args[1]);
		line.rt = getRegister(line.args[2]);
		return line.rd && line.rs && line.rt;
	},
	'ADDI': function(line) {
		line.rt = getRegister(line.args[0]);
		line.rs = getRegister(line.args[1]);
		line.imm = getImmediate(line.args[2]);
		return line.rt && line.rs && line.imm;
	},
};

// these will be called after the parse method has been called
// the goal is to make these methods look as close to the MIPS cheat sheet as possible.
var runMethods = {
	'ADD': function(line, reg) {
		reg[line.rd] = reg[line.rs] + reg[line.rt];
	},
	'ADDI': function(line, reg) {
		reg[line.rt] = reg[line.rs] + line.imm;
	}	
};

function getRegister(arg) {
	// e.g. getRegister('$t0') -> ME.registers.t0;
	if (isRegister(arg)) {
		return arg.substring(1);//ME.registers[arg.substring(1)];
	}
	return null;
}
function getImmediate(arg) {
	if (isImmediate(arg)) {
		return parseInt(arg, 10);
	}
	return null;
}

function isRegister(arg) {
	for (var registerName in ME.registers) {
	    // important check that this is objects own property 
	    // not from prototype prop inherited
	    if (!ME.registers.hasOwnProperty(registerName)) continue;
	    if ('$' + registerName === arg) {
	    	return true;
	    }
	}
	return false;
}
function isImmediate(arg) {
	return /^[-+]?\d+$/.test(arg);
}

function mips_line(line){
	// Object that will save information about a line of code.

	ret = {
		args: [],
		instruction: null, 
		ignore: true, 
		comment: '', 
		label: null, 
		error: null
	};


    //console.log("--> "+val);
    var regex = /^\s*(?:(\w+)\s*:\s*)?(?:(\w+)\s+([^#]+))?(?:#\s*(.*))?$/;
    var ar = line.match(regex);
    // when matched the array contains the following
    // ----> [0] The entire line
    // ----> [1] The label without the ':'
    // ----> [2] The instruction (e.g. 'ADD', 'LW', etc.)
    // ----> [3] The arguments (e.g. '$rd, $rs, $rt'), this should be trimmed
    // ----> [4] The comment without the '#', this should be trimmed
    // if ar is null, that means the regex didn't match

    if(ar){
        // if we have a label, save it to the hashtable and save it to line
        if(ar[1] && ar[1].length > 0){
            ret.label = ar[1];
            // TODO: mips_code.labels[ar[1]] = line;
        }

        // If we got variables back
        if(ar[3]){
            // Split the args by `,`
            ret.args = ar[3].split(',');

            // Trim the varaibles
            for(var i = 0; i < ret.args.length; i++){
               ret.args[i] = $.trim(ret.args[i]);
            }
        }

        // The instruction for this code;
        ret.instruction = $.trim(ar[2]).toUpperCase();

        // If the line has an instruction, we should not ignore it. otherwise it may be a comment or blank
        if(ret.instruction && ret.instruction.length > 0) ret.ignore = false;

        // The comment, obviously
        ret.comment = $.trim(ar[4]);

        // parse the instruction now, so it can be executed whenever we want
        if (ret.instruction) {
        	// an instruction was found, so try to parse it
		    var parseMethod = parseMethods[ret.instruction];
		    if (!parseMethod) {
		    	ret.error = "Error. Unknown instruction: " + ret.instruction;
		    } else if (!parseMethod(ret)) {
		    	ret.error = "Error. Invalid arguments: " + ret.args;
		    }
        };

    // In the else case, the regex didn't match, possible error?
    } else {
        // TODO: check for special cases
        ret.error = "Error parsing line: "+ (index+1);
        console.log("----> No matches");
    }

    ret.run = function() {
    	if (ret.ignore || ret.error) { return; };
    	// we can assume that we parsed successfully at this point.
    	runMethods[ret.instruction](ret, ME.registers);
    };

	return ret;
}