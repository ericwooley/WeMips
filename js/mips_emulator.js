function RegisterError(message) {
    this.name = 'Register Error';
    this.message = message;
}

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
    mips_args = _.defaults(mips_args, {
        starting_code: null,
        debug: false,
        onError: function(message, line_number){
            alert(message);
            return false;
        },
        onWarning: function(message, line_number){
            alert(message);
        },
        onRegisterChange: function(reg_name, new_value) {

        },
        onFinish: function(){
            alert("Finished running emulation, resetting $sp to line 1");
        }
    });
    var debug = mips_args.debug
    //////////////////////////////////
    // Private Variables / Setup
    //////////////////////////////////

   var stack = new Stack();

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
        '$a0', '$a1', '$a2', '$a3',
        '$sp'
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
        '$gp', '$fp', '$ra'
    ];
    // The intial line where we start the emulation.
    /**
     * The current line the mips emulator is looking at.
     * @property current_line
     * @private
     * @member mips_emulator
     * @type {Number}
     */
    var current_line = 1;
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
    registers.$zero.val = 0;
    registers.$sp.val = stack.pointerToBottomOfStack();

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
         * @member mips_emulator
         * @param  {String} reg
         * @return {String}
         */
        stack: stack,
        getRegisterVal: function(reg) {
            assert(reg[0] === '$');
            return this.getRegister(reg).val;
        },
        getRegister: function(reg) {
            assert(reg[0] === '$');
            if(!this.isValidRegister(reg)) throw new RegisterError('Non existant register: {0}'.format(reg));
            return registers[reg];
        },
        isValidRegister: function(reg) {
            return typeof registers[reg] !== "undefined";
        },
        isValidWritableRegister: function(reg) {
            return this.isValidRegister(reg) && this.getRegister(reg).writable === true;
        },
        /**
         * Set a register value, and call onChange function for that register
         * @member mips_emulator
         * @param {String} reg
         * @param {Number} value
         */
        setRegisterVal: function(reg, value, enable_callback){
            enable_callback = enable_callback || true;
            assert(reg[0] === '$');
            if(debug) console.log("Setting register " + reg + " to " + value);

            if(!registers[reg]) return error("Line " + current_line + " register: '" + reg + "' does not exist", current_line);
            // TODO: ensure the register name does not exist in readonlyRegs (or better yet, ensure it exists in the readwriteRegs)
            if(registers[reg].onChange && enable_callback) registers[reg].onChange();
                registers[reg].val = value;
            if(mips_args.onRegisterChange && enable_callback)
                mips_args.onRegisterChange(reg, value);
            if(debug) console.log("----> New value: "+ ME.getRegister(reg));

        },
        /**
         * Set an Onchange function for a register
         * @member mips_emulator
         * @param  {String} reg
         * @param  {Function} func
         * @return {null}
         */
        onChange: function(reg, func){
            registers[reg].onChange = func;
        },
        /**
         * Set which line to run next.
         * @member mips_emulator
         * @param {Number} line_no
         * @return {Number} Returns the number the line was set too.
         */
        setLine: function(line_no){
            var line = mips_code.code[line_no];
            if(debug) console.log("setting line: "+ line_no + " - " + JSON.stringify(line));
            if(!line) return false;
            current_line = line_no;
            if(line.ignore) increment_line();
            return current_line;
        },
        /**
         * Checks if a string is a valid mips line
         * @member mips_emulator
         * @param  {String}  line
         * @return {Boolean}
         */
        isValidLine: function(line){
            return !(new mips_line(line).error);
        },
        /**
         * Set code to be emulated
         * @member mips_emulator
         * @param {String} mc
         */
        setCode: function(mc){
            if(debug) console.log("Analyzing...");
            mips_code.code = [null];
            current_line = 1;
            $.each(mc.split('\n'), function(index, val){
                var line = new mips_line(val, mips_code.code.length);
                line.line_no = mips_code.code.length; // save the line number
                // if(debug) console.log(JSON.stringify(line));
                mips_code.code.push(line);
            });
            if(mips_code.code[current_line] && mips_code.code[current_line].ignore){
                increment_line();
                if(debug) console.log("First line is to be ignored, first line set to: " + current_line);
            }
        },
        /**
         * Run an individual line
         * @member mips_emulator
         * @param  {String} input_line
         * @return {null}
         */
        runLine: function(input_line) {
            var line = new mips_line(input_line);
            run_line(line);
        },
        /**
         * execute the line $sp is pointing at.
         * @member mips_emulator
         * @return {Object}
         * returns object.line_ran which is the line that was just run
         * and object.next_line which is the line that is about to be run.
         */
        step: function(){
            // check if we are finished with the emulation
            if(current_line > mips_code.code.length - 1) return finish_emulation();
            if(!mips_code.code[current_line]) return error("Line " + current_line + " could not be read", current_line);
            if(mips_code.code[current_line].ignore) increment_line();
            // we need to check again, because the remainder of the lines could have been comments or blank.
            if(current_line > mips_code.code.length - 1) return finish_emulation();
            if(debug) console.log("Running line: " + current_line + " - " + mips_code.code[current_line]);
            var ret = {
                line_ran: Number(current_line)
            };

            run_line(mips_code.code[current_line]);
            ret.next_line = current_line;

            return ret;
        },
        /**
         * Returns the current line number (the next to be run)
         * @return {Number}
         */
        get_line_number: function(){
            return current_line;
        },
        incerementPC: function() {
            increment_line();
        }
    };


    ////////////////////////////////////////////////
    // Private Methods
    ////////////////////////////////////////////////
    function finish_emulation(){
        mips_args.onFinish();
        if(debug) console.log("Emulation finished. Returning to line: " + ME.setLine(1));
        else ME.setLine(1);
    };
    function check_reg_plus_imm(test_string){
        return test_string.search(/^\s*\d+\s?\(\s*\$[a-zA-Z]+\d*\s*\)/g) >= 0;
    };

    /**
     * Increments the current line to the next line which is not ignored.
     * @return {null}
     */
    function increment_line(){
        current_line++;
        while(mips_code.code[current_line]
                && current_line <= mips_code.code.length
                && mips_code.code[current_line].ignore != false
        ){
            if(debug) console.log("ignoring line: " + current_line);
            current_line++;
        }
    }
    /**
     * Run an individual line
     * @member mips_emulator
     * @private
     * @return {null}
     */
    function run_line(line) {
        if (!line || line.ignore || line.error) {
            if(!line) error("Line is null");
            else error(line.error, current_line); // returns error if there is one or null if not.
            increment_line();
            return false;
        }
        // we can assume that we parsed successfully at this point.
        instructionExecutor.runInstruction(line.instruction, line.args);
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


    var instructionExecutor = mipsInstructionExecutor(ME);

    /**
     * If the user defined an an_error message, use that, if not, alert the message
     * @param  {String} message
     * @param  {Number} line_no
     * @return {null}
     */
    function error(message, line_no){
        if(debug) console.error("Error being sent");
        if(debug) console.error("--->" + message);
        line_no = line_no || current_line;
        mips_args.onError(message, line_no);
    }

    /**
     * Turns a string into a mips line object which contains a mips line of code and metadata needed to run it
     * @member mips_emulator
     * @private
     * @param  {String} line
     * @return {Object}
     */
    function mips_line(line, line_no){
        line_no = line_no || null

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
            error: null,
            line_no: line_no
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
                var error = {};
                if (!instructionExecutor.parseInstruction(LINE.instruction, LINE.args, null, error)) {
                    LINE.error = "Error: " + line.line_no + " " + error.message;
                }
            };

        // In the else case, the regex didn't match, possible error?
        } else {
            // TODO: check for special cases
            LINE.error = "Error parsing line: "+ (index+1);
            if(debug) console.log("----> No matches");
        }
        //if(debug) console.log("Finished parsing line: " + JSON.stringify(LINE));
        return LINE;
    }

    // Set the starting code if there was any.
    if(mips_args.starting_code) ME.setCode(mips_args.starting_code);
    return ME;
}