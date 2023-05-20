function MemoryError(message) {
    this.name = MemoryError.exceptionName();
    this.message = message;
}
MemoryError.exceptionName = function() {
    return 'Stack Error';
}
MemoryError.prototype.toString = function() {
    return '{0}: {1}'.format(MemoryError.exceptionName(), this.message);
}

/**
 * @class MemoryBase
 * @param {Object} options constructor options
 * - options.onChange A function to be called when a stack address changes.
 * - options.baseAddress The default base address.
 * 
 * Subclasses must implement
 * - getMinValidAddress()
 * - getMaxValidAddress()
 */
function MemoryBase(options) {
    var BITS_PER_REGISTER = 32; // TODO: get this from somewhere else?
    var MIN_ADDRESS = MIPS.minUnsignedValue(BITS_PER_REGISTER);
    var MAX_ADDRESS = MIPS.maxUnsignedValue(BITS_PER_REGISTER - 1); // TODO: shouldn't need minus 1

    // Returns a random integer between min and max
    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    }

    options = options || {};
    _.defaults(options, {
        /**
         * Function to call when memory contents change. (e.g. onChange(indexNumber))
         * @member MemoryBase
         * @type {Function}
         */
        onChange: null,
        /**
         * Function to call when the memory gets extended. (e.g. onAdd(indexNumber))
         * @member MemoryBase
         * @type {Function}
         */
        onAdd: null,
        baseAddress: getRandomInt(12500, MAX_ADDRESS/4)*4
    });
    assert(MIN_ADDRESS <= options.baseAddress && options.baseAddress <= MAX_ADDRESS, "Memory addresses must be able to be stored in a register, thus they cannot exceed the register bounds.");

    // Private memebers

    var that = this; // see http://javascript.crockford.com/private.html

    // The stack will be implemented as a single array where each
    // element will store a single byte (e.g. a number between 0 and 255).
    var data = [];

    function extendToIndex(index) {
        // ensure this index is accessible
        var numElementsToAdd = index - data.length + 1;
        for (var i = 0; i < numElementsToAdd; i++) {
            var randomNumFrom0to255 = Math.floor((Math.random()*256));
            data.push(randomNumFrom0to255);
            if (options.onAdd) options.onAdd(data.length - 1);
        }
    }
    function isValidAddress(address) {
        return (that.getMinValidAddress() <= address && address <= that.getMaxValidAddress());
    }
    this.getBaseAddress = function() {
        return options.baseAddress;
    }
    this.getByteAtAddress = function(address) {
        assert(typeof address == "number");
        if (!isValidAddress(address)) {
            throw new MemoryError('Invalid memory address ({0}). Valid memory addresses are between {1} and {2}.'.format(address, this.getMinValidAddress(), this.getMaxValidAddress()));
        }
        let index = this.indexForAddress(address);
        extendToIndex(index);
        return data[index];
    }
    this.setByteAtAddress = function(address, byte) {
        assert(typeof address == "number");
        if (!isValidAddress(address)) {
            throw new MemoryError('Invalid memory address ({0}). Valid memory addresses are between {1} and {2}.'.format(address, this.getMinValidAddress(), this.getMaxValidAddress()));
        }
        assert(typeof byte === "number");
        assert(0 <= byte && byte <= 255);
        let index = this.indexForAddress(address);
        extendToIndex(index);
        data[index] = byte;
        if (options.onChange) options.onChange(address, byte);
    }
    /**
     * Clear the data contained in the memory object
     * @return {null}
     */
    this.reset = function() {
        data = [];
    };
}

function Stack(options) {
    MemoryBase.call(this, options);
}
Object.setPrototypeOf(Stack.prototype, MemoryBase.prototype);
/**
 * Get a pointer to the address at the bottom of the stack
 * @return {Number} Address to the bottom of the stack
 */
Stack.prototype.pointerToBottomOfStack = function() {
    // the initial value of the stack pointer. before you read or write to it, you must decrement the stack pointer.
    return this.getBaseAddress();
}
Stack.prototype.indexForAddress = function (address) {
    return this.getMaxValidAddress() - address;
}
Stack.prototype.getMinValidAddress = function() {
    return 0;
}
Stack.prototype.getMaxValidAddress = function() {
    return this.getBaseAddress()-1;
}

