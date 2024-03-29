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
 * @param mipsArgs.debug If debug is set to true, the console will print debug statements
 * @return {mipsEmulator}
 * @member mipsEmulator
 */
function MipsEmulator(mipsArgs){
    mipsArgs = mipsArgs || {};
    var ME = this;
    mipsArgs = _.defaults(mipsArgs, {
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
        onStackAdd: function() {

        },
        onHeapChange: function(){

        },
        onHeapAdjustSize: function(){

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
        baseStackAddress: undefined,
        baseHeapAddress: undefined
    });
    var debug = mipsArgs.debug;
    //////////////////////////////////
    // Private Variables / Setup
    //////////////////////////////////

   var stack = new Stack({
        onChange: mipsArgs.onStackChange,
        baseAddress: mipsArgs.baseStackAddress
   });
   var heap = new Heap({
        onChange: mipsArgs.onHeapChange,
        onAdjustSize: mipsArgs.onHeapAdjustSize,
        baseAddress: mipsArgs.baseHeapAddress
   });
   var memory = new BigEndianAccess(
    new CombinedMemory([heap, stack])
   );

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
        '$t8',   '$t9', '$k0', '$k1', '$gp', '$sp', '$fp', '$ra',
        'hi', 'lo'
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
        '$zero', '$at', '$k0', '$k1', '$gp'
    ];
    /**
     * The next line to be fetched
     * @property nextLineToFetch
     * @private
     * @member mipsEmulator
     * @type {Number}
     */
    var nextLineToFetch = 1;
    /**
     * The next line to execute
     * @property nextLineToExecute
     * @private
     * @member mipsEmulator
     * @type {Number}
     */
    var nextLineToExecute = undefined;
    /** The current line being executed
     * This is used for error messages
     * @property currentLine
     * @private
     * @member mipsEmulator
     * @type {Number}
     */
    var currentLine;
    /** Flag for enabling pseudo instructions
     * @property pseudoInstructionsEnabled
     * @private
     * @member mipsEmulator
     * @type {boolean}
     */
    var pseudoInstructionsEnabled = true;
    /** Flag for enabling pipeline emulation
     * 
     * When this is activated, we emulate a pipeline consisting of a
     * fetch and execute stage. The result is that branches are delayed
     * by one instruction.
     * 
     * @property pipelineEmulationEnabled
     * @private
     * @member mipsEmulator
     * @type {boolean}
     */
    var pipelineEmulationEnabled = false;
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
        labels: {},
        /**
         * Hashtable of symbols with constant values
         * @property symbols
         * @member mipsCode
         * @type {number}
         */
        symbols: {}
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
    this.heap = heap,
    this.memory = memory;
    /**
     * Returns a specified registers value
     * @member mipsEmulator
     * @param  {String} reg
     * @return {Number}
     */
    this.getRegisterVal = function(reg) {
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
        var regval = MIPS.signedNumberToUnsignedNumber(this.getRegister(reg).val, this.BITS_PER_REGISTER);
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
        if(!reg)throw new Error("Register must be non empty");
        if (!(reg in registers)) {
            throw new RegisterError('Non existant register: {0}'.format(reg));
        }
        return registers[reg];
    },
    /**
     * Checks if a register exists and can be directly addressed.
     * 
     * Directly addressable registers are those registers that start with '$'.
     * 
     * @member mipsEmulator
     * @param  {String}  reg Name of a register ex: '$ra'
     * @return {Boolean}
     */
    this.isValidRegister = function(reg) {
        return (reg.charAt(0)=='$' && typeof registers[reg] !== "undefined");
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
        var minRegisterValue = MIPS.minSignedValue(this.BITS_PER_REGISTER);
        var maxRegisterValue = MIPS.maxUnsignedValue(this.BITS_PER_REGISTER);
        if (value < minRegisterValue || maxRegisterValue < value) {
            throw new RegisterError('Value out of range: {0}. Must be between {1} and {2}.'.format(value, minRegisterValue, maxRegisterValue));
        }

        enableCallback = enableCallback || true;


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
     * Set which line to fetch next.
     * 
     * This resets the pipeline.
     * 
     * @member mipsEmulator
     * @param {Number} lineNo
     * @return {Number} Returns the number the line was set too.
     */
    this.setNextLineToFetch = function(lineNo){
        var line = mipsCode.code[lineNo];
        if(debug) console.log("setting line: "+ lineNo + " - " + JSON.stringify(line));
        if(!line) return false;
        nextLineToFetch = getFirstActiveLine(lineNo);
        nextLineToExecute = undefined;
        return nextLineToFetch;
    },
    /**
     * Reset emulator
     * @member mipsEmulator
     * @return {null}
     */
    this.reset = function() {
        memory.reset();
        registers.$sp.val = stack.pointerToBottomOfStack();
        /* Restore the contents of the heap */
        heap.adjustSize(mipsCode.data.length);
        let addr = heap.getBaseAddress();
        for (byte of mipsCode.data) {
            heap.setByteAtAddress(addr, byte);
            addr++;
        }
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
        if(debug) console.log("Analyzing...");

        let instructionParser = Parser.instructionParserFromString(mc);
        instructionParser.parseCode();
        mipsCode = {
            code: instructionParser.code,
            data: instructionParser.data,
            symbols: instructionParser.symbols,
            labels: instructionParser.labels
        };
        // Reset to first active line, as the code changed
        this.setNextLineToFetch(1);
        this.reset();
    },
    /**
     * Run an individual line
     * @member mipsEmulator
     * @param  {String} inputLine
     * @return {null}
     */
    this.runLine = function(inputLine) {
        let instructionParser = Parser.instructionParserFromString(inputLine);
        let line = instructionParser.parseLine();
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
        /* Advance the pipeline */
        currentLine = this.getNextLineToExecute();
        nextLineToExecute = nextLineToFetch;
        nextLineToFetch = getFirstActiveLine(nextLineToExecute + 1);
        
        if(debug) console.log("Running line: " + currentLine + " - " + JSON.stringify(mipsCode.code[currentLine]));
        // check if we are finished with the emulation
        if(currentLine > mipsCode.code.length - 1) return finishEmulation();
        if(!mipsCode.code[currentLine]) throw new MipsError("Line " + currentLine + " does not exist");
        if(mipsCode.code[currentLine].error) throw new MipsError(mipsCode.code[currentLine].error.toString());
        assert(!mipsCode.code[currentLine].ignore);
        // we need to check again, because the remainder of the lines could have been comments or blank.


        var ret = {
            lineRan: Number(currentLine)
        };
        /* We pre-set the next line here, so that we do not need to call
         * incrementPC all the time and get more centralized control over
         * execution progress.
         */
        var lineToExecute = mipsCode.code[currentLine];
        runLine(lineToExecute);
        if (!pipelineEmulationEnabled) {
            /* We skip the fetch step if the pipeline is disabled */
            nextLineToExecute = nextLineToFetch;
        }
        ret.nextLine = nextLineToExecute;
        if(nextLineToExecute > mipsCode.code.length - 1) finishEmulation();
        return ret;
    },
    /**
     * Returns the current line number (the next to be run)
     * @member mipsEmulator
     * @return {Number}
     */
    this.getNextLineToExecute = function(){
        return nextLineToExecute || nextLineToFetch;
    },
    /**
     * Returns the next line number to be fetched
     * @member mipsEmulator
     * @return {Number}
     */
    this.getCurrentLine = function(){
        return currentLine;
    },
    /**
     * Jump to a specified label
     * @member mipsEmulator
     * @param  {String} label The label to jump to
     * @return {Number} The line number you jumped to
     */
    this.goToLabel = function(label){
        var line = mipsCode.labels[label];
        if(debug) console.log("Getting label: "+ label + " - " +JSON.stringify(line) );
        if(line){
            return this.goToLine(line);
        } else {
            throw new JumpError('Unknown label: {0}'.format(label));
        }
    }
    /**
     * Jump to a specified line number
     * @member mipsEmulator
     * @param  {String} lineNo The line number to jump to
     * @return {Number} The line number you jumped to
     */
    this.goToLine = function(lineNo) {
        if(debug) console.log("Going to line: "+ line);
        nextLineToFetch = getFirstActiveLine(lineNo);
        return nextLineToFetch;
    }
    this.linkReturnAddress = function(reg) {
        var returnInstruction = (pipelineEmulationEnabled?nextLineToFetch:this.getNextLineToExecute()+1);
        this.setRegisterVal(reg, returnInstruction);

    }
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
    this.setPseudoInstructionsEnabled = function(value) {
        pseudoInstructionsEnabled = value;
    }
    this.setPipelineEmulationEnabled = function(value) {
        pipelineEmulationEnabled = value;
    }

    ////////////////////////////////////////////////
    // Private Methods
    ////////////////////////////////////////////////
    function finishEmulation(){
        ME.running = false;
        mipsArgs.onFinish();
        if(debug) console.log("Emulation finished. Returning to line: " + ME.setNextLineToFetch(1));
        ME.setNextLineToFetch(1);
        return ME.FINISHED_EMULATION;
    };

    /** Determine the first line that is not marked to be ignored
     * @param {Number} lineNo   The starting line number
     * @return {Number}  The first line not marked to be ignored
     *                   at or after the given starting line number
     */
    function getFirstActiveLine(lineNo) {
        while(lineNo <= mipsCode.code.length
            && mipsCode.code[lineNo]
            && mipsCode.code[lineNo].ignore != false)
        {
            if(debug) console.log("ignoring line: " + lineNo);
            lineNo++;
        }
        return lineNo;
    }
    /**
     * Run an individual line
     * @member mipsEmulator
     * @private
     * @return {null}
     */
    function runLine(line) {
        if(debug) console.log("running line: " + JSON.stringify(line));
        if (line.error) {
            throw new MipsError('Error on line: {0}'.format(line.error));
            // TODO: get rid of the other error handler
        }
        if (!line || line.ignore || line.error) {
            if(!line) error("Line is null");
            else error(line.error); // returns error if there is one or null if not.
            return false;
        }
        instruction = instructions[line.instruction];
        assert(instruction);
        if (!pseudoInstructionsEnabled && instruction.pseudoInstruction) {
            throw new MipsError('Pseudo instruction {0} is disabled'.format(line.instruction));
        }
        var runMethod = instruction.runMethod;
        assert(runMethod);
        runMethod(line.args);
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
             * @property {number}
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


    var instructions = mipsInstructionExecutor(ME);

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
}