function mips_emulator(){
    ME = {};
    registers = {};

    readwriteRegs = [
        's0', 's1', 's2', 's3', 's4', 's5', 's6', 's7',
        't0', 't1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9',
        'v0', 'v1',
        'a0', 'a1', 'a2', 'a3'
    ];
    readonlyRegs = [
        'zero', 'at',
        'k0', 'k1',
        'gp', 'sp', 'fp', 'ra'
    ];
    ME.allRegNames = readwriteRegs.concat(readonlyRegs);

    // Initialize the register values
    for (var i = 0; i < ME.allRegNames.length; i++) {
        registers[ME.allRegNames[i]] = {
            val: Math.floor((Math.random()*1000)), // Set the initial register data to garbage
            onChange: null
        };
    };
    registers.zero.val = 0;
    
    ////////////////////////////////////////////////
    // Public Methods
    ////////////////////////////////////////////////

    // Register getters and setters
    // allows us to verify/modify when someone wants to access the regester
    ME.getRegister = function(reg){
        return registers[reg].val;
    };
    ME.setRegister = function(reg, value){
        // TODO: ensure the register name does not exist in readonlyRegs (or better yet, ensure it exists in the readwriteRegs)
        if(registers[reg].onChange) registers[reg].onChange();
        return registers[reg].val = value;
    };

    // Allows you to set a function that is called when this varaible is changed.
    ME.onChange = function(reg, func){
        registers[reg].onChange = func;
    };

    ME.isRegister = function(reg){
        return registers[reg] && typeof(registers[reg]) !== 'undefined';
    };
    // Object that will contain analyzed code information
    var mips_code = {
        code:[null], // Initialize with null in the 0 place, to make line numbers line up.
        labels: {}
    };
    ME.isValidLine = function(line){
        return !(new mips_line(line).error);
    };
    // Set the code that is to be run
    ME.setCode = function(mc){   
        console.log("Analyzing...");
        $.each(mc.split('\n'), function(index, val){
            var line = new mips_line(val);
            console.log(JSON.stringify(line));
            mips_code.code.push(line);
        });
    };
    ME.runLine = function(string) {
        var line = new mips_line(string);
        line.run();
    };

    ////////////////////////////////////////////////
    // Private Methods
    ////////////////////////////////////////////////
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
        'ADD': function(line) {
            //reg[line.rd] = reg[line.rs] + reg[line.rt];
            ME.setRegister(line.rd, ME.getRegister(line.rs) + ME.getRegister(line.rt));
        },
        'ADDI': function(line) {
            //reg[line.rt] = reg[line.rs] + line.imm;
            ME.setRegister(line.rt, ME.getRegister(line.rs) + line.imm);
        }   
    };

    function getRegister(arg) {
        // e.g. getRegister('$t0') -> ME.registers.t0;
        if (isRegister(arg)) {
            return arg.substring(1);//ME.registers[arg.substring(1)];
        }
        return null;
    };
    function getImmediate(arg) {
        if (isImmediate(arg)) {
            return parseInt(arg, 10);
        }
        return null;
    };

    function isRegister(arg) {
        for (var i = 0; i < ME.allRegNames.length; i++) {
            if ('$' + ME.allRegNames[i] === arg) {
                return true;
            }
        }
        return false;
    };
    function isImmediate(arg) {
        return /^[-+]?\d+$/.test(arg);
    };


    // Mips Line Object
    function mips_line(line){
        // Object that will save information about a line of code.

        LINE = {
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
                LINE.label = ar[1];
                // TODO: mips_code.labels[ar[1]] = line;
            }

            // If we got variables back
            if(ar[3]){
                // Split the args by `,`
                LINE.args = ar[3].split(',');

                // Trim the varaibles
                for(var i = 0; i < LINE.args.length; i++){
                   LINE.args[i] = $.trim(LINE.args[i]);
                }
            }

            // The instruction for this code;
            LINE.instruction = $.trim(ar[2]).toUpperCase();

            // If the line has an instruction, we should not ignore it. otherwise it may be a comment or blank
            if(LINE.instruction && LINE.instruction.length > 0) LINE.ignore = false;

            // The comment, obviously
            LINE.comment = $.trim(ar[4]);

            // parse the instruction now, so it can be executed whenever we want
            if (LINE.instruction) {
                // an instruction was found, so try to parse it
                var parseMethod = parseMethods[LINE.instruction];
                if (!parseMethod) {
                    LINE.error = "Error. Unknown instruction: " + LINE.instruction;
                } else if (!parseMethod(LINE)) {
                    LINE.error = "Error. Invalid arguments: " + LINE.args;
                }
            };

        // In the else case, the regex didn't match, possible error?
        } else {
            // TODO: check for special cases
            LINE.error = "Error parsing line: "+ (index+1);
            console.log("----> No matches");
        }

        LINE.run = function() {
            if (LINE.ignore || LINE.error) { return; };
            // we can assume that we parsed successfully at this point.
            runMethods[LINE.instruction](LINE);
        };

        return LINE;
    }

    return ME;
}