function Heap(options) {
    options = options || {}
    _.defaults(options, {
        initialSize: 0,
        onAdjustSize: null
    })
    MemoryBase.call(this, options);
    this.size = options.initialSize;

    this.adjustSize = function(adjustAmount) {
        var oldEnd = this.getMaxValidAddress();
        assert (this.size + adjustAmount >= 0);
        this.size = this.size + adjustAmount;
        if (options.onAdjustSize) options.onAdjustSize(this.size);
        return oldEnd;
    }
}
Object.setPrototypeOf(Heap.prototype, MemoryBase.prototype);
Heap.prototype.indexForAddress = function (address) {
    return address - this.getBaseAddress();
}
Heap.prototype.getMinValidAddress = function() {
    return this.getBaseAddress();
}
Heap.prototype.getMaxValidAddress = function() {
    return this.getBaseAddress() + this.size-1;
}

/**
 * @class CombinedMemory
 * 
 * A memory entity that is constructed from the combination of a set of memories.
 * Each access is routed to the first memory that contains the address between its
 * min and maximum addresses.
 * 
 * @param {Array} memories 
 */
function CombinedMemory(memories) {
    let minAddress = memories.map(m => m.getMinValidAddress()).reduce((m1, m2) => Math.min(m1, m2));
    let maxAddress = memories.map(m => m.getMaxValidAddress()).reduce((m1, m2) => Math.max(m1, m2));

    this.getMinValidAddress = function() {
        return minAddress;
    }
    this.getMaxValidAddress = function() {
        return maxAddress;
    }
    function getAccessedMemory(address) {
        let accessedMemory =  memories.find(mem => (mem.getMinValidAddress() <= address && address <= mem.getMaxValidAddress()));
        if (typeof accessedMemory == 'undefined') {
            throw new MemoryError("Invalid Memory Address {0}: No memory associated with the given address".format(address));
        }
        return accessedMemory;
    }
    this.getByteAtAddress = function(address) {
        return getAccessedMemory(address).getByteAtAddress(address);
    }
    this.setByteAtAddress = function(address, value) {
        return getAccessedMemory(address).setByteAtAddress(address, value);
    }
    this.reset = function() {
        for (memory of memories) {
            memory.reset();
        }
    }
};

/**
 * @class BigEndianAccess
 * Provides word and half-word access in big-endian-order to a byte-based memory delegate
 * 
 * @param {Object} delegate   The delegate to access
 */
function BigEndianAccess(delegate) {
    // Public variables

    this.MIN_BYTE_VALUE = 0;
    this.MAX_BYTE_VALUE = 255;
    this.BITS_PER_BYTE = 8;
    this.BYTES_PER_BYTE = 1;
    this.BYTES_PER_HALFWORD = 2;
    this.BYTES_PER_WORD = 4;

    this.reset = delegate.reset;
    this.pointerToBottomOfStack = delegate.pointerToBottomOfStack;
    this.getMinValidAddress = delegate.getMinValidAddress;
    this.getMaxValidAddress = delegate.getMaxValidAddress;
    this.getBaseAddress = delegate.getBaseAddress;
    this.getByteAtAddress = delegate.getByteAtAddress;
    this.setByteAtAddress = delegate.setByteAtAddress;
    this.indexForAddress = delegate.indexForAddress;
}

// Public functions
/**
 * Get a given number of bytes at an address
 * @param  {Number} address    The starting address for your data
 * @param  {Number} byteCount  How many bytes of data you want returned
 * @param  {Boolean} asUnsigned True if you want the number returned without a sign extension.
 * @return {Number}
 */
