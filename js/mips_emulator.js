/**
 * Mips emulator constructor
 * @param  {Object} mips_args Arguments to construct the mips emulater.
 * @param mips_args.starting_code Set the default code for this emulator to run.
 * @param mips_args.debug If debug is set to true, the console will print debug statements
 * @return {mips_emulator}
 * @member mips_emulator
 */
function mips_emulator(mips_args){
    mips_args = mips_args || {};
    mips_args = _.defaults(mips_args, {starting_code: null, debug: false});
    var debug = mips_args.debug
    //////////////////////////////////
    // Private Variables / Setup
    //////////////////////////////////
    
    /**
     * Hash table of registers
     * @property registers
     * @private
     * @member mips_emulator
     * @type {Object}
     */
    var registers = {};
    /**
     * Array of read/write registers
     * @property readwriteRegs
     * @private
     * @member mips_emulator
     * @type {Array}
     */
    var readwriteRegs = [
        '$s0', '$s1', '$s2', '$s3', '$s4', '$s5', '$s6', '$s7',
        '$t0', '$t1', '$t2', '$t3', '$t4', '$t5', '$t6', '$t7', '$t8', '$t9',
        '$v0', '$v1',
        '$a0', '$a1', '$a2', '$a3'
    ];

    /**
     * Array of read only registers
     * @property readonlyRegs
     * @private
     * @member mips_emulator
     * @type {Array}
     */
    var readonlyRegs = [
        '$zero', '$at',
        '$k0', '$k1',
        '$gp', '$sp', '$fp', '$ra'
    ];
    // The intial line where we start the emulation.
    /**
     * The current line the mips emulator is looking at.
     * @property current_line
     * @private
     * @member mips_emulator
     * @type {Number}
     */
    var current_line = 0;
    // populate registers with all the read and write registers and set their inital values to random
    for (var i = 0; i < readwriteRegs.length; i++) {
        registers[readwriteRegs[i]] = create_register({
            writable: true,
            reg_name:readwriteRegs[i] 
        });
    };

    // populate registers with all the read and write registers and set their inital values to random
    for (var i = 0; i < readonlyRegs.length; i++) {
        registers[readonlyRegs[i]] = create_register({
            writable: false,
            reg_name: readonlyRegs[i]
        });
    };
    registers.zero = create_register({val:0, writable: false, reg_name: '$zero'});

    // Object that will contain analyzed code information
    /**
     * @class mips_code
     * @private
     * @member mips_emulator
     * Object that keeps the code to be executed
     * @type {Object}
     */
    var mips_code = {
        /**
         * Array of lines that can be exectued
         * @property code
         * @member mips_code
         * @type {Array}
         */
        code:[null], // Initialize with null in the 0 place, to make line numbers line up.
        /**
         * Hashtable of labels pointing to lines of code
         * @property labels
         * @member mips_code
         * @type {Object}
         */
        labels: {}
    };
    // Public methods
    /**
     * @class mips_emulator
     * Mips Emulation engine.
     */
    var ME = {
        /**
         * Returns a specified registers value
         * @param  {String} reg
         * @return {String} 
         */
        getRegister: function(reg){
            if(reg.charAt(0) != '$') reg = '$' + reg;
            if(!registers[reg]) return false;
            if(!registers[reg].val)
            return registers[reg].val;
        },
        /**
         * Set a register value, and call onChange function for that register
         * @param {String} reg
         * @param {Number} value
         */
        setRegister: function(reg, value){
            if(reg.charAt(0) != '$'){
                if(debug) console.log("register passed without $, ")
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
         * @return {null}
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
         * @return {null}
         */
        runLine: function(input_line) {
            var line = new mips_line(input_line);
            run_line(line);
        },
    };


    ////////////////////////////////////////////////
    // Private Methods
    ////////////////////////////////////////////////
    /**
     * Verifies that an operation can use these registers
     * @member mips_emulator
     * @private
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
     * @member mips_emulator
     * @private
     * @return {null}
     */
    function run_line(line) {
        if (line.ignore || line.error) { return line.error; };// returns error if there is one or null if not.
        // we can assume that we parsed successfully at this point.
        runMethods[line.instruction](line);

    };

    /**
     * Create a default register
     * @member mips_emulator
     * @private
     * @param  {Object} reg
     * @return {register}
     */
    function create_register(reg){
        /**
         * @class register
         * contains register information.
         */
        var register = {
            /**
             * registers value
             * @property
             * @type {Number}
             */
            val: Math.floor((Math.random()*1000)), // Set the initial register data to garbage
            /**
             * Function that is called when this register is changed.
             * @type {Function}
             */
            onChange: null,
            /**
             * Wether or not this register is writable (false if this register is read only)
             * @type {Boolean}
             */
            writable: true,
            /**
             * This registers name
             * @type {String}
             */
            reg_name: null
        };
        _.defaults(reg, register);
        return reg;
    };
    // these will be called after the parse method has been called
    // the goal is to make these methods look as close to the MIPS cheat sheet as possible.
    
    /**
     * Collection of methods to run the intended operations.
     * @member mips_emulator
     * @private
     * @type {Object}
     */
    var runMethods = {
        'ADD': function(line) {
            //reg[line.rd] = reg[line.rs] + reg[line.rt];
            if(debug) console.log("running add: " + JSON.stringify(line));
            if(debug) console.log(line.rs.val + " + " + line.rt.val + " = " + (line.rs.val + line.rt.val) + " Saved to: "+ line.rd.reg_name);
            ME.setRegister(line.rd.reg_name, line.rs.val + line.rt.val);
        },
        'ADDI': function(line) {
            //reg[line.rt] = reg[line.rs] + line.imm;
            ME.setRegister(line.rt.reg_name, line.rs.val + line.imm);
        }   
    };
    /**
     * check if argument is an immediate, parse, and return the results.
     * @member mips_emulator
     * @private
     * @param  {String} arg
     * @return {Number}
     */
    function getImmediate(arg) {
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
        return /^[-+]?\d+$/.test(arg);
    };


    /**
     * Turns a string into a mips line object which contains a mips line of code and metadata needed to run it
     * @member mips_emulator
     * @private
     * @param  {String} line
     * @return {Object}
     */
    function mips_line(line){

        // Object that will save information about a line of code.
        /**
         * @class line
         * Contains information about a single line of mips code
         * @member mips_emulator
         * @private
         */
        var LINE = {
            /**
             * Arguments for this line of code ex: [$t0, $s0, $zero]
             * @property
             * @type {Array}
             */
            args: [],
            /**
             * The lines instruction ex: ADD
             * @type {String}
             */
            instruction: null,
            /** 
             * flag to indicate weather this line should be ignored (not run).
             * @type {Boolean}
             */
            ignore: true, 
            /**
             * The comment (if any) that this line of code contained
             * @type {String}
             */
            comment: '', 
            /**
             * The label for this line of code
             * @type {String}
             */
            label: '', 
            /**
             * Error when running this line of code (if any)
             * @type {String}
             */
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