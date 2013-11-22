/**
 * @class mips_emulator
 * Mips Emulation engine.
 */
function mips_emulator(mips_args){
    mips_args = mips_args || {};
    mips_args = _.defaults(mips_args, {starting_code: null, debug: false});
    var debug = mips_args.debug
    //////////////////////////////////
    // Private Variables / Setup
    //////////////////////////////////
    var registers = {};

    var readwriteRegs = [
        '$s0', '$s1', '$s2', '$s3', '$s4', '$s5', '$s6', '$s7',
        '$t0', '$t1', '$t2', '$t3', '$t4', '$t5', '$t6', '$t7', '$t8', '$t9',
        '$v0', '$v1',
        '$a0', '$a1', '$a2', '$a3'
    ];
    var readonlyRegs = [
        '$zero', '$at',
        '$k0', '$k1',
        '$gp', '$sp', '$fp', '$ra'
    ];

    // The intial line where we start the emulation.
    var current_line = 0;
    // populate registers with all the read and write registers and set their inital values to random
    for (var i = 0; i < readwriteRegs.length; i++) {
        registers[readwriteRegs[i]] = {
            val: Math.floor((Math.random()*1000)), // Set the initial register data to garbage
            onChange: null,
            writable: true,
            reg_name: readwriteRegs[i]
        };
    };

    // populate registers with all the read and write registers and set their inital values to random
    for (var i = 0; i < readonlyRegs.length; i++) {
        registers[readonlyRegs[i]] = {
            val: Math.floor((Math.random()*1000)), // Set the initial register data to garbage
            writable: false,
            reg_name: readonlyRegs[i]
        };
    };
    registers.zero = {val:0, writable: false, reg_name: '$zero'};

    // Object that will contain analyzed code information
    var mips_code = {
        code:[null], // Initialize with null in the 0 place, to make line numbers line up.
        labels: {}
    };
    // Public methods
    var ME = {
        /**
         * Returns a specified registers value
         * @param  {String} reg
         * @return {String} 
         */
        getRegister: function(reg){
            if(reg.charAt(0) != '$') reg = '$' + reg;
            if(!registers[reg]) return false;
            return registers[reg].val;
        },
        /**
         * Set a register value, and call onChange function for that register
         * @param {String} reg
         * @param {Number} value
         */
        setRegister: function(reg, value){
            if(reg.charAt(0) != '$'){
                console.log("register passed without $, ")
                reg = '$' + reg;

            }
            if(debug) console.log("Setting register " + reg + " to " + value);

            if(!registers[reg]) return false;
            // TODO: ensure the register name does not exist in readonlyRegs (or better yet, ensure it exists in the readwriteRegs)
            if(registers[reg].onChange) registers[reg].onChange();
                registers[reg].val = value;
            if(debug) console.log("----> New value: "+ ME.getRegister(reg));

        },
        /**
         * Set an Onchange function for a register
         * @param  {String} reg
         * @param  {Function} func
         * @return {Null}
         */
        onChange: function(reg, func){
            registers[reg].onChange = func;
        },
        /**
         * Checks if a register is a valid register
         * @param  {String}  reg
         * @return {Boolean}
         */
        isRegister: function(reg){
            return registers[reg] && typeof(registers[reg]) !== 'undefined';
        },
        /**
         * Checks if a string is a valid mips line
         * @param  {String}  line
         * @return {Boolean}
         */
        isValidLine: function(line){
            return !(new mips_line(line).error);
        },
        /**
         * Set code to be emulated
         * @param {String} mc
         */
        setCode: function(mc){   
            console.log("Analyzing...");
            $.each(mc.split('\n'), function(index, val){
                var line = new mips_line(val);
                console.log(JSON.stringify(line));
                mips_code.code.push(line);
            });
        },
        /**
         * Run an individual line
         * @param  {String} input_line 
         * @return {None}
         */
        runLine: function(input_line) {
            var line = new mips_line(input_line);
            runLine(line);
        },
    };


    ////////////////////////////////////////////////
    // Private Methods
    ////////////////////////////////////////////////
    /**
     * Verifies that an operation can use these registers
     * @type {Object}
     */
    var parseMethods = {
        'ADD': function(line) {
            // Grab each register from the registers
            line.rd = registers[line.args[0]];
            line.rs = registers[line.args[1]];
            line.rt = registers[line.args[2]];
            // $rd must be writable
            if(line.rd && !line.rd.writable) line.error = "Register " + line.rd + " is not writable";
            if(line.error) console.warn("Error parsing line: " +line.error +"\n" + JSON.stringify(line));
            return line.error || (line.rd && line.rs && line.rt);
        },
        'ADDI': function(line) {
            line.rt = registers[line.args[0]];
            line.rs = registers[line.args[1]];
            line.imm = getImmediate(line.args[2]);
            return line.rt && line.rs && line.imm;
        }
    };
    /**
     * Run an individual line
     * @return {[type]}
     */
    runLine = function(line) {
        if (line.ignore || line.error) { return line.error; };// returns error if there is one or null if not.
        // we can assume that we parsed successfully at this point.
        runMethods[line.instruction](line);

    };
    // these will be called after the parse method has been called
    // the goal is to make these methods look as close to the MIPS cheat sheet as possible.
    
    /**
     * Collection of methods to run the intended operations.
     * @type {Object}
     */
    var runMethods = {
        'ADD': function(line) {
            //reg[line.rd] = reg[line.rs] + reg[line.rt];
            console.log("running add: " + JSON.stringify(line));
            if(debug) console.log(line.rs.val + " + " + line.rt.val + " = " + (line.rs.val + line.rt.val) + " Saved to: "+ line.rd.reg_name);
            ME.setRegister(line.rd.reg_name, line.rs.val + line.rt.val);
        },
        'ADDI': function(line) {
            //reg[line.rt] = reg[line.rs] + line.imm;
            ME.setRegister(line.rt.reg_name, line.rs.val + line.imm);
        }   
    };

    function getImmediate(arg) {
        if (isImmediate(arg)) {
            return parseInt(arg, 10);
        }
        return null;
    };

    function isImmediate(arg) {
        return /^[-+]?\d+$/.test(arg);
    };


    // Mips Line Object
    function mips_line(line){

        // Object that will save information about a line of code.
        var LINE = {
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
        if(debug) console.log("Finished parsing line: " + JSON.stringify(LINE));
        return LINE;
    }
    // Set the starting code if there was any.
    if(mips_args.starting_code) ME.setCode(mips_args.starting_code);
    return ME;
}