BigEndianAccess.prototype.getDataAtAddress = function (address, byteCount, asUnsigned) {
    asUnsigned = asUnsigned || false;
    var result = 0;
    for (var i = 0; i < byteCount; i++) {
        var value = this.getByteAtAddress(address + i);
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
BigEndianAccess.prototype.setDataAtAddress = function(address, byteCount, data) {
    assert(typeof data === "number", "Only numbers supported.");
    var bitCount = byteCount * this.BITS_PER_BYTE;
    assert(0 <= bitCount && bitCount <= 32, "The & operator will only work for up to 32 bits.");

    /* We check the range as allowed by the given number of bits in either
        * unsigned or (twos complement) signed representation.
        */
    var minValidValue = MIPS.minSignedValue(bitCount);
    var maxValidValue = MIPS.maxUnsignedValue(bitCount);
    if (data < minValidValue || maxValidValue < data) {
        throw new MemoryError('Unable to store out-of-range value ({0}). Valid values are {1} through {2}.'.format(data, minValidValue, maxValidValue));
    };

    /* Ensure that the actual data is unsigned so we can split it up into its bytes.
        * It will then be in the valid range of bitCount bits unsigned integer due to the
        * check above. */
    if (data < 0) {
        // convert negative value to positive one
        try {
            data = MIPS.signedNumberToUnsignedNumber(data, bitCount);
        } catch (e) {
            if (e instanceof MipsError) {
                throw new MemoryError(e.message);
            } else {
                throw e;
            }
        }
    }

    /* Split it up into the respective bytes */
    for (var i = byteCount - 1; i >= 0; i--) {
        var rightMostByte = data & this.MAX_BYTE_VALUE;
        this.setByteAtAddress(address + i, rightMostByte);
        data = data >>> this.BITS_PER_BYTE;
    };
};

/**
 * Get a byte at a specified address
 * @param  {Number} pointer The address the wanted data lives
 * @return {Number} Requested data
 */
BigEndianAccess.prototype.getByte = function (pointer) {
    return this.getDataAtAddress(pointer, this.BYTES_PER_BYTE);
};
/**
 * Get an unsigned byte at the specified address
 * @param  {Number} pointer Address where you want data from.
 * @return {Number} Data at address.
 */
BigEndianAccess.prototype.getUnsignedByte = function (pointer) {
    return this.getDataAtAddress(pointer, this.BYTES_PER_BYTE, true);
};
/**
 * Get one half word (16 bits if word is 32) at a given address
 * @param  {Number} pointer Address where data lives
 * @return {Number} Retrieved data
 */
BigEndianAccess.prototype.getHalfword = function (pointer) {
    return this.getDataAtAddress(pointer, this.BYTES_PER_HALFWORD);
};
/**
 * Get unsigned half word (16 bits if word is 32) at a given address
 * @param  {Number} pointer Address where data lives
 * @return {Number} Retrieved data
 */
BigEndianAccess.prototype.getUnsignedHalfword = function (pointer) {
    return this.getDataAtAddress(pointer, this.BYTES_PER_HALFWORD, true);
};
/**
 * Get word at a given address
 * @param  {Number} pointer Address where data lives
 * @return {Number} Retrieved data
 */
BigEndianAccess.prototype.getWord = function (pointer) {
    return this.getDataAtAddress(pointer, this.BYTES_PER_WORD);
};
/**
 * Get unsigned word at a given address
 * @param  {Number} pointer Address where data lives
 * @return {Number} Retrieved data
 */
BigEndianAccess.prototype.getUnsignedWord = function (pointer) {
    return this.getDataAtAddress(pointer, this.BYTES_PER_WORD, true);
};
/**
 * Set a byte at given address
 * @param {Number} pointer The address with data you want to set
 * @param {Number} data The data you want to write to the address
 */
BigEndianAccess.prototype.setByte = function (pointer, data) {
    this.setDataAtAddress(pointer, this.BYTES_PER_BYTE, data);
};

/**
 * Set half word at given address
 * @param {Number} pointer Address to overwrite with half word of data
 * @param {Number} data Data to write to address
 */
BigEndianAccess.prototype.setHalfword = function (pointer, data) {
    this.setDataAtAddress(pointer, this.BYTES_PER_HALFWORD, data);
};

/**
 * Set word at given address
 * @param {Number} pointer where data will be written
 * @param {Number} data Data to be written to the address
 */
BigEndianAccess.prototype.setWord = function (pointer, data) {
    this.setDataAtAddress(pointer, this.BYTES_PER_WORD, data);
};
