function StackError(message) {
    this.name = StackError.exceptionName();
    this.message = message;
}
StackError.exceptionName = function() {
    return 'Stack Error';
}
StackError.prototype.toString = function() {
    return '{0}: {1}'.format(StackError.exceptionName(), this.message);
}
/**
 * @class Stack
 * @param {Object} options constructor options
 * - options.onChange A function to be called when a stack address changes.
 * - options.baseAddress The default base address.
 */
function Stack(options) {
    var BITS_PER_REGISTER = 32; // TODO: get this from somewhere else?
    var MIN_STACK_ADDRESS = MIPS.minUnsignedValue(BITS_PER_REGISTER);
    var MAX_STACK_ADDRESS = MIPS.maxUnsignedValue(BITS_PER_REGISTER - 1); // TODO: shouldn't need minus 1

    // Returns a random integer between min and max
    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    }

    options = options || {};
    _.defaults(options, {
        /**
         * Function to call when the stack changes. (e.g. onChange(indexNumber))
         * @member Stack
         * @type {Function}
         */
        onChange: null,
        /**
         * Function to call when the stack gets new elements. (e.g. onAdd(indexNumber))
         * @member Stack
         * @type {Function}
         */
        onAdd: null,
        baseAddress: getRandomInt(50000, MAX_STACK_ADDRESS)
    });
    assert(MIN_STACK_ADDRESS <= options.baseAddress && options.baseAddress <= MAX_STACK_ADDRESS, "Stack addresses must be able to be stored in a register, thus they cannot exceed the register bounds.");

    // Private memebers

    var that = this; // see http://javascript.crockford.com/private.html

    // The stack will be implemented as a single array where each
    // element will store a single byte (e.g. a number between 0 and 255).
    var data = [];

    function getByteAtAddress(address) {
        return data[indexForAddress(address)];
    }
    function setByteAtAddress(address, byte) {
        assert(typeof byte === "number");
        assert(0 <= byte && byte <= 255);
        data[indexForAddress(address)] = byte;
        if (options.onChange) options.onChange(address, byte);
    }
    function indexForAddress(address) {
        // get the index into the data array which corresponds to a specific address
        assert(typeof address == "number");
        var minValidAddress = 0;
        var maxValidAddress = that.pointerToBottomOfStack() - 1;
        if (address < minValidAddress || maxValidAddress < address) {
            throw new StackError('Invalid stack address ({0}). Valid stack addresses are between {1} and {2}.'.format(address, minValidAddress, maxValidAddress));
        }

        // Conversion to index:
        // 1. Assume a base address of 100.
        // 2. The first accessible address is 99, which will be stored in 0.
        // 3. The next accessible address is 98, which will be stored in 1.
        var index = (options.baseAddress - 1) - address;

        // ensure this index is accessible
        var numElementsToAdd = index - data.length + 1;
        for (var i = 0; i < numElementsToAdd; i++) {
            var randomNumFrom0to255 = Math.floor((Math.random()*256));
            data.push(randomNumFrom0to255);
            if (options.onAdd) options.onAdd(data.length - 1);
        }
        return index;
    }

    // Public variables

    this.MIN_BYTE_VALUE = 0;
    this.MAX_BYTE_VALUE = 255;
    this.BITS_PER_BYTE = 8;
    this.BYTES_PER_BYTE = 1;
    this.BYTES_PER_HALFWORD = 2;
    this.BYTES_PER_WORD = 4;

    // Privileged methods
    /**
     * Get a given number of bytes at an address
     * @param  {Number} address    The starting address for your data
     * @param  {Number} byteCount  How many bytes of data you want returned
     * @param  {Boolean} asUnsigned True if you want the number returned without a sign extension.
     * @return {Number}
     */
    this.getDataAtAddress = function (address, byteCount, asUnsigned) {
        asUnsigned = asUnsigned || false;
        var result = 0;
        for (var i = 0; i < byteCount; i++) {
            var value = getByteAtAddress(address + i);
            assert(this.MIN_BYTE_VALUE <= value && value <= this.MAX_BYTE_VALUE);
            result = result << this.BITS_PER_BYTE;
            result += value;
        };
        if (asUnsigned) {
            return result;
        } else {
            return MIPS.unsignedNumberToSignedNumber(result, byteCount * this.BITS_PER_BYTE);
        }
    };
    /**
     * Set data at an address
     * @param {Number} address   The address you want to write
     * @param {Number} byteCount How many bytes you want to overwrite
     * @param {Number} data      Number you want to set there.
     */
    this.setDataAtAddress = function(address, byteCount, data) {
        assert(typeof data === "number", "Only numbers supported.");
        var bitCount = byteCount * this.BITS_PER_BYTE;
        if (data < 0) {
            // convert negative value to positive one
            try {
                data = MIPS.signedNumberToUnsignedNumber(data, bitCount);
            } catch (e) {
                if (e instanceof MipsError) {
                    throw new StackError(e.message);
                } else {
                    throw e;
                }
            }
        }

        var minValidValue = MIPS.minUnsignedValue(BITS_PER_REGISTER);
        var maxValidValue = MIPS.maxUnsignedValue(BITS_PER_REGISTER);
        if (data < minValidValue || maxValidValue < data) {
            throw new StackError('Unable to store out-of-range value ({0}). Valid values are {1} through {2}.'.format(data, minValidValue, maxValidValue));
        };

        // preserve only the lower N bytes
        assert(0 <= bitCount && bitCount <= 32, "The & operator will only work for up to 32 bits.");
        data = data & (Math.pow(2, bitCount)-1);
        minValidValue = 0;
        maxValidValue = (Math.pow(2, bitCount) - 1);
        assert(minValidValue <= data && data <= maxValidValue, "Ensure the above chopping math was performed correctly.");

        for (var i = byteCount - 1; i >= 0; i--) {
            var rightMostByte = data & this.MAX_BYTE_VALUE;
            setByteAtAddress(address + i, rightMostByte);
            data = data >> this.BITS_PER_BYTE;
        };
    };
    /**
     * Clear the data contained in the stack
     * @return {null}
     */
    this.reset = function() {
        data = [];
    };
    /**
     * Get a pointer to the address at the bottom of the stack
     * @return {Number} Address to the bottom of the stack
     */
    this.pointerToBottomOfStack = function () {
        // the initial value of the stack pointer. before you read or write to it, you must decrement the stack pointer.
        return options.baseAddress;
    };
}

