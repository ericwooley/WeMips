function RegisterError(message) {
    this.name = 'Register Error';
    this.message = message;
}
function JumpError(message) {
    this.name = 'Jump Error';
    this.message = message;
}
function MipsError(message) {
    this.name = 'Mips Error';
    this.message = message;
}

/**
 * Mips emulator constructor
 * @param  {Object} mipsArgs Arguments to construct the mips emulater.
 * @param mipsArgs.startingCode Set the default code for this emulator to run.
 * @param mipsArgs.debug If debug is set to true, the console will print debug statements
 * @return {mipsEmulator}
 * @member mipsEmulator
 */
function MipsEmulator(mipsArgs){
    mipsArgs = mipsArgs || {};
    var ME = this;
    mipsArgs = _.defaults(mipsArgs, {
        startingCode: null,
        debug: false,
        onError: function(message, lineNumber){
            alert(message);
            return false;
        },
        onWarning: function(message, lineNumber){
            alert(message);
        },
        onRegisterChange: function(regName, newValue) {

        },
        onFinish: function(){
            if (debug) console.log("Finished running emulation, resetting $sp to line 1");
        },
        onStackChange: function(){

        },
        onOutput: function(message) {
            console.log(message)
        },
        onInput: function(message) {
            assert(false, "Expecting input, but there is no handler.");
        },
        onConfirm: function(message) {
            assert(false, "Expecting confirmation, but there is no handler.");
        },
        onAlert: function(message) {
            assert(false, "Expecting alert to be displayed, but there is no handler.");
        },
        baseStackAddress: undefined
    });
    var debug = mipsArgs.debug;
    //////////////////////////////////
    // Private Variables / Setup
    //////////////////////////////////

   var stack = new Stack({onChange: mipsArgs.onStackChange, baseAddress: mipsArgs.baseStackAddress});

    /**
     * Hash table of registers
     * @property registers
     * @private
     * @member mipsEmulator
     * @type {Object}
     */
    var registers = {};
    /**
     * Array of all registers
     * @property allRegs
     * @private
     * @member mipsEmulator
     * @type {Array}
     */
    var allRegs = [
        '$zero', '$at', '$v0', '$v1', '$a0', '$a1', '$a2', '$a3',
        '$t0',   '$t1', '$t2', '$t3', '$t4', '$t5', '$t6', '$t7',
        '$s0',   '$s1', '$s2', '$s3', '$s4', '$s5', '$s6', '$s7',
        '$t8',   '$t9', '$k0', '$k1', '$gp', '$sp', '$fp', '$ra'
    ];

    var preservedRegs = [ // these are the registers that are preserved across function calls
        '$zero',
        '$s0', '$s1', '$s2', '$s3', '$s4', '$s5', '$s6', '$s7',
        '$gp', '$sp', '$fp', '$ra',
        // TODO: these shouldn't be here but are required right now because of the check of writable (e.g. when setting garbage data)
        '$at', '$k0', '$k1'
    ];

    /**
     * Array of read only registers
     * @property readonlyRegs
     * @private
     * @member mipsEmulator
     * @type {Array}
     */
    var readonlyRegs = [
        '$zero', '$at',
        '$k0', '$k1',
        '$gp', '$ra'
    ];
    // The intial line where we start the emulation.
    /**
     * The current line the mips emulator is looking at.
     * @property currentLine
     * @private
     * @member mipsEmulator
     * @type {Number}
     */
    var currentLine = 1;
    // populate registers with all the read and write registers and set their inital values to random
    for (var i = 0; i < allRegs.length; i++) {
        registers[allRegs[i]] = createRegister(allRegs[i], i);
    };
    registers.$zero.val = 0;
    registers.$sp.val = stack.pointerToBottomOfStack();
    registers.$fp.val = stack.pointerToBottomOfStack();

    // Object that will contain analyzed code information
    /**
     * @class mipsCode
     * @private
     * @member mipsEmulator
     * Object that keeps the code to be executed
     * @type {Object}
     */
    var mipsCode = {
        /**
         * Array of lines that can be exectued
         * @property code
         * @member mipsCode
         * @type {Array}
         */
        code:[null], // Initialize with null in the 0 place, to make line numbers line up.
        /**
         * Hashtable of labels pointing to lines of code
         * @property labels
         * @member mipsCode
         * @type {Object}
         */
        labels: {}
    };

    // Public methods
    /**
     * @class mipsEmulator
     * Mips Emulation engine.
     */    
    this.FINISHED_EMULATION = 'FINISHED_EMULATION',
    this.BYTES_PER_REGISTER = 4,
    this.BITS_PER_REGISTER = 32,
    this.running = false,
    this.stack = stack,
    /**
     * Returns a specified registers value
     * @member mipsEmulator
     * @param  {String} reg
     * @return {Number}
     */
    this.getRegisterVal = function(reg) {
        if(!reg)throw new Error("Register must be non empty");
        if(reg.charAt(0) != '$') reg = '$'+reg;
        var regval = MIPS.unsignedNumberToSignedNumber(this.getRegister(reg).val, this.BITS_PER_REGISTER);
        if(debug) console.log("Getting signed register value: " + regval );
        return regval;
    },
    /**
     * Returns a specified registers unsigned value
     * @member mipsEmulator
     * @param  {String} reg
     * @return {Number}
     */
    this.getRegisterUnsignedVal = function(reg) {
        if(reg.charAt(0) != '$') reg = '$'+reg;
        var regval = MIPS.signedNumberToUnsignedNumber(this.getRegisterVal(reg), this.BITS_PER_REGISTER);
        if(debug) console.log("Getting unsigned register value: " + regval);
        return regval;
    },
    /**
     * Returns a specified register
     * @member mipsEmulator
     * @param  {String} reg
     * @return {Object} register object.
     */
    this.getRegister = function(reg) {
        if(reg.charAt(0) != '$') reg = '$'+reg;
        if(!this.isValidRegister(reg)) throw new RegisterError('Non existant register: {0}'.format(reg));
        return registers[reg];
    },
    /**
     * Checks if a register exists
     * @member mipsEmulator
     * @param  {String}  reg Name of a register ex: '$ra'
     * @return {Boolean}
     */
    this.isValidRegister = function(reg) {
        return typeof registers[reg] !== "undefined";
    },
    /**
     * checks if a register is writable
     * @member mipsEmulator
     * @param  {String}  reg Register name
     * @return {Boolean}
     */
    this.isValidWritableRegister = function(reg) {
        return this.isValidRegister(reg) && this.getRegister(reg).writable === true;
    },
    /**
     * Set a register value, and call onChange function for that register
     * @member mipsEmulator
     * @param {String} reg
     * @param {Number} value
     */
    this.setRegisterVal = function(reg, value, enableCallback) {
        if(debug) console.log("Setting register " + reg + " to " + value);
        if(reg.charAt(0) != '$') reg = '$'+reg; // TODO: I think we should enforce that the reg always has the $ symbol
        var minRegisterValue = MIPS.minSignedValue(this.BITS_PER_REGISTER);
        var maxRegisterValue = MIPS.maxUnsignedValue(this.BITS_PER_REGISTER);
        if (value < minRegisterValue || maxRegisterValue < value) {
            throw new RegisterError('Value out of range: {0}. Must be between {1} and {2}.'.format(value, minRegisterValue, maxRegisterValue));
        }

        enableCallback = enableCallback || true;
        assert(reg[0] === '$');


        var register = registers[reg];
        if(!register) return error("Line " + currentLine + " register: '" + reg + "' does not exist", currentLine);

        if (!register.writable) {
            throw new RegisterError('Register "{0}" is readonly.'.format(reg));
        }

        if(register.onChange && enableCallback) {
            register.onChange();
        }
        register.val = value;
        if(mipsArgs.onRegisterChange && enableCallback) {
            mipsArgs.onRegisterChange(reg, value);
        }
        if(debug) console.log("----> New value: "+ ME.getRegister(reg));
    },
    /**
     * Set an Onchange function for a register
     * @member mipsEmulator
     * @param  {String} reg
     * @param  {Function} func
     * @return {null}
     */
    this.onChange = function(reg, func){
        registers[reg].onChange = func;
    },
    /**
     * Set which line to run next.
     * @member mipsEmulator
     * @param {Number} lineNo
     * @return {Number} Returns the number the line was set too.
     */
    this.setLine = function(lineNo){
        var line = mipsCode.code[lineNo];
        if(debug) console.log("setting line: "+ lineNo + " - " + JSON.stringify(line));
        if(!line) return false;
        currentLine = lineNo;
        if(line.ignore) incrementLine();
        return currentLine;
    },
    /**
     * Checks if a string is a valid mips line
     * @member mipsEmulator
     * @param  {String}  line
     * @return {Boolean}
     */
    this.isValidLine = function(line){
        return !(new mipsLine(line).error);
    },
    /**
     * Resets mips labes, code, and stack
     * @member mipsEmulator
     * @return {null}
     */
    this.reset = function() {
        mipsCode.labels = {};
        mipsCode.code = [null];
        stack.reset();
        registers.$sp.val = stack.pointerToBottomOfStack();
    },
    /**
     * Set the debug option for the mips_emulator
     * @member mipsEmulator
     * @param {Boolean} dbg
     */
    this.setDebug = function(dbg){
        debug = dbg;
    },
    /**
     * Set code to be emulated
     * @member mipsEmulator
     * @param {String} mc
     */
    this.setCode = function(mc){
        ME.reset();
        if(debug) console.log("Analyzing...");

        $.each(mc.split('\n'), function(index, val){
            var line = new mipsLine(val, mipsCode.code.length);
            line.lineNo = mipsCode.code.length; // save the line number
            // if(debug) console.log(JSON.stringify(line));
            mipsCode.code.push(line);
        });
        if(mipsCode.code[currentLine] && mipsCode.code[currentLine].ignore){
            incrementLine();
            if(debug) console.log("First line is to be ignored, first line set to: " + currentLine);
        }
    },
    /**
     * Run an individual line
     * @member mipsEmulator
     * @param  {String} inputLine
     * @return {null}
     */
    this.runLine = function(inputLine) {
        var line = new mipsLine(inputLine);
        // This refers to the private method, private method should probably be renamed.
        runLine(line);
    },
    /**
     * Run an array of lines
     * @member mipsEmulator
     * @param  {Array} lines Array of mips code, one line per index
     * @return {null}
     */
    this.runLines = function(lines) {
        // lines is an array of strings
        lines = lines.join('\n');
        this.setCode(lines);
        this.setLine(1);
        this.run();
    },
    /**
     * runs the current set of code in the mips emulator non-stop;
     * @member mipsEmulator
     * @return {null}
     */
    this.run = function() {
        // run the current set of instructions which were set via setCode
        assert(mipsCode.code !== null, 'Must have already set the code to run.');
        this.running = true;
        while (this.running) {
            this.step();
        }
    },
    /**
     * execute the line PC is pointing to.
     * @member mipsEmulator
     * @return {Object}
     * returns object.lineRan which is the line that was just run
     * and object.nextLine which is the line that is about to be run.
     */
    this.step = function(){
        if(debug) console.log("Running line: " + currentLine + " - " + JSON.stringify(mipsCode.code[currentLine]));
        // check if we are finished with the emulation
        if(currentLine > mipsCode.code.length - 1) return finishEmulation();
        if(!mipsCode.code[currentLine]) throw new MipsError("Line " + currentLine + " does not exist");
        if(mipsCode.code[currentLine].error) throw new MipsError(mipsCode.code[currentLine].error);
        if(mipsCode.code[currentLine].ignore) incrementLine();
        // we need to check again, because the remainder of the lines could have been comments or blank.


        var ret = {
            lineRan: Number(currentLine)
        };
        runLine(mipsCode.code[currentLine]);
        ret.nextLine = currentLine;
        if(currentLine > mipsCode.code.length - 1) finishEmulation();
        return ret;
    },
    /**
     * Returns the current line number (the next to be run)
     * @member mipsEmulator
     * @return {Number}
     */
    this.getLineNumber = function(){
        return currentLine;
    },
    /**
     * Increments the line to be executed until it finds a valid line.
     * @member mipsEmulator
     * @return {null}
     */
    this.incerementPC = function() {
        incrementLine();
    },
    /**
     * Jump to a specified label
     * @member mipsEmulator
     * @param  {String} label The label to jump too
     * @return {Number} The line number you jumped too.
     */
    this.goToLabel = function(label){
        var line = mipsCode.labels[label];
        if(debug) console.log("Getting label: "+ label + " - " +JSON.stringify(line) );
        if(line){
            ME.setLine(line.lineNo);
            return currentLine; // TODO: probably don't need a return value here, instead, listen for an onChangeLineNumber handler
        } else {
            throw new JumpError('Unknown label: {0}'.format(label));
        }
    },
    this.onSetOverflowFlag = function() {}, // e.g. for 8 bit registers signed, 127 + 1 causes an overflow, since we can't store 128, so it wraps around to -128.
    this.onSetCarryFlag = function() {}, // e.g. for 8 bit registers unsigned, 255 + 1 causes a carry flag, since we can't store 256, so it wraps around to 0.
    this.setUnpreservedRegsToGarbage = function() {
        for (var i = 0; i < allRegs.length; i++) {
            var register = this.getRegister(allRegs[i]);
            if (register.preserved) {
                continue;
            }

            this.setRegisterVal(register.regName, getGarbageRegisterData());
        };
    },
    this.output = function(string) {
        mipsArgs.onOutput(string);
    },
    this.getInput = function(message) {
        return mipsArgs.onInput(message);
    },
    this.mipsConfirm = function(message) {
        return mipsArgs.onConfirm(message);
    },
    this.mipsAlert = function(message) {
        mipsArgs.onAlert(message);
    }

    ////////////////////////////////////////////////
    // Private Methods
    ////////////////////////////////////////////////
    function finishEmulation(){
        ME.running = false;
        mipsArgs.onFinish();
        if(debug) console.log("Emulation finished. Returning to line: " + ME.setLine(1));
        ME.setLine(1);
        return ME.FINISHED_EMULATION;
    };

    /**
     * Increments the current line to the next line which is not ignored.
     * @return {null}
     */
    function incrementLine(){
        currentLine++;
        while(mipsCode.code[currentLine]
                && currentLine <= mipsCode.code.length
                && mipsCode.code[currentLine].ignore != false
        ){
            if(debug) console.log("ignoring line: " + currentLine);
            currentLine++;
        }
    }
    /**
     * Run an individual line
     * @member mipsEmulator
     * @private
     * @return {null}
     */
    function runLine(line) {
        if(debug) console.log("running line: " + line.lineNo);
        if (line.error) {
            throw new MipsError('Error on line: {0}'.format(line.error));
            // TODO: get rid of the other error handler
        }
        if (!line || line.ignore || line.error) {
            if(!line) error("Line is null");
            else error(line.error, currentLine); // returns error if there is one or null if not.
            incrementLine();
            return false;
        }
        // we can assume that we parsed successfully at this point.
        instructionExecutor.runInstruction(line.instruction, line.args);
    };

    function getGarbageRegisterData() {
        return Math.floor((Math.random()*1000));
    }
    /**
     * Create a default register
     * @member mipsEmulator
     * @private
     * @param  {Object} reg
     * @return {register}
     */
    function createRegister(regName, regNumber){
        /**
         * @class register
         * contains register information.
         */
        return {
            /**
             * registers value
             * @property
             * @type {Number}
             */
            val: getGarbageRegisterData(),
            /**
             * Function that is called when this register is changed.
             * @type {Function}
             */
            onChange: null,
            /**
             * Wether or not this register is writable (false if this register is read only)
             * @type {Boolean}
             */
            writable: readonlyRegs.indexOf(regName) === -1,
            /**
             * This registers name
             * @type {String}
             */
            regName: regName,
            regNumber: regNumber,
            preserved: preservedRegs.indexOf(regName) > -1
        };
    };
    // these will be called after the parse method has been called
    // the goal is to make these methods look as close to the MIPS cheat sheet as possible.


    var instructionExecutor = mipsInstructionExecutor(ME);

    /**
     * If the user defined an anError message, use that, if not, alert the message
     * @param  {String} message
     * @param  {Number} lineNo
     * @return {null}
     */
    function error(message, lineNo){
        if(debug) console.error("Error being sent");
        if(debug) console.error("--->" + message);
        lineNo = lineNo || currentLine;
        mipsArgs.onError(message, lineNo);
    }

    /**
     * Turns a string into a mips line object which contains a mips line of code and metadata needed to run it
     * @member mipsEmulator
     * @private
     * @param  {String} line
     * @return {Object}
     */
    function mipsLine(line, lineNo){
        lineNo = lineNo || null

        // Object that will save information about a line of code.
        /**
         * @class line
         * Contains information about a single line of mips code
         * @member mipsEmulator
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
            lineNo: lineNo,
            text: line
        };


        //console.log("--> "+val);
        var regex = /^\s*(?:(\w+)\s*:\s*)?(?:(\w+)(?:\s+([^#]+))?)?(?:#\s*(.*))?$/;
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
                mipsCode.labels[LINE.label] = LINE;
                // TODO: mipsCode.labels[ar[1]] = line;
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
                    LINE.error = error.message;
                }
            };

        // In the else case, the regex didn't match, possible error?
        } else {
            // TODO: check for special cases
            if(debug) console.log("----> No matches");
            LINE.error = "Error parsing line: "+ (lineNo+1);
        }
        if(debug) console.log("Finished parsing line: " + JSON.stringify(LINE));

        return LINE;
    }

    // Set the starting code if there was any.
    if(mipsArgs.startingCode) ME.setCode(mipsArgs.startingCode);
    return this;
}