// Public functions
/**
 * Get a byte at a specified address
 * @param  {Number} pointer The address the wanted data lives
 * @return {Number} Requested data
 */
Stack.prototype.getByte = function (pointer) {
    return this.getDataAtAddress(pointer, this.BYTES_PER_BYTE);
};
/**
 * Get an unsigned byte at the specified address
 * @param  {Number} pointer Address where you want data from.
 * @return {Number} Data at address.
 */
Stack.prototype.getUnsignedByte = function (pointer) {
    return this.getDataAtAddress(pointer, this.BYTES_PER_BYTE, true);
};
/**
 * Get one half word (16 bits if word is 32) at a given address
 * @param  {Number} pointer Address where data lives
 * @return {Number} Retrieved data
 */
Stack.prototype.getHalfword = function (pointer) {
    return this.getDataAtAddress(pointer, this.BYTES_PER_HALFWORD);
};
/**
 * Get unsigned half word (16 bits if word is 32) at a given address
 * @param  {Number} pointer Address where data lives
 * @return {Number} Retrieved data
 */
Stack.prototype.getUnsignedHalfword = function (pointer) {
    return this.getDataAtAddress(pointer, this.BYTES_PER_HALFWORD, true);
};
/**
 * Get word at a given address
 * @param  {Number} pointer Address where data lives
 * @return {Number} Retrieved data
 */
Stack.prototype.getWord = function (pointer) {
    return this.getDataAtAddress(pointer, this.BYTES_PER_WORD);
};
/**
 * Get unsigned word at a given address
 * @param  {Number} pointer Address where data lives
 * @return {Number} Retrieved data
 */
Stack.prototype.getUnsignedWord = function (pointer) {
    return this.getDataAtAddress(pointer, this.BYTES_PER_WORD, true);
};
/**
 * Set a byte at given address
 * @param {Number} pointer The address with data you want to set
 * @param {Number} data The data you want to write to the address
 */
Stack.prototype.setByte = function (pointer, data) {
    this.setDataAtAddress(pointer, this.BYTES_PER_BYTE, data);
};

/**
 * Set half word at given address
 * @param {Number} pointer Address to overwrite with half word of data
 * @param {Number} data Data to write to address
 */
Stack.prototype.setHalfword = function (pointer, data) {
    this.setDataAtAddress(pointer, this.BYTES_PER_HALFWORD, data);
};

/**
 * Set word at given address
 * @param {Number} pointer where data will be written
 * @param {Number} data Data to be written to the address
 */
Stack.prototype.setWord = function (pointer, data) {
    this.setDataAtAddress(pointer, this.BYTES_PER_WORD, data);